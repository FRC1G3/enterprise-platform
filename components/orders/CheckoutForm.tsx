"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

const countryOptions = [
  { label: "United States", value: "US" },
  { label: "Azerbaijan", value: "AZ" },
  { label: "United Kingdom", value: "UK" },
];

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    if (!form.get("email") || !form.get("address")) {
      setError("Please complete the required contact and address fields.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setMessage("Demo order placed successfully. No payment was processed.");
    }, 700);
  }

  return (
    <form className="grid gap-[18px]" onSubmit={submit} noValidate>
      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Contact information</h2>
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Input label="First name" name="firstName" required />
          <Input label="Last name" name="lastName" required />
          <Input label="Email" name="email" type="email" required />
          <Input label="Phone" name="phone" type="tel" />
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Shipping address</h2>
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Select label="Country" name="country" options={countryOptions} />
          <Input label="City" name="city" required />
          <Input label="Address" name="address" required />
          <Input label="Postal code" name="postalCode" required />
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Delivery method</h2>
        <label className="flex items-center justify-between gap-3 rounded-[14px] border border-slate-200 bg-white p-[15px] shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <span>
            <strong>Standard delivery</strong>
            <span className="block leading-7 text-slate-500">
              3{"\u2013"}5 business days
            </span>
          </span>
          <span>
            Free <input type="radio" name="delivery" defaultChecked />
          </span>
        </label>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Payment method</h2>
        <div className="grid gap-[18px]">
          <label className="flex items-center gap-3">
            <input type="radio" name="payment" defaultChecked /> Cash on
            delivery
          </label>
          <label className="flex items-center gap-3">
            <input type="radio" name="payment" /> Mock card payment
          </label>
        </div>
      </section>

      {error && <ErrorMessage message={error} />}
      {message && (
        <div
          className="rounded-md bg-emerald-50 p-3 text-emerald-700"
          role="status"
        >
          {message}
        </div>
      )}

      <Button type="submit" size="lg" loading={loading}>
        Place order
      </Button>
    </form>
  );
}
