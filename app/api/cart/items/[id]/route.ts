import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAuthenticatedApi } from "@/lib/auth/guards";

import {
  CartItemNotFoundError,
  CartProductNotFoundError,
  CartStockError,
  CartValidationError,
  removeCartItem,
  updateCartItem,
} from "@/lib/services/cart.service";

import { updateCartItemSchema } from "@/schemas/cart.schema";

type CartItemRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  context: CartItemRouteContext,
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
          "Cart item identifier is required.",
      },
      {
        status: 400,
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
      },
    );
  }

  const bodyResult =
    updateCartItemSchema.safeParse(body);

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
    const cart = await updateCartItem(
      authorization.user.id,
      id,
      bodyResult.data,
    );

    return NextResponse.json({
      success: true,
      data: cart,
      message: "Cart item updated.",
    });
  } catch (error) {
    if (
      error instanceof
      CartItemNotFoundError
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
      "Cart item PATCH error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Cart item could not be updated.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: CartItemRouteContext,
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
          "Cart item identifier is required.",
      },
      {
        status: 400,
      },
    );
  }

  try {
    const cart = await removeCartItem(
      authorization.user.id,
      id,
    );

    return NextResponse.json({
      success: true,
      data: cart,
      message: "Cart item removed.",
    });
  } catch (error) {
    if (
      error instanceof
      CartItemNotFoundError
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
      "Cart item DELETE error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Cart item could not be removed.",
      },
      {
        status: 500,
      },
    );
  }
}