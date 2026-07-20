import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAuthenticatedApi } from "@/lib/auth/guards";

import {
  getOrderForUser,
  OrderNotFoundError,
} from "@/lib/services/order.service";

type OrderRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: OrderRouteContext,
) {
  const authorization =
    await requireAuthenticatedApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await context.params;

  if (!id.trim()) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Order identifier is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const order = await getOrderForUser(
      authorization.user.id,
      id,
    );

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (error) {
    if (
      error instanceof
      OrderNotFoundError
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
      "Order GET error:",
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