import { NextResponse } from "next/server";

import { createSession } from "@/lib/auth/session";

import {
  EmailAlreadyExistsError,
  registerUser,
} from "@/lib/services/auth.service";

import { registerSchema } from "@/schemas/auth.schema";

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

  const bodyResult = registerSchema.safeParse(body);

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid registration data.",
        errors: bodyResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const user = await registerUser(bodyResult.data);

    await createSession(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      false,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
        },
        message: "Account created successfully.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (error instanceof EmailAlreadyExistsError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 409,
        },
      );
    }

    console.error("Register error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Account could not be created.",
      },
      {
        status: 500,
      },
    );
  }
}