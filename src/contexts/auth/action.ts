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

export async function apiSignup(
  firebaseToken: string,
  username: string,
): Promise<User> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Firebase-Token": firebaseToken,
      },
      body: JSON.stringify({
        firebase_token: firebaseToken,
        username,
      } as FirebaseUserCreate),
      credentials: "include",
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

  const json = await response.json();
  return json.user as User;
}

export async function apiLogin(firebaseToken: string): Promise<User> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/login`,
    {
      method: "POST",
      headers: {
        "Firebase-Token": firebaseToken,
        "Content-Type": "application/json",
      },
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.[0]?.msg ||
        `Login failed with status ${response.status}`,
    );
  }

  const json = await response.json();
  return json.user as User;
}

export async function getAPIUser(): Promise<User> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/me`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.detail?.[0]?.msg ||
        `Failed to get user info with status ${response.status}`,
    );
  }

  const json = await response.json();
  return json.user as User;
}

export async function apiSessionLogin(firebaseToken: string): Promise<User> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/firebase-auth/session-login`,
    {
      method: "POST",
      headers: {
        "Firebase-Token": firebaseToken,
        "Content-Type": "application/json",
      },
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

  const json = await response.json();
  return json.user as User;
}

export async function apiLogout(): Promise<void> {
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
