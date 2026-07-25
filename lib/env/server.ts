import "server-only";

import { z } from "zod";

const postgresUrl = z
  .string()
  .trim()
  .min(1)
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "postgres:" || protocol === "postgresql:";
  });

const serverEnvironmentSchema = z.object({
  DATABASE_URL: postgresUrl,
  JWT_SECRET: z.string().min(32),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  VERCEL_ENV: z
    .enum(["development", "preview", "production"])
    .optional(),
});

export type ServerEnvironment = z.infer<
  typeof serverEnvironmentSchema
>;

let validatedEnvironment: ServerEnvironment | undefined;

export function getServerEnvironment(): ServerEnvironment {
  if (validatedEnvironment) {
    return validatedEnvironment;
  }

  const result = serverEnvironmentSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
  });

  if (!result.success) {
    const variableNames = [
      ...new Set(
        result.error.issues.map(
          (issue) => String(issue.path[0] ?? "environment"),
        ),
      ),
    ];

    throw new Error(
      `Invalid server environment configuration: ${variableNames.join(", ")}.`,
    );
  }

  validatedEnvironment = result.data;
  return validatedEnvironment;
}
