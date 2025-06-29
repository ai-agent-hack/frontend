# Frontend Cloud Run 배포 가이드

이 가이드는 Next.js frontend 애플리케이션을 Google Cloud Run에 배포하는 방법을 설명합니다.

## 사전 요구사항

1. Google Cloud SDK (gcloud) 설치 및 로그인
2. Docker 설치
3. Google Cloud 프로젝트 설정

## 배포 단계

### 1. Google Cloud 로그인 및 프로젝트 설정

```bash
# Google Cloud에 로그인
gcloud auth login

# Docker 인증 설정
gcloud auth configure-docker

# 프로젝트 설정
gcloud config set project ai-agent-hack
```

### 2. 배포 스크립트 실행

```bash
cd frontend
./deploy.sh
```

### 3. 배포 과정

배포 스크립트는 다음 단계를 자동으로 수행합니다:

1. Docker 이미지 빌드
2. Google Container Registry에 이미지 푸시
3. 환경변수와 함께 Cloud Run에 배포

### 4. 환경변수 확인

다음 환경변수들이 자동으로 설정됩니다:

- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
- `GOOGLE_PROJECT_ID`
- `MASTRA_DEBUG`
- `NEXT_PUBLIC_API_URL`
- Firebase 관련 환경변수들
- `FIRECRAWL_API_KEY`
- Google 인증 관련 환경변수들

## 수동 배포 (선택사항)

자동 스크립트 대신 수동으로 배포하려면:

```bash
# 1. Docker 이미지 빌드
docker build -t gcr.io/ai-agent-hack/frontend-service .

# 2. 이미지 푸시
docker push gcr.io/ai-agent-hack/frontend-service

# 3. Cloud Run에 배포
gcloud run deploy frontend-service \
  --image gcr.io/ai-agent-hack/frontend-service \
  --platform managed \
  --region asia-northeast1 \
  --allow-unauthenticated \
  --port 3000 \
  --set-env-vars "NEXT_PUBLIC_API_URL=https://fastapi-backend-900145575342.asia-northeast1.run.app/api/v1"
```

## 배포 후 확인

1. Cloud Run 콘솔에서 서비스 상태 확인
2. 제공된 URL로 애플리케이션 접속 테스트
3. 로그 확인: `gcloud logs tail --follow --resource cloud_run_revision --source-type gce_instance`

## 트러블슈팅

### 빌드 오류

- `bun install` 실패 시: Docker 이미지에서 bun 설치 확인
- 메모리 부족: Cloud Run 메모리 설정 증가

### 환경변수 오류

- 환경변수 확인: `gcloud run services describe frontend-service --region=asia-northeast1`
- 환경변수 업데이트: `gcloud run services update frontend-service --set-env-vars KEY=VALUE`

### 네트워크 오류

- API 엔드포인트 연결 확인
- CORS 설정 확인

## 업데이트

코드 변경 후 재배포:

```bash
./deploy.sh
```

## 비용 최적화

- 최소 인스턴스 수: 0 (기본값)
- 최대 동시 요청 수: 1000 (기본값)
- CPU 할당: 요청 처리 시에만 (기본값)
