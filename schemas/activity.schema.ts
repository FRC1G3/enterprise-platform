import { z } from "zod";

export const activityStatuses = [
  "SUCCESS",
  "FAILED",
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
        const normalizedValue =
          value.trim();

        return (
          normalizedValue || undefined
        );
      }

      return value;
    },
    z
      .string()
      .max(maximumLength)
      .optional(),
  );
}

export const activityQuerySchema = z
  .object({
    limit: z.coerce
      .number()
      .int()
      .min(5)
      .max(50)
      .default(20),

    cursor: optionalQueryText(150),

    search: optionalQueryText(150),
    action: optionalQueryText(100),
    entity: optionalQueryText(100),
    userId: optionalQueryText(150),

    status: z.preprocess(
      (value) =>
        value === ""
          ? undefined
          : value,
      z
        .enum(activityStatuses)
        .optional(),
    ),

    date: z.preprocess(
      (value) =>
        value === ""
          ? undefined
          : value,
      z
        .string()
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Invalid activity date.",
        )
        .optional(),
    ),
  })
  .strict();

export type ActivityQueryInput =
  z.infer<
    typeof activityQuerySchema
  >;