import { NextRequest, NextResponse } from "next/server";

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
        message: "Product identifier is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const product = await getProductByIdOrSlug(id);

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
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

    console.error("Product GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Product could not be loaded.",
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
  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        message: "Request body must contain valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const bodyResult = updateProductSchema.safeParse(body);

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid product data.",
        errors: bodyResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const product = await updateProduct(id, bodyResult.data);

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product updated successfully.",
    });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
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

    if (error instanceof ProductConflictError) {
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

    console.error("Product PUT error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Product could not be updated.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: ProductRouteContext,
) {
  const { id } = await context.params;

  try {
    const result = await deleteProduct(id);

    return NextResponse.json({
      success: true,
      data: result,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
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

    console.error("Product DELETE error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Product could not be deleted.",
      },
      {
        status: 500,
      },
    );
  }
}