import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import { listAdminOrders } from "@/lib/services/admin-order.service";

import { adminOrderQuerySchema } from "@/schemas/admin-order.schema";

export async function GET(
  request: NextRequest,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const queryResult =
    adminOrderQuerySchema.safeParse(
      Object.fromEntries(
        request.nextUrl.searchParams.entries(),
      ),
    );

  if (!queryResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid order query.",

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
      await listAdminOrders(
        queryResult.data,
      );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "Admin orders GET error:",
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