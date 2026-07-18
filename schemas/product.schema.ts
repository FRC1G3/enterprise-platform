import { z } from "zod";

export const productCategorySchema = z.enum([
  "Men",
  "Women",
  "Shoes",
  "Accessories",
]);

const nameSchema = z
  .string()
  .trim()
  .min(2, "Product name must contain at least 2 characters.")
  .max(120, "Product name cannot exceed 120 characters.");

const slugSchema = z
  .string()
  .trim()
  .min(2, "Slug must contain at least 2 characters.")
  .max(150, "Slug cannot exceed 150 characters.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain lowercase letters, numbers and hyphens only.",
  );

const descriptionSchema = z
  .string()
  .trim()
  .min(10, "Description must contain at least 10 characters.")
  .max(2000, "Description cannot exceed 2000 characters.");

const priceSchema = z.coerce
  .number()
  .positive("Price must be greater than 0.")
  .max(99999999, "Price is too large.");

const stringListSchema = z.array(z.string().trim().min(1).max(100)).max(30);

export const createProductSchema = z
  .object({
    name: nameSchema,
    slug: slugSchema.optional(),
    description: descriptionSchema,

    price: priceSchema,
    originalPrice: priceSchema.nullable().optional(),

    category: productCategorySchema,
    sku: z
      .string()
      .trim()
      .min(2, "SKU must contain at least 2 characters.")
      .max(80, "SKU cannot exceed 80 characters.")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "SKU may contain letters, numbers, hyphens and underscores only.",
      ),

    image: z.string().trim().url("A valid image URL is required."),
    images: z
      .array(z.string().trim().url("Every image must have a valid URL."))
      .max(10)
      .default([]),

    colors: stringListSchema.default([]),
    sizes: stringListSchema.default([]),

    stock: z.coerce.number().int().nonnegative().default(0),
    rating: z.coerce.number().min(0).max(5).default(0),
    reviewCount: z.coerce.number().int().nonnegative().default(0),

    isFeatured: z.boolean().default(false),
    isNew: z.boolean().default(false),
    isActive: z.boolean().default(true),
  })
  .strict()
  .superRefine((product, context) => {
    if (
      product.originalPrice !== null &&
      product.originalPrice !== undefined &&
      product.originalPrice < product.price
    ) {
      context.addIssue({
        code: "custom",
        path: ["originalPrice"],
        message: "Original price cannot be lower than the current price.",
      });
    }
  });

export const updateProductSchema = z
  .object({
    name: nameSchema.optional(),
    slug: slugSchema.optional(),
    description: descriptionSchema.optional(),

    price: priceSchema.optional(),
    originalPrice: priceSchema.nullable().optional(),

    category: productCategorySchema.optional(),
    sku: z
      .string()
      .trim()
      .min(2)
      .max(80)
      .regex(/^[A-Za-z0-9_-]+$/)
      .optional(),

    image: z.string().trim().url().optional(),
    images: z.array(z.string().trim().url()).max(10).optional(),

    colors: stringListSchema.optional(),
    sizes: stringListSchema.optional(),

    stock: z.coerce.number().int().nonnegative().optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
    reviewCount: z.coerce.number().int().nonnegative().optional(),

    isFeatured: z.boolean().optional(),
    isNew: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict()
  .refine((product) => Object.keys(product).length > 0, {
    message: "At least one field must be provided.",
  });

const optionalNumberFromQuery = z.preprocess((value) => {
  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.coerce.number().nonnegative().optional());

const optionalBooleanFromQuery = z.preprocess((value) => {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (value === "" || value === undefined || value === null) {
    return undefined;
  }

  return value;
}, z.boolean().optional());

const categoryFromQuery = z.preprocess((value) => {
  if (typeof value !== "string" || !value.trim()) {
    return undefined;
  }

  const categories = {
    men: "Men",
    women: "Women",
    shoes: "Shoes",
    accessories: "Accessories",
  } as const;

  return (
    categories[value.trim().toLowerCase() as keyof typeof categories] ?? value
  );
}, productCategorySchema.optional());

export const productQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(12),

    search: z.string().trim().max(120).optional(),
    category: categoryFromQuery,

    min: optionalNumberFromQuery,
    max: optionalNumberFromQuery,
    inStock: optionalBooleanFromQuery,

    sort: z
      .enum(["featured", "price-low", "price-high", "rating", "newest"])
      .default("featured"),
  })
  .superRefine((query, context) => {
    if (
      query.min !== undefined &&
      query.max !== undefined &&
      query.min > query.max
    ) {
      context.addIssue({
        code: "custom",
        path: ["max"],
        message: "Maximum price cannot be lower than minimum price.",
      });
    }
  });

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
