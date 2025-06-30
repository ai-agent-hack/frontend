#!/bin/bash

# Frontend를 Cloud Run에 배포하는 스크립트

PROJECT_ID="ai-agent-hack"
SERVICE_NAME="vibe-planning-service"
REGION="asia-northeast1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "Building Docker image..."

echo "Fetching secrets from Google Secret Manager for build..."

# Fetch NEXT_PUBLIC_ secrets for build time (these get baked into the build)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$(gcloud secrets versions access latest --secret="google-maps-api-key")
NEXT_PUBLIC_API_URL=$(gcloud secrets versions access latest --secret="next-public-api-url")
NEXT_PUBLIC_FIREBASE_API_KEY=$(gcloud secrets versions access latest --secret="firebase-api-key")
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$(gcloud secrets versions access latest --secret="firebase-auth-domain")
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$(gcloud secrets versions access latest --secret="firebase-project-id")
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$(gcloud secrets versions access latest --secret="firebase-storage-bucket")
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$(gcloud secrets versions access latest --secret="firebase-messaging-sender-id")
NEXT_PUBLIC_FIREBASE_APP_ID=$(gcloud secrets versions access latest --secret="firebase-app-id")

echo "Building image with real NEXT_PUBLIC_ values from Secret Manager..."

docker build --no-cache --platform linux/amd64 -t $IMAGE_NAME \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="$NEXT_PUBLIC_FIREBASE_API_KEY" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="$NEXT_PUBLIC_FIREBASE_PROJECT_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="$NEXT_PUBLIC_FIREBASE_APP_ID" \
  . || { echo "Docker build failed"; exit 1; }

echo "Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

echo "Deploying to Cloud Run with vertex-ai Service Account..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000 \
  --service-account vertex-ai@ai-agent-hack.iam.gserviceaccount.com \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="GOOGLE_PROJECT_ID=ai-agent-hack" \
  --set-secrets="FIRECRAWL_API_KEY=firecrawl-api-key:latest" \
  --set-secrets="MASTRA_DEBUG=mastra-debug:latest"

echo "Deployment completed!"
echo "Your frontend should be available at the Cloud Run URL." 