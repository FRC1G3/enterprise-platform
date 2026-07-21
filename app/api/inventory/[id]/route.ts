import {
  NextRequest,
  NextResponse,
} from "next/server";

import { requireAdminApi } from "@/lib/auth/guards";

import {
  getInventoryItem,
  InventoryNotFoundError,
  InventoryValidationError,
  updateInventory,
} from "@/lib/services/inventory.service";

import { updateInventorySchema } from "@/schemas/inventory.schema";

type InventoryRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: NextRequest,
  context: InventoryRouteContext,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await context.params;

  try {
    const inventory =
      await getInventoryItem(id);

    return NextResponse.json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    if (
      error instanceof
      InventoryNotFoundError
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
      "Inventory item GET error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Inventory item could not be loaded.",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: InventoryRouteContext,
) {
  const authorization =
    await requireAdminApi();

  if (!authorization.authorized) {
    return authorization.response;
  }

  const { id } = await context.params;

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
    updateInventorySchema.safeParse(
      body,
    );

  if (!bodyResult.success) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Invalid inventory data.",

        errors:
          bodyResult.error.flatten(),
      },
      {
        status: 400,
      },
    );
  }

  try {
    const inventory =
      await updateInventory(
        authorization.user.id,
        id,
        bodyResult.data,
      );

    return NextResponse.json({
      success: true,
      data: inventory,
      message:
        "Inventory updated successfully.",
    });
  } catch (error) {
    if (
      error instanceof
      InventoryNotFoundError
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
      InventoryValidationError
    ) {
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

    console.error(
      "Inventory PATCH error:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Inventory could not be updated.",
      },
      {
        status: 500,
      },
    );
  }
}