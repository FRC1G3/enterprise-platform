import { NextResponse } from "next/server";

import {
  deleteSession,
  getSession,
} from "@/lib/auth/session";

import {
  getAuthenticatedUser,
  InvalidSessionError,
} from "@/lib/services/auth.service";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        message: "Authentication is required.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const user = await getAuthenticatedUser(
      session.userId,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          user,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      await deleteSession();

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

    console.error("Current user error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "User information could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}