import { NextResponse } from "next/server";

import {
  deleteSession,
  getSession,
} from "@/lib/auth/session";

import { createAuditLogSafely } from "@/lib/services/audit.service";

export async function POST(
  request: Request,
) {
  const session = await getSession();

  try {
    await deleteSession();

    await createAuditLogSafely({
      request,

      userId:
        session?.userId ?? null,

      action: "LOGOUT",
      entity: "AUTH",

      entityId:
        session?.userId ?? null,

      description: session
        ? `${session.email} logged out.`
        : "An anonymous logout request was completed.",

      metadata: session
        ? {
            email:
              session.email,

            role:
              session.role,
          }
        : {
            anonymous: true,
          },
    });

    return NextResponse.json({
      success: true,

      message:
        "Logout successful.",
    });
  } catch (error) {
    console.error(
      "Logout error:",
      error,
    );

    await createAuditLogSafely({
      request,

      userId:
        session?.userId ?? null,

      action:
        "LOGOUT_FAILED",

      entity: "AUTH",

      entityId:
        session?.userId ?? null,

      description:
        "Logout could not be completed.",

      status: "FAILED",
    });

    return NextResponse.json(
      {
        success: false,

        message:
          "Logout could not be completed.",
      },
      {
        status: 500,
      },
    );
  }
}