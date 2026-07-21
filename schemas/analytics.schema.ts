import { z } from "zod";

export const analyticsQuerySchema = z
  .object({
    days: z.coerce
      .number()
      .int()
      .refine(
        (value) =>
          value === 7 ||
          value === 30 ||
          value === 90,
        {
          message:
            "Analytics period must be 7, 30 or 90 days.",
        },
      )
      .default(30),
  })
  .strict();

export type AnalyticsQueryInput =
  z.infer<typeof analyticsQuerySchema>;