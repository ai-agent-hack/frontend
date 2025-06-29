"use server";

import "server-only";

import { cookies } from "next/headers";

export const getMyTrips = async () => {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session) {
    throw new Error("Session not found");
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiBaseUrl}/pre_info/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `session=${session.value}`,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Failed to fetch trips:", errorBody);
    throw new Error(`Failed to fetch trips: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
};
