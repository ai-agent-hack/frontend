# Use Node.js official image (Debian-based for better LibSQL compatibility)
FROM node:18-slim AS base

# Install dependencies only when needed
FROM base AS deps
# Install system dependencies for LibSQL
# Add ca-certificates to fix potential GPG key issues during apt-get update
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && \
    apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json ./
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time arguments from Secret Manager
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NODE_ENV=production

# Set environment variables from build arguments
ENV NODE_ENV=$NODE_ENV
ENV GOOGLE_VERTEX_PROJECT=ai-agent-hack
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID

# Build the application
RUN npm run build


# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# This is the crucial fix: set NODE_ENV in the final runner stage
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Before creating a non-root user, create the .next directory and set its permissions
RUN mkdir -p .next && chown -R 1001:1001 .next

# Create user and group for security
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# This is the crucial fix: copy the native LibSQL files that output tracing might miss
# The path is based on the platform-specific package that @libsql/client depends on.
# The `find` command on a local machine revealed the pattern is `node_modules/@libsql/<platform>/index.node`.
# For the Debian-based linux container, the platform is `linux-x64-gnu`.
RUN mkdir -p ./node_modules/@libsql/linux-x64-gnu/
COPY --from=builder /app/node_modules/@libsql/linux-x64-gnu/index.node ./node_modules/@libsql/linux-x64-gnu/

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"] 