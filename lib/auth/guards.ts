import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";

import {
  getAuthenticatedUser,
  InvalidSessionError,
} from "@/lib/services/auth.service";

import type { AuthUser } from "@/types/auth";

export class AuthenticationRequiredError extends Error {
  constructor() {
    super("Authentication is required.");
    this.name = "AuthenticationRequiredError";
  }
}

export class AdminRequiredError extends Error {
  constructor() {
    super("Administrator access is required.");
    this.name = "AdminRequiredError";
  }
}

export async function requireAuthenticatedUser(): Promise<AuthUser> {
  const session = await getSession();

  if (!session) {
    throw new AuthenticationRequiredError();
  }

  try {
    return await getAuthenticatedUser(
      session.userId,
    );
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      throw new AuthenticationRequiredError();
    }

    throw error;
  }
}

export async function requireAdminUser(): Promise<AuthUser> {
  const user = await requireAuthenticatedUser();

  if (user.role !== "ADMIN") {
    throw new AdminRequiredError();
  }

  return user;
}

type AuthenticatedApiGuardResult =
  | {
      authorized: true;
      user: AuthUser;
    }
  | {
      authorized: false;
      response: NextResponse;
    };

export async function requireAuthenticatedApi(): Promise<AuthenticatedApiGuardResult> {
  try {
    const user =
      await requireAuthenticatedUser();

    return {
      authorized: true,
      user,
    };
  } catch (error) {
    if (
      error instanceof
      AuthenticationRequiredError
    ) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            success: false,
            message: error.message,
          },
          {
            status: 401,
          },
        ),
      };
    }

    throw error;
  }
}

type AdminApiGuardResult =
  | {
      authorized: true;
      user: AuthUser;
    }
  | {
      authorized: false;
      response: NextResponse;
    };

export async function requireAdminApi(): Promise<AdminApiGuardResult> {
  const authorization =
    await requireAuthenticatedApi();

  if (!authorization.authorized) {
    return authorization;
  }

  if (authorization.user.role !== "ADMIN") {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          message:
            "Administrator access is required.",
        },
        {
          status: 403,
        },
      ),
    };
  }

  return authorization;
}