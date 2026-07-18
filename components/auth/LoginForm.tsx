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

import { loginSchema } from "@/schemas/auth.schema";

import type { AuthResult } from "@/types/auth";

type LoginFieldErrors = Partial<
  Record<"email" | "password", string>
>;

export function LoginForm() {
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] =
    useState<LoginFieldErrors>({});

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const input = {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      rememberMe: formData.get("rememberMe") === "on",
    };

    const validationResult = loginSchema.safeParse(input);

    if (!validationResult.success) {
      const errors = validationResult.error.flatten();

      setFieldErrors({
        email: errors.fieldErrors.email?.[0],
        password: errors.fieldErrors.password?.[0],
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
        "/api/auth/login",
        {
          method: "POST",
          body: JSON.stringify(validationResult.data),
        },
      );

      if (!response.data) {
        throw new Error(
          "Login succeeded but user data was not returned.",
        );
      }

      await mutate(
        AUTH_ME_KEY,
        response.data,
        false,
      );

      router.replace(
        response.data.user.role === "ADMIN"
          ? "/admin"
          : "/profile",
      );

      router.refresh();
    } catch (error) {
      if (error instanceof AuthRequestError) {
        setFormError(error.message);

        setFieldErrors({
          email: error.fieldErrors.email?.[0],
          password: error.fieldErrors.password?.[0],
        });
      } else {
        console.error("Login form error:", error);

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
          Welcome back
        </span>

        <h1>Sign in to Nova</h1>

        <p className="leading-7 text-slate-500">
          Access your orders, saved items and account details.
        </p>
      </div>

      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={fieldErrors.email}
        disabled={loading}
        required
      />

      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        error={fieldErrors.password}
        disabled={loading}
        required
      />

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="rememberMe"
            disabled={loading}
          />

          <span>Remember me</span>
        </label>

        <span className="leading-7 text-slate-400">
          Forgot password?
        </span>
      </div>

      {formError && (
        <ErrorMessage message={formError} />
      )}

      <Button
        type="submit"
        size="lg"
        loading={loading}
      >
        Login
      </Button>

      <p className="text-center">
        New to Nova?{" "}
        <Link
          href="/register"
          className="font-extrabold text-indigo-800"
        >
          Create account
        </Link>
      </p>

      <div className="rounded-lg bg-indigo-50 p-3.5 text-[0.82rem]">
        <strong>Demo accounts</strong>
        <br />
        User: user@novastore.com / password123
        <br />
        Admin: admin@novastore.com / admin123
      </div>
    </form>
  );
}