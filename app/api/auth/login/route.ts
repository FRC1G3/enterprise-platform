import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth/session";

import {
  AccountDisabledError,
  authenticateUser,
  InvalidCredentialsError,
} from "@/lib/services/auth.service";

import { loginSchema } from "@/schemas/auth.schema";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Request body must contain valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const bodyResult = loginSchema.safeParse(body);

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid login data.",
        errors: bodyResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const user = await authenticateUser(
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

    return NextResponse.json({
      success: true,
      data: {
        user,
      },
      message: "Login successful.",
    });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 401,
        },
      );
    }

    if (error instanceof AccountDisabledError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 403,
        },
      );
    }

    console.error("Login error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Login could not be completed.",
      },
      {
        status: 500,
      },
    );
  }
}