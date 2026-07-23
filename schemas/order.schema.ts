import { z } from "zod";

export const idempotencyKeySchema =
  z
    .string()
    .trim()
    .uuid(
      "Idempotency-Key must be a valid UUID.",
    );

const optionalTextSchema = (
  maximumLength: number,
) =>
  z.preprocess(
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
    z
      .string()
      .max(maximumLength)
      .optional(),
  );

export const createOrderSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .min(
        2,
        "Customer name must contain at least 2 characters.",
      )
      .max(100),

    customerEmail: z
      .string()
      .trim()
      .toLowerCase()
      .email("Enter a valid email address.")
      .max(150),

    customerPhone: optionalTextSchema(30),

    shippingCountry: z
      .string()
      .trim()
      .min(2, "Country is required.")
      .max(100),

    shippingCity: z
      .string()
      .trim()
      .min(2, "City is required.")
      .max(100),

    shippingAddress: z
      .string()
      .trim()
      .min(
        5,
        "Enter a complete shipping address.",
      )
      .max(250),

    shippingPostalCode: z
      .string()
      .trim()
      .min(2, "Postal code is required.")
      .max(30),

    paymentMethod: z.enum([
      "CASH_ON_DELIVERY",
      "MOCK_CARD",
    ]),

    notes: optionalTextSchema(500),
  })
  .strict();

export type CreateOrderInput = z.infer<
  typeof createOrderSchema
>;
