import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth/session";

import {
  createRateLimitResponse,
  consumeRequestRateLimit,
  getRateLimitHeaders,
  RATE_LIMIT_POLICIES,
} from "@/lib/security/rate-limit";

import { createAuditLogSafely } from "@/lib/services/audit.service";

import {
  AccountDisabledError,
  authenticateUser,
  InvalidCredentialsError,
} from "@/lib/services/auth.service";

import { loginSchema } from "@/schemas/auth.schema";

export async function POST(
  request: Request,
) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,

        message:
          "Request body must contain valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const bodyResult =
    loginSchema.safeParse(body);

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid login data.",

        errors:
          bodyResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  const email =
    bodyResult.data.email
      .trim()
      .toLowerCase();

  const rateLimit =
    await consumeRequestRateLimit(
      request,
      RATE_LIMIT_POLICIES.login,
      email,
    );

  if (!rateLimit.allowed) {
    await createAuditLogSafely({
      request,

      action:
        "LOGIN_RATE_LIMITED",

      entity: "AUTH",

      description:
        `Login rate limit was reached for ${email}.`,

      status: "FAILED",

      metadata: {
        email,

        retryAfterSeconds:
          rateLimit.retryAfterSeconds,
      },
    });

    return createRateLimitResponse(
      rateLimit,
    );
  }

  try {
    const user =
      await authenticateUser(
        bodyResult.data,
      );

    await createSession(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },

      bodyResult.data.rememberMe,
    );

    await createAuditLogSafely({
      request,

      userId: user.id,

      action: "LOGIN",
      entity: "AUTH",

      entityId: user.id,

      description:
        `${user.email} logged in successfully.`,

      metadata: {
        email: user.email,
        role: user.role,
        rememberMe:
          bodyResult.data.rememberMe,
      },
    });

    return NextResponse.json(
      {
        success: true,

        data: {
          user,
        },

        message:
          "Login successful.",
      },
      {
        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  } catch (error) {
    if (
      error instanceof
      InvalidCredentialsError
    ) {
      await createAuditLogSafely({
        request,

        action:
          "LOGIN_FAILED",

        entity: "AUTH",

        description:
          `A failed login attempt was made for ${email}.`,

        status: "FAILED",

        metadata: {
          email,
          reason:
            "INVALID_CREDENTIALS",
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 401,

          headers:
            getRateLimitHeaders(
              rateLimit,
            ),
        },
      );
    }

    if (
      error instanceof
      AccountDisabledError
    ) {
      await createAuditLogSafely({
        request,

        action:
          "LOGIN_FAILED",

        entity: "AUTH",

        description:
          `A disabled account attempted to log in: ${email}.`,

        status: "FAILED",

        metadata: {
          email,
          reason:
            "ACCOUNT_DISABLED",
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 403,

          headers:
            getRateLimitHeaders(
              rateLimit,
            ),
        },
      );
    }

    console.error(
      "Login error:",
      error,
    );

    await createAuditLogSafely({
      request,

      action:
        "LOGIN_FAILED",

      entity: "AUTH",

      description:
        `Login could not be completed for ${email}.`,

      status: "FAILED",

      metadata: {
        email,
        reason:
          "INTERNAL_ERROR",
      },
    });

    return NextResponse.json(
      {
        success: false,

        message:
          "Login could not be completed.",
      },
      {
        status: 500,

        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  }
}