import { NextResponse } from "next/server";

import { requireAuthenticatedApi } from "@/lib/auth/guards";

import { getCart } from "@/lib/services/cart.service";

export async function GET() {
  const authorization =
    await requireAuthenticatedApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  try {
    const cart = await getCart(
      authorization.user.id,
    );

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error(
      "Cart GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Cart could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}