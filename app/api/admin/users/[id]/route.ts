import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import {
  AdminUserManagementError,
  AdminUserNotFoundError,
  getAdminUser,
  updateAdminUser,
} from "@/lib/services/user.service";

import { updateAdminUserSchema } from "@/schemas/admin-user.schema";

type AdminUserRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: AdminUserRouteContext,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await context.params;

  try {
    const user =
      await getAdminUser(id);

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (
      error instanceof
      AdminUserNotFoundError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 404,
        },
      );
    }

    console.error(
      "Admin user GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "User could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: AdminUserRouteContext,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await context.params;

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
    updateAdminUserSchema.safeParse(
      body,
    );

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid user update data.",

        errors:
          bodyResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const user =
      await updateAdminUser(
        authorization.user.id,
        id,
        bodyResult.data,
      );

    return NextResponse.json({
      success: true,
      data: user,
      message:
        "User updated successfully.",
    });
  } catch (error) {
    if (
      error instanceof
      AdminUserNotFoundError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 404,
        },
      );
    }

    if (
      error instanceof
      AdminUserManagementError
    ) {
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

    console.error(
      "Admin user PATCH error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "User could not be updated.",
      },
      {
        status: 500,
      },
    );
  }
}