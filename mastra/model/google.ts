import { createVertex } from "@ai-sdk/google-vertex";

// Private key 처리를 더 안전하게 개선
const getPrivateKey = () => {
    const key = process.env.GOOGLE_PRIVATE_KEY;
    if (!key) return undefined;

    // 이미 줄바꿈이 있는 경우와 \\n 문자열인 경우 모두 처리
    return key.includes("\n") ? key : key.replace(/\\n/g, "\n");
};

// Cloud Run에서는 Application Default Credentials 사용
const useADC = process.env.NODE_ENV === "production";

export const vertex = createVertex({
    location: "us-central1",
    project: process.env.GOOGLE_PROJECT_ID,
    googleAuthOptions: useADC
        ? {
              // Cloud Run에서는 Service Account가 자동으로 설정됨
          }
        : {
              credentials: {
                  type: "service_account",
                  project_id: process.env.GOOGLE_PROJECT_ID,
                  client_email: process.env.GOOGLE_CLIENT_EMAIL,
                  private_key: getPrivateKey(),
              },
          },
});
