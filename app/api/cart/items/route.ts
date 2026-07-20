import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAuthenticatedApi } from "@/lib/auth/guards";

import {
  addCartItem,
  CartProductNotFoundError,
  CartStockError,
  CartValidationError,
} from "@/lib/services/cart.service";

import { addCartItemSchema } from "@/schemas/cart.schema";

export async function POST(
  request: NextRequest,
) {
  const authorization =
    await requireAuthenticatedApi();

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
        message:
          "Request body must contain valid JSON.",
      },
      {
        status: 400,
      },
    );
  }

  const bodyResult =
    addCartItemSchema.safeParse(body);

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid cart item data.",
        errors:
          bodyResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const cart = await addCartItem(
      authorization.user.id,
      bodyResult.data,
    );

    return NextResponse.json(
      {
        success: true,
        data: cart,
        message:
          "Product added to cart.",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    if (
      error instanceof
      CartProductNotFoundError
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
      CartValidationError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        {
          status: 400,
        },
      );
    }

    if (
      error instanceof CartStockError
    ) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,

          data: {
            availableStock:
              error.availableStock,
          },
        },
        {
          status: 409,
        },
      );
    }

    console.error(
      "Cart item POST error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Product could not be added to cart.",
      },
      {
        status: 500,
      },
    );
  }
}