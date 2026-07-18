import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("A valid email address is required.")
  .max(254, "Email address is too long.")
  .transform((email) => email.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must contain at least 8 characters.")
  .max(72, "Password cannot exceed 72 characters.");

export const loginSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    rememberMe: z.boolean().default(false),
  })
  .strict();

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name must contain at least 2 characters.")
      .max(80, "Full name cannot exceed 80 characters."),

    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),

    acceptTerms: z
      .boolean()
      .refine((accepted) => accepted, {
        message: "You must accept the terms and privacy policy.",
      }),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;