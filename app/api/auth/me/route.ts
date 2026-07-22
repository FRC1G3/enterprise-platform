import { NextResponse } from "next/server";

import {
  createSession,
  deleteSession,
  getSession,
  refreshSessionIfNeeded,
} from "@/lib/auth/session";

import {
  getAuthenticatedUser,
  InvalidSessionError,
} from "@/lib/services/auth.service";

export async function GET() {
  const session =
    await getSession();

  if (!session) {
    return NextResponse.json(
      {
        success: false,

        message:
          "Authentication is required.",
      },
      {
        status: 401,

        headers: {
          "Cache-Control":
            "private, no-store",
        },
      },
    );
  }

  try {
    const user =
      await getAuthenticatedUser(
        session.userId,
      );

    const sessionIdentityChanged =
      session.email !== user.email ||
      session.role !== user.role;

    let sessionRefreshed = false;

    if (sessionIdentityChanged) {
      await createSession(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        session.rememberMe,
      );

      sessionRefreshed = true;
    } else {
      sessionRefreshed =
        await refreshSessionIfNeeded(
          session,
        );
    }

    return NextResponse.json(
      {
        success: true,

        data: {
          user,
        },
      },
      {
        headers: {
          "Cache-Control":
            "private, no-store",

          Vary: "Cookie",

          "X-Session-Refreshed":
            String(
              sessionRefreshed,
            ),
        },
      },
    );
  } catch (error) {
    if (
      error instanceof
      InvalidSessionError
    ) {
      await deleteSession();

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 401,

          headers: {
            "Cache-Control":
              "private, no-store",
          },
        },
      );
    }

    console.error(
      "Current user error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "User information could not be loaded.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "private, no-store",
        },
      },
    );
  }
}