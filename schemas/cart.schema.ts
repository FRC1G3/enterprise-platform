import { z } from "zod";

const optionalSelectionSchema = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value === "string") {
      const normalizedValue = value.trim();

      return normalizedValue || null;
    }

    return value;
  },
  z.string().max(100).nullable().optional(),
);

export const addCartItemSchema = z
  .object({
    productId: z
      .string()
      .trim()
      .min(1, "Product identifier is required."),

    quantity: z.coerce
      .number()
      .int()
      .min(1, "Quantity must be at least 1.")
      .max(99, "Quantity cannot exceed 99."),

    selectedColor: optionalSelectionSchema,
    selectedSize: optionalSelectionSchema,
  })
  .strict();

export const updateCartItemSchema = z
  .object({
    quantity: z.coerce
      .number()
      .int()
      .min(1, "Quantity must be at least 1.")
      .max(99, "Quantity cannot exceed 99.")
      .optional(),

    selectedColor: optionalSelectionSchema,
    selectedSize: optionalSelectionSchema,
  })
  .strict()
  .refine(
    (input) => Object.keys(input).length > 0,
    {
      message:
        "At least one cart item field must be provided.",
    },
  );

export type AddCartItemInput = z.infer<
  typeof addCartItemSchema
>;

export type UpdateCartItemInput = z.infer<
  typeof updateCartItemSchema
>;