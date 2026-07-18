"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";

import { AUTH_ME_KEY } from "@/hooks/useAuth";

import {
  AuthRequestError,
  authRequest,
} from "@/lib/auth/client";

import { registerSchema } from "@/schemas/auth.schema";

import type { AuthResult } from "@/types/auth";

type RegisterFieldErrors = Partial<
  Record<
    | "name"
    | "email"
    | "password"
    | "confirmPassword"
    | "acceptTerms",
    string
  >
>;

export function RegisterForm() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<RegisterFieldErrors>({});

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const input = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(
        formData.get("confirmPassword") ?? "",
      ),
      acceptTerms: formData.get("acceptTerms") === "on",
    };

    const validationResult =
      registerSchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();

      setFieldErrors({
        name: errors.fieldErrors.name?.[0],
        email: errors.fieldErrors.email?.[0],
        password: errors.fieldErrors.password?.[0],
        confirmPassword:
          errors.fieldErrors.confirmPassword?.[0],
        acceptTerms:
          errors.fieldErrors.acceptTerms?.[0],
      });

      setFormError(
        errors.formErrors[0] ?? "Please check the form fields.",
      );

      return;
    }

    setLoading(true);
    setFormError("");
    setFieldErrors({});

    try {
      const response = await authRequest<AuthResult>(
        "/api/auth/register",
        {
          method: "POST",
          body: JSON.stringify(validationResult.data),
        },
      );

      if (!response.data) {
        throw new Error(
          "Registration succeeded but user data was not returned.",
        );
      }

      await mutate(
        AUTH_ME_KEY,
        response.data,
        false,
      );

      router.replace("/profile");
      router.refresh();
    } catch (error) {
      if (error instanceof AuthRequestError) {
        setFormError(error.message);

        setFieldErrors({
          name: error.fieldErrors.name?.[0],
          email: error.fieldErrors.email?.[0],
          password: error.fieldErrors.password?.[0],
          confirmPassword:
            error.fieldErrors.confirmPassword?.[0],
          acceptTerms:
            error.fieldErrors.acceptTerms?.[0],
        });
      } else {
        console.error("Register form error:", error);

        setFormError(
          "An unexpected error occurred. Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      className="grid w-full max-w-[480px] gap-[18px] rounded-[14px] border border-slate-200 bg-white p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)]"
      noValidate
    >
      <div>
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
          Join Nova
        </span>

        <h1>Create your account</h1>

        <p className="leading-7 text-slate-500">
          Save favorites and make checkout easier.
        </p>
      </div>

      <Input
        label="Full name"
        name="name"
        autoComplete="name"
        error={fieldErrors.name}
        disabled={loading}
        required
      />

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        error={fieldErrors.email}
        disabled={loading}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.password}
        disabled={loading}
        required
      />

      <Input
        label="Confirm password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        error={fieldErrors.confirmPassword}
        disabled={loading}
        required
      />

      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="acceptTerms"
            disabled={loading}
          />

          <span>
            I accept the terms and privacy policy
          </span>
        </label>

        {fieldErrors.acceptTerms && (
          <p className="mt-2 text-xs text-red-700">
            {fieldErrors.acceptTerms}
          </p>
        )}
      </div>

      {formError && (
        <ErrorMessage message={formError} />
      )}

      <Button
        type="submit"
        size="lg"
        loading={loading}
      >
        Register
      </Button>

      <p className="text-center">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-extrabold text-indigo-800"
        >
          Login
        </Link>
      </p>
    </form>
  );
}