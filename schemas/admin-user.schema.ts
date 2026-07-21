import { z } from "zod";

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

export const adminUserQuerySchema = z
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

    role: z.preprocess(
      (value) =>
        value === "" ? undefined : value,
      z.enum(["USER", "ADMIN"]).optional(),
    ),

    status: z.preprocess(
      (value) =>
        value === "" ? undefined : value,
      z
        .enum(["ACTIVE", "INACTIVE"])
        .optional(),
    ),
  })
  .strict();

export const updateAdminUserSchema = z
  .object({
    role: z
      .enum(["USER", "ADMIN"])
      .optional(),

    isActive: z
      .boolean()
      .optional(),
  })
  .strict()
  .refine(
    (input) =>
      input.role !== undefined ||
      input.isActive !== undefined,
    {
      message:
        "At least one user field must be provided.",
    },
  );

export type AdminUserQueryInput =
  z.infer<
    typeof adminUserQuerySchema
  >;

export type UpdateAdminUserInput =
  z.infer<
    typeof updateAdminUserSchema
  >;