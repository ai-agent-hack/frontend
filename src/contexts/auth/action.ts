export interface FirebaseUserCreate {
  firebase_token: string;
  username: string;
  email: string;
}

export interface FirebaseAuth {
  firebase_token: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export async function firebaseSignup(
  firebaseToken: string,
  username: string,
): Promise<User> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firebase_token: firebaseToken,
        username,
      } as FirebaseUserCreate),
    },
  );

  console.log("Firebase signup response:", response);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.[0]?.msg ||
        `Signup failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<User>;
}

export async function firebaseLogin(firebaseToken: string): Promise<User> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firebase_token: firebaseToken,
      } as FirebaseAuth),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.[0]?.msg ||
        `Login failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<User>;
}

export async function getCurrentUserInfo(
  firebaseToken?: string,
): Promise<User> {
  const headers: Record<string, string> = {};

  if (firebaseToken) {
    headers["Firebase-Token"] = firebaseToken;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/me`,
    {
      method: "GET",
      headers,
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.[0]?.msg ||
        `Failed to get user info with status ${response.status}`,
    );
  }

  return response.json() as Promise<User>;
}

export async function firebaseSessionLogin(
  firebaseToken: string,
): Promise<User> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/session-login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firebase_token: firebaseToken,
      } as FirebaseAuth),
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.[0]?.msg ||
        `Session login failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<User>;
}

export async function firebaseSessionLogout(): Promise<void> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/logout`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.[0]?.msg ||
        `Session logout failed with status ${response.status}`,
    );
  }
}
