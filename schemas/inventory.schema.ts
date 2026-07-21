import { z } from "zod";

export const inventoryStatuses = [
  "IN_STOCK",
  "LOW_STOCK",
  "OUT_OF_STOCK",
] as const;

const optionalSearchSchema = z.preprocess(
  (value) => {
    if (
      value === undefined ||
      value === null
    ) {
      return undefined;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim();

      return normalizedValue || undefined;
    }

    return value;
  },
  z.string().max(150).optional(),
);

export const inventoryQuerySchema = z
  .object({
    page: z.coerce
      .number()
      .int()
      .min(1)
      .default(1),

    limit: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(10),

    search: optionalSearchSchema,

    status: z.preprocess(
      (value) =>
        value === "" ? undefined : value,
      z.enum(inventoryStatuses).optional(),
    ),
  })
  .strict();

export const updateInventorySchema = z
  .object({
    quantity: z.coerce
      .number()
      .int()
      .min(
        0,
        "Stock quantity cannot be negative.",
      )
      .max(1_000_000)
      .optional(),

    reservedQuantity: z.coerce
      .number()
      .int()
      .min(
        0,
        "Reserved quantity cannot be negative.",
      )
      .max(1_000_000)
      .optional(),
  })
  .strict()
  .refine(
    (input) =>
      input.quantity !== undefined ||
      input.reservedQuantity !== undefined,
    {
      message:
        "At least one inventory field must be provided.",
    },
  )
  .refine(
    (input) =>
      input.quantity === undefined ||
      input.reservedQuantity === undefined ||
      input.reservedQuantity <=
        input.quantity,
    {
      message:
        "Reserved quantity cannot exceed total quantity.",
      path: ["reservedQuantity"],
    },
  );

export type InventoryQueryInput = z.infer<
  typeof inventoryQuerySchema
>;

export type UpdateInventoryInput = z.infer<
  typeof updateInventorySchema
>;