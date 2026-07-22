import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAuthenticatedApi } from "@/lib/auth/guards";

import {
  createRateLimitResponse,
  consumeRequestRateLimit,
  getRateLimitHeaders,
  RATE_LIMIT_POLICIES,
} from "@/lib/security/rate-limit";

import {
  createOrder,
  EmptyCartError,
  listOrdersForUser,
  OrderStockError,
} from "@/lib/services/order.service";

import { createOrderSchema } from "@/schemas/order.schema";

export async function GET() {
  const authorization =
    await requireAuthenticatedApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const orders =
      await listOrdersForUser(
        authorization.user.id,
      );

    return NextResponse.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error(
      "Orders GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Orders could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
) {
  const authorization =
    await requireAuthenticatedApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const rateLimit =
    await consumeRequestRateLimit(
      request,
      RATE_LIMIT_POLICIES.orderCreation,
      authorization.user.id,
    );

  if (!rateLimit.allowed) {
    return createRateLimitResponse(
      rateLimit,
    );
  }

  const rateLimitHeaders =
    getRateLimitHeaders(rateLimit);

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
        headers: rateLimitHeaders,
      },
    );
  }

  const bodyResult =
    createOrderSchema.safeParse(body);

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid checkout information.",

        errors:
          bodyResult.error.flatten(),
      },
      {
        status: 400,
        headers: rateLimitHeaders,
      },
    );
  }

  try {
    const order = await createOrder(
      authorization.user.id,
      bodyResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        data: order,

        message:
          "Order placed successfully.",
      },
      {
        status: 201,
        headers: rateLimitHeaders,
      },
    );
  } catch (error) {
    if (error instanceof EmptyCartError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 400,
          headers: rateLimitHeaders,
        },
      );
    }

    if (error instanceof OrderStockError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,

          data: {
            productName:
              error.productName,

            availableStock:
              error.availableStock,
          },
        },
        {
          status: 409,
          headers: rateLimitHeaders,
        },
      );
    }

    console.error(
      "Order POST error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Order could not be placed.",
      },
      {
        status: 500,
        headers: rateLimitHeaders,
      },
    );
  }
}