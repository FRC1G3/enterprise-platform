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
  deleteProduct,
  getProductByIdOrSlug,
  ProductConflictError,
  ProductNotFoundError,
  updateProduct,
} from "@/lib/services/product.service";

import { updateProductSchema } from "@/schemas/product.schema";

type ProductRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: ProductRouteContext,
) {
  const { id } = await context.params;

  if (!id.trim()) {
    return NextResponse.json(
      {
        success: false,

        message:
          "Product identifier is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const product =
      await getProductByIdOrSlug(id);

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (
      error instanceof
      ProductNotFoundError
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
      "Product GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,

        message:
          "Product could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: ProductRouteContext,
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

  const { id } = await context.params;

  if (!id.trim()) {
    return NextResponse.json(
      {
        success: false,

        message:
          "Product identifier is required.",
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
    updateProductSchema.safeParse(
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
      await updateProduct(
        id,
        bodyResult.data,
      );

    await createAuditLogSafely({
      request,

      userId:
        authorization.user.id,

      action:
        "UPDATE_PRODUCT",

      entity: "PRODUCT",

      entityId: product.id,

      description:
        `Product ${product.name} was updated.`,

      metadata: {
        productId: product.id,
        name: product.name,
        sku: product.sku,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: product,

        message:
          "Product updated successfully.",
      },
      {
        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  } catch (error) {
    if (
      error instanceof
      ProductNotFoundError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 404,

          headers:
            getRateLimitHeaders(
              rateLimit,
            ),
        },
      );
    }

    if (
      error instanceof
      ProductConflictError
    ) {
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
      "Product PUT error:",
      error,
    );

    await createAuditLogSafely({
      request,

      userId:
        authorization.user.id,

      action:
        "UPDATE_PRODUCT_FAILED",

      entity: "PRODUCT",

      entityId: id,

      description:
        "Product could not be updated.",

      status: "FAILED",
    });

    return NextResponse.json(
      {
        success: false,

        message:
          "Product could not be updated.",
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

export async function DELETE(
  request: NextRequest,
  context: ProductRouteContext,
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

  const { id } = await context.params;

  if (!id.trim()) {
    return NextResponse.json(
      {
        success: false,

        message:
          "Product identifier is required.",
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
      await getProductByIdOrSlug(id);

    const result =
      await deleteProduct(id);

    await createAuditLogSafely({
      request,

      userId:
        authorization.user.id,

      action:
        "DELETE_PRODUCT",

      entity: "PRODUCT",

      entityId: result.id,

      description:
        `Product ${product.name} was deleted.`,

      metadata: {
        productId: result.id,
        name: product.name,
        sku: product.sku,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: result,

        message:
          "Product deleted successfully.",
      },
      {
        headers:
          getRateLimitHeaders(
            rateLimit,
          ),
      },
    );
  } catch (error) {
    if (
      error instanceof
      ProductNotFoundError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 404,

          headers:
            getRateLimitHeaders(
              rateLimit,
            ),
        },
      );
    }

    console.error(
      "Product DELETE error:",
      error,
    );

    await createAuditLogSafely({
      request,

      userId:
        authorization.user.id,

      action:
        "DELETE_PRODUCT_FAILED",

      entity: "PRODUCT",

      entityId: id,

      description:
        "Product could not be deleted.",

      status: "FAILED",
    });

    return NextResponse.json(
      {
        success: false,

        message:
          "Product could not be deleted.",
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