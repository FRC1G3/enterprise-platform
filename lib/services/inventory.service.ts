import {
  ActivityStatus,
  Prisma,
} from "@/generated/prisma/client";

import prisma from "@/lib/db/prisma";

import type {
  InventoryQueryInput,
  UpdateInventoryInput,
} from "@/schemas/inventory.schema";

import type {
  InventoryItem,
  InventoryListResult,
  InventoryStatus,
} from "@/types/inventory";

const inventoryInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      image: true,
      isActive: true,
    },
  },
} satisfies Prisma.InventoryInclude;

type InventoryRecord =
  Prisma.InventoryGetPayload<{
    include: typeof inventoryInclude;
  }>;

export class InventoryNotFoundError extends Error {
  constructor() {
    super("Inventory record not found.");
    this.name = "InventoryNotFoundError";
  }
}

export class InventoryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InventoryValidationError";
  }
}

function getInventoryStatus(
  availableQuantity: number,
): InventoryStatus {
  if (availableQuantity <= 0) {
    return "OUT_OF_STOCK";
  }

  if (availableQuantity < 10) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
}

function serializeInventory(
  inventory: InventoryRecord,
): InventoryItem {
  const availableQuantity = Math.max(
    0,
    inventory.quantity -
      inventory.reservedQuantity,
  );

  return {
    id: inventory.id,
    productId: inventory.productId,

    quantity: inventory.quantity,
    reservedQuantity:
      inventory.reservedQuantity,

    availableQuantity,

    status: getInventoryStatus(
      availableQuantity,
    ),

    product: {
      id: inventory.product.id,
      name: inventory.product.name,
      slug: inventory.product.slug,
      sku: inventory.product.sku,
      image: inventory.product.image,
      isActive:
        inventory.product.isActive,
    },

    createdAt:
      inventory.createdAt.toISOString(),

    updatedAt:
      inventory.updatedAt.toISOString(),
  };
}

export async function listInventory(
  input: InventoryQueryInput,
): Promise<InventoryListResult> {
  const inventoryRecords =
    await prisma.inventory.findMany({
      where: input.search
        ? {
            product: {
              is: {
                OR: [
                  {
                    name: {
                      contains: input.search,
                      mode: "insensitive",
                    },
                  },
                  {
                    sku: {
                      contains: input.search,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          }
        : undefined,

      include: inventoryInclude,

      orderBy: {
        product: {
          name: "asc",
        },
      },
    });

  const filteredInventory =
    inventoryRecords
      .map(serializeInventory)
      .filter(
        (inventory) =>
          !input.status ||
          inventory.status === input.status,
      );

  const total =
    filteredInventory.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / input.limit),
  );

  const page = Math.min(
    input.page,
    totalPages,
  );

  const start =
    (page - 1) * input.limit;

  return {
    inventory:
      filteredInventory.slice(
        start,
        start + input.limit,
      ),

    pagination: {
      page,
      limit: input.limit,
      total,
      totalPages,
    },
  };
}

export async function getInventoryItem(
  idOrProductId: string,
): Promise<InventoryItem> {
  const inventory =
    await prisma.inventory.findFirst({
      where: {
        OR: [
          {
            id: idOrProductId,
          },
          {
            productId: idOrProductId,
          },
        ],
      },

      include: inventoryInclude,
    });

  if (!inventory) {
    throw new InventoryNotFoundError();
  }

  return serializeInventory(inventory);
}

export async function updateInventory(
  adminUserId: string,
  idOrProductId: string,
  input: UpdateInventoryInput,
): Promise<InventoryItem> {
  const inventory =
    await prisma.$transaction(
      async (transaction) => {
        const existingInventory =
          await transaction.inventory.findFirst({
            where: {
              OR: [
                {
                  id: idOrProductId,
                },
                {
                  productId:
                    idOrProductId,
                },
              ],
            },

            include: inventoryInclude,
          });

        if (!existingInventory) {
          throw new InventoryNotFoundError();
        }

        const nextQuantity =
          input.quantity ??
          existingInventory.quantity;

        const nextReservedQuantity =
          input.reservedQuantity ??
          existingInventory.reservedQuantity;

        if (
          nextReservedQuantity >
          nextQuantity
        ) {
          throw new InventoryValidationError(
            "Reserved quantity cannot exceed total quantity.",
          );
        }

        const updatedInventory =
          await transaction.inventory.update({
            where: {
              id: existingInventory.id,
            },

            data: {
              quantity: nextQuantity,

              reservedQuantity:
                nextReservedQuantity,
            },

            include: inventoryInclude,
          });

        await transaction.activityLog.create({
          data: {
            userId: adminUserId,

            action:
              "UPDATE_INVENTORY",

            entity: "INVENTORY",

            entityId:
              updatedInventory.id,

            description:
              `Inventory for ${updatedInventory.product.name} was updated.`,

            status:
              ActivityStatus.SUCCESS,

            metadata: {
              productId:
                updatedInventory.productId,

              previousQuantity:
                existingInventory.quantity,

              newQuantity:
                updatedInventory.quantity,

              previousReservedQuantity:
                existingInventory.reservedQuantity,

              newReservedQuantity:
                updatedInventory.reservedQuantity,
            },
          },
        });

        return updatedInventory;
      },
    );

  return serializeInventory(inventory);
}