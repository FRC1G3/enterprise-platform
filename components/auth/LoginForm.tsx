"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setDone(false);

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
        placeholder="you@example.com"
        required
      />
      <Input label="Password" name="password" type="password" required />

      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-3">
          <input type="checkbox" /> Remember me
        </label>
        <a href="#" className="leading-7 text-slate-500">
          Forgot password?
        </a>
      </div>

      {done && (
        <div
          className="rounded-md bg-emerald-50 p-3 text-emerald-700"
          role="status"
        >
          Demo login successful. Authentication is not connected.
        </div>
      )}

      <Button type="submit" size="lg" loading={loading}>
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
