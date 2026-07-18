"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    if (String(form.get("password")).length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (form.get("password") !== form.get("confirm")) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.get("terms")) {
      setError("Please accept the terms.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 650);
  }

  return (
    <form
      onSubmit={submit}
      className="grid w-full max-w-[480px] gap-[18px] rounded-[14px] border border-slate-200 bg-white p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)]"
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

      <Input label="Full name" name="name" required />
      <Input label="Email" name="email" type="email" required />
      <Input label="Password" name="password" type="password" required />
      <Input
        label="Confirm password"
        name="confirm"
        type="password"
        required
      />

      <label className="flex items-center gap-3">
        <input type="checkbox" name="terms" /> I accept the terms and privacy
        policy
      </label>

      {error && <ErrorMessage message={error} />}
      {done && (
        <div className="rounded-md bg-emerald-50 p-3 text-emerald-700">
          Demo account created successfully.
        </div>
      )}

      <Button type="submit" size="lg" loading={loading}>
        Register
      </Button>

      <p className="text-center">
        Already have an account?{" "}
        <Link href="/login" className="font-extrabold text-indigo-800">
          Login
        </Link>
      </p>
    </form>
  );
}
