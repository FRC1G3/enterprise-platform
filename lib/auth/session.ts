import { cookies } from "next/headers";

import {
  createSessionToken,
  verifySessionToken,
} from "@/lib/auth/jwt";

import type {
  AuthSession,
  VerifiedAuthSession,
} from "@/types/auth";

export const SESSION_COOKIE_NAME =
  "nova_session";

const ONE_HOUR_IN_SECONDS =
  60 * 60;

const ONE_DAY_IN_SECONDS =
  ONE_HOUR_IN_SECONDS * 24;

const SEVEN_DAYS_IN_SECONDS =
  ONE_DAY_IN_SECONDS * 7;

const SHORT_SESSION_REFRESH_THRESHOLD =
  ONE_HOUR_IN_SECONDS * 6;

const REMEMBERED_SESSION_REFRESH_THRESHOLD =
  ONE_DAY_IN_SECONDS * 2;

function getSessionMaxAge(
  rememberMe: boolean,
): number {
  return rememberMe
    ? SEVEN_DAYS_IN_SECONDS
    : ONE_DAY_IN_SECONDS;
}

function getSessionCookieOptions(
  maxAge: number,
) {
  return {
    httpOnly: true,

    secure:
      process.env.NODE_ENV ===
      "production",

    sameSite: "lax" as const,

    path: "/",
    maxAge,
  };
}

export async function createSession(
  session: AuthSession,
  rememberMe = false,
): Promise<void> {
  const maxAge =
    getSessionMaxAge(rememberMe);

  const token =
    await createSessionToken(
      session,
      rememberMe,
    );

  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    token,
    getSessionCookieOptions(
      maxAge,
    ),
  );
}

export async function getSession(): Promise<VerifiedAuthSession | null> {
  const cookieStore =
    await cookies();

  const token =
    cookieStore.get(
      SESSION_COOKIE_NAME,
    )?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function refreshSessionIfNeeded(
  session: VerifiedAuthSession,
): Promise<boolean> {
  const currentTime = Math.floor(
    Date.now() / 1000,
  );

  const remainingSeconds =
    session.expiresAt -
    currentTime;

  const refreshThreshold =
    session.rememberMe
      ? REMEMBERED_SESSION_REFRESH_THRESHOLD
      : SHORT_SESSION_REFRESH_THRESHOLD;

  if (
    remainingSeconds >
    refreshThreshold
  ) {
    return false;
  }

  await createSession(
    {
      userId: session.userId,
      email: session.email,
      role: session.role,
    },
    session.rememberMe,
  );

  return true;
}

export async function deleteSession(): Promise<void> {
  const cookieStore =
    await cookies();

  cookieStore.set(
    SESSION_COOKIE_NAME,
    "",
    {
      ...getSessionCookieOptions(0),
      expires: new Date(0),
    },
  );
}