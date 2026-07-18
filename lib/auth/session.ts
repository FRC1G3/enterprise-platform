import { cookies } from "next/headers";

import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/jwt";

import type { AuthSession } from "@/types/auth";

export const SESSION_COOKIE_NAME = "nova_session";

const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
const SEVEN_DAYS_IN_SECONDS = ONE_DAY_IN_SECONDS * 7;

function getSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function createSession(
  session: AuthSession,
  rememberMe = false,
): Promise<void> {
  const maxAge = rememberMe
    ? SEVEN_DAYS_IN_SECONDS
    : ONE_DAY_IN_SECONDS;

  const token = await createSessionToken(
    session,
    rememberMe ? "7d" : "1d",
  );

  const cookieStore = await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    getSessionCookieOptions(maxAge),
  );
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    ...getSessionCookieOptions(0),
    expires: new Date(0),
  });
}