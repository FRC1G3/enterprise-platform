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

import { createAuditLogSafely } from "@/lib/services/audit.service";

import {
  createOrder,
  EmptyCartError,
  listOrdersForUser,
  OrderStockError,
} from "@/lib/services/order.service";

import {
  createOrderSchema,
  idempotencyKeySchema,
} from "@/schemas/order.schema";

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
    await createAuditLogSafely({
      request,
      userId:
        authorization.user.id,
      action:
        "CREATE_ORDER_RATE_LIMITED",
      entity: "ORDER",
      description:
        "Order creation was rate limited.",
      status: "FAILED",
      metadata: {
        retryAfterSeconds:
          rateLimit.retryAfterSeconds,
      },
    });

    return createRateLimitResponse(
      rateLimit,
    );
  }

  const rateLimitHeaders =
    getRateLimitHeaders(rateLimit);

  const idempotencyKeyResult =
    idempotencyKeySchema.safeParse(
      request.headers.get(
        "Idempotency-Key",
      ),
    );

  if (!idempotencyKeyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "A valid Idempotency-Key header is required.",
        errors:
          idempotencyKeyResult.error.flatten(),
      },
      {
        status: 400,
        headers: rateLimitHeaders,
      },
    );
  }

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
    const result = await createOrder(
      authorization.user.id,
      idempotencyKeyResult.data,
      bodyResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        data: result.order,

        message: result.replayed
          ? "Existing order returned for this checkout."
          : "Order placed successfully.",
      },
      {
        status:
          result.replayed ? 200 : 201,
        headers: {
          ...rateLimitHeaders,
          "Idempotency-Replayed":
            String(result.replayed),
        },
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
