import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import {
  AdminOrderNotFoundError,
  AdminOrderTransitionError,
  getAdminOrder,
  updateAdminOrder,
} from "@/lib/services/admin-order.service";

import { updateAdminOrderSchema } from "@/schemas/admin-order.schema";

type AdminOrderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: AdminOrderRouteContext,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await context.params;

  try {
    const order =
      await getAdminOrder(id);

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (
      error instanceof
      AdminOrderNotFoundError
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
      "Admin order GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Order could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: AdminOrderRouteContext,
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
    updateAdminOrderSchema.safeParse(
      body,
    );

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid order update data.",

        errors:
          bodyResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const order =
      await updateAdminOrder(
        authorization.user.id,
        id,
        bodyResult.data,
      );

    return NextResponse.json({
      success: true,
      data: order,
      message:
        "Order updated successfully.",
    });
  } catch (error) {
    if (
      error instanceof
      AdminOrderNotFoundError
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
      AdminOrderTransitionError
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
      "Admin order PATCH error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Order could not be updated.",
      },
      {
        status: 500,
      },
    );
  }
}