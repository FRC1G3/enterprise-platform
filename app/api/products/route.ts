import { NextRequest, NextResponse } from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import {
  createProduct,
  listProducts,
  ProductConflictError,
} from "@/lib/services/product.service";

import {
  createProductSchema,
  productQuerySchema,
} from "@/schemas/product.schema";

export async function GET(request: NextRequest) {
  const queryResult = productQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams.entries()),
  );

  if (!queryResult.success) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid product query.",
        errors: queryResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const result = await listProducts(queryResult.data);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Products GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Products could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request: NextRequest) {
  const authorization = await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

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

  const bodyResult = createProductSchema.safeParse(body);

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
    const product = await createProduct(bodyResult.data);

    return NextResponse.json(
      {
        success: true,
        data: product,
        message: "Product created successfully.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
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

    console.error("Products POST error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Product could not be created.",
      },
      {
        status: 500,
      },
    );
  }
}