import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import { listInventory } from "@/lib/services/inventory.service";

import { inventoryQuerySchema } from "@/schemas/inventory.schema";

export async function GET(
  request: NextRequest,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const queryResult =
    inventoryQuerySchema.safeParse(
      Object.fromEntries(
        request.nextUrl.searchParams.entries(),
      ),
    );

  if (!queryResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid inventory query.",

        errors:
          queryResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const inventory =
      await listInventory(
        queryResult.data,
      );

    return NextResponse.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(
      "Inventory GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Inventory could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}