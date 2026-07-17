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
    <form onSubmit={submit} className="panel auth-card stack">
      <div>
        <span className="eyebrow">Welcome back</span>
        <h1>Sign in to Nova</h1>
        <p className="muted">
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

      <div className="spread">
        <label className="row">
          <input type="checkbox" /> Remember me
        </label>
        <a href="#" className="muted">
          Forgot password?
        </a>
      </div>

      {done && (
        <div className="message" role="status">
          Demo login successful. Authentication is not connected.
        </div>
      )}

      <Button type="submit" size="lg" loading={loading}>
        Login
      </Button>

      <p style={{ textAlign: "center" }}>
        New to Nova?{" "}
        <Link
          href="/register"
          style={{ color: "var(--brand)", fontWeight: 800 }}
        >
          Create account
        </Link>
      </p>

      <div className="auth-demo">
        <strong>Demo accounts</strong>
        <br />
        User: user@novastore.com / password123
        <br />
        Admin: admin@novastore.com / admin123
      </div>
    </form>
  );
}
