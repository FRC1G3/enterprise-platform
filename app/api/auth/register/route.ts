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
  EmailAlreadyExistsError,
  registerUser,
} from "@/lib/services/auth.service";

import { registerSchema } from "@/schemas/auth.schema";

export async function POST(
  request: Request,
) {
  const rateLimit =
    await consumeRequestRateLimit(
      request,
      RATE_LIMIT_POLICIES.register,
    );

  if (!rateLimit.allowed) {
    await createAuditLogSafely({
      request,

      action:
        "REGISTER_RATE_LIMITED",

      entity: "AUTH",

      description:
        "Registration rate limit was reached.",

      status: "FAILED",

      metadata: {
        retryAfterSeconds:
          rateLimit.retryAfterSeconds,
      },
    });

    return createRateLimitResponse(
      rateLimit,
    );
  }

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

        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  }

  const bodyResult =
    registerSchema.safeParse(body);

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,

        message:
          "Invalid registration data.",

        errors:
          bodyResult.error.flatten(),
      },
      {
        status: 400,

        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  }

  const email =
    bodyResult.data.email
      .trim()
      .toLowerCase();

  try {
    const user =
      await registerUser(
        bodyResult.data,
      );

    await createSession(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },

      false,
    );

    await createAuditLogSafely({
      request,

      userId: user.id,

      action: "REGISTER",
      entity: "AUTH",

      entityId: user.id,

      description:
        `${user.email} created an account.`,

      metadata: {
        email: user.email,
        role: user.role,
      },
    });

    return NextResponse.json(
      {
        success: true,

        data: {
          user,
        },

        message:
          "Account created successfully.",
      },
      {
        status: 201,

        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  } catch (error) {
    if (
      error instanceof
      EmailAlreadyExistsError
    ) {
      await createAuditLogSafely({
        request,

        action:
          "REGISTER_FAILED",

        entity: "AUTH",

        description:
          `Registration failed because ${email} already exists.`,

        status: "FAILED",

        metadata: {
          email,
          reason:
            "EMAIL_ALREADY_EXISTS",
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 409,

          headers:
            getRateLimitHeaders(
              rateLimit,
            ),
        },
      );
    }

    console.error(
      "Register error:",
      error,
    );

    await createAuditLogSafely({
      request,

      action:
        "REGISTER_FAILED",

      entity: "AUTH",

      description:
        `Registration could not be completed for ${email}.`,

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
          "Account could not be created.",
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