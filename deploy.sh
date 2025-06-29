#!/bin/bash

# Frontend를 Cloud Run에 배포하는 스크립트

PROJECT_ID="ai-agent-hack"
SERVICE_NAME="VibePlanning"
REGION="asia-northeast1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "Building Docker image..."

# Load environment variables from .env file (excluding GOOGLE_PRIVATE_KEY)
if [ -f ./.env ]; then
    export $(grep -v '^#' ./.env | grep -v 'GOOGLE_PRIVATE_KEY' | xargs)
    echo "Loaded environment variables from .env file"
    echo "NEXT_PUBLIC_FIREBASE_API_KEY: ${NEXT_PUBLIC_FIREBASE_API_KEY:0:10}..."
else
    echo "Warning: .env file not found!"
fi

docker build --platform linux/amd64 -t $IMAGE_NAME \
  --build-arg GOOGLE_PROJECT_ID="$GOOGLE_PROJECT_ID" \
  --build-arg GOOGLE_VERTEX_PROJECT="$GOOGLE_PROJECT_ID" \
  --build-arg NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" \
  --build-arg NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY="$NEXT_PUBLIC_FIREBASE_API_KEY" \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID="$NEXT_PUBLIC_FIREBASE_PROJECT_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID="$NEXT_PUBLIC_FIREBASE_APP_ID" \
  --build-arg GOOGLE_CLIENT_EMAIL="$GOOGLE_CLIENT_EMAIL" \
  --build-arg MASTRA_DEBUG="$MASTRA_DEBUG" \
  --build-arg FIRECRAWL_API_KEY="$FIRECRAWL_API_KEY" \
  --build-arg GOOGLE_PRIVATE_KEY="$GOOGLE_PRIVATE_KEY" \
  .

echo "Pushing image to Google Container Registry..."
docker push $IMAGE_NAME

echo "Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image $IMAGE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000

echo "Deployment completed!"
echo "Your frontend should be available at the Cloud Run URL." 