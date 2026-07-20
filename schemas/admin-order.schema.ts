import { z } from "zod";

export const adminOrderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export const adminPaymentStatuses = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

function optionalQueryText(
  maximumLength: number,
) {
  return z.preprocess(
    (value) => {
      if (
        value === undefined ||
        value === null
      ) {
        return undefined;
      }

      if (typeof value === "string") {
        const normalized = value.trim();

        return normalized || undefined;
      }

      return value;
    },
    z
      .string()
      .max(maximumLength)
      .optional(),
  );
}

export const adminOrderQuerySchema = z
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

    search: optionalQueryText(150),

    status: z.preprocess(
      (value) =>
        value === "" ? undefined : value,
      z
        .enum(adminOrderStatuses)
        .optional(),
    ),

    paymentStatus: z.preprocess(
      (value) =>
        value === "" ? undefined : value,
      z
        .enum(adminPaymentStatuses)
        .optional(),
    ),

    date: z.preprocess(
      (value) =>
        value === "" ? undefined : value,
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Invalid order date.",
        )
        .optional(),
    ),
  })
  .strict();

export const updateAdminOrderSchema = z
  .object({
    status: z
      .enum(adminOrderStatuses)
      .optional(),

    paymentStatus: z
      .enum(adminPaymentStatuses)
      .optional(),

    internalNote: z.preprocess(
      (value) => {
        if (
          value === undefined ||
          value === null
        ) {
          return undefined;
        }

        if (typeof value === "string") {
          const normalized = value.trim();

          return normalized || undefined;
        }

        return value;
      },
      z
        .string()
        .max(
          500,
          "Internal note cannot exceed 500 characters.",
        )
        .optional(),
    ),
  })
  .strict()
  .refine(
    (input) =>
      input.status !== undefined ||
      input.paymentStatus !== undefined ||
      input.internalNote !== undefined,
    {
      message:
        "At least one order field must be provided.",
    },
  );

export type AdminOrderQueryInput =
  z.infer<typeof adminOrderQuerySchema>;

export type UpdateAdminOrderInput =
  z.infer<typeof updateAdminOrderSchema>;