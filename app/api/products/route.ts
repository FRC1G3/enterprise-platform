import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import {
  createRateLimitResponse,
  consumeRequestRateLimit,
  getRateLimitHeaders,
  RATE_LIMIT_POLICIES,
} from "@/lib/security/rate-limit";

import { createAuditLogSafely } from "@/lib/services/audit.service";

import {
  createProduct,
  listProducts,
  ProductConflictError,
} from "@/lib/services/product.service";

import {
  createProductSchema,
  productQuerySchema,
} from "@/schemas/product.schema";

export async function GET(
  request: NextRequest,
) {
  const queryResult =
    productQuerySchema.safeParse(
      Object.fromEntries(
        request.nextUrl.searchParams.entries(),
      ),
    );

  if (!queryResult.success) {
    return NextResponse.json(
      {
        success: false,

        message:
          "Invalid product query.",

        errors:
          queryResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result =
      await listProducts(
        queryResult.data,
      );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Products GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Products could not be loaded.",
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
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const rateLimit =
    await consumeRequestRateLimit(
      request,
      RATE_LIMIT_POLICIES.adminMutation,
      authorization.user.id,
    );

  if (!rateLimit.allowed) {
    return createRateLimitResponse(
      rateLimit,
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

        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  }

  const bodyResult =
    createProductSchema.safeParse(
      body,
    );

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,

        message:
          "Invalid product data.",

        errors:
          bodyResult.error.flatten(),
      },
      {
        status: 400,

        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  }

  try {
    const product =
      await createProduct(
        bodyResult.data,
      );

    await createAuditLogSafely({
      request,

      userId:
        authorization.user.id,

      action:
        "CREATE_PRODUCT",

      entity: "PRODUCT",

      entityId: product.id,

      description:
        `Product ${product.name} was created.`,

      metadata: {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: product,

        message:
          "Product created successfully.",
      },
      {
        status: 201,

        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  } catch (error) {
    if (
      error instanceof
      ProductConflictError
    ) {
      await createAuditLogSafely({
        request,

        userId:
          authorization.user.id,

        action:
          "CREATE_PRODUCT_FAILED",

        entity: "PRODUCT",

        description:
          "Product creation failed because of a conflict.",

        status: "FAILED",

        metadata: {
          reason: error.message,
          name:
            bodyResult.data.name,
          sku:
            bodyResult.data.sku,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 409,

          headers:
            getRateLimitHeaders(
              rateLimit,
            ),
        },
      );
    }

    console.error(
      "Products POST error:",
      error,
    );

    await createAuditLogSafely({
      request,

      userId:
        authorization.user.id,

      action:
        "CREATE_PRODUCT_FAILED",

      entity: "PRODUCT",

      description:
        "Product could not be created.",

      status: "FAILED",

      metadata: {
        name:
          bodyResult.data.name,

        sku:
          bodyResult.data.sku,
      },
    });

    return NextResponse.json(
      {
        success: false,

        message:
          "Product could not be created.",
      },
      {
        status: 500,

        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  }
}