import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import { listAdminUsers } from "@/lib/services/user.service";

import { adminUserQuerySchema } from "@/schemas/admin-user.schema";

export async function GET(
  request: NextRequest,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const queryResult =
    adminUserQuerySchema.safeParse(
      Object.fromEntries(
        request.nextUrl.searchParams.entries(),
      ),
    );

  if (!queryResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid user query.",

        errors:
          queryResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const users =
      await listAdminUsers(
        queryResult.data,
      );

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error(
      "Admin users GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Users could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}