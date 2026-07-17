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
    <form className="stack" onSubmit={submit} noValidate>
      <section className="panel" style={{ padding: 24 }}>
        <h2>Contact information</h2>
        <div className="form-grid">
          <Input label="First name" name="firstName" required />
          <Input label="Last name" name="lastName" required />
          <Input label="Email" name="email" type="email" required />
          <Input label="Phone" name="phone" type="tel" />
        </div>
      </section>

      <section className="panel" style={{ padding: 24 }}>
        <h2>Shipping address</h2>
        <div className="form-grid">
          <Select label="Country" name="country" options={countryOptions} />
          <Input label="City" name="city" required />
          <Input label="Address" name="address" required />
          <Input label="Postal code" name="postalCode" required />
        </div>
      </section>

      <section className="panel" style={{ padding: 24 }}>
        <h2>Delivery method</h2>
        <label className="spread panel" style={{ padding: 15 }}>
          <span>
            <strong>Standard delivery</strong>
            <span className="muted" style={{ display: "block" }}>
              3{"\u2013"}5 business days
            </span>
          </span>
          <span>
            Free <input type="radio" name="delivery" defaultChecked />
          </span>
        </label>
      </section>

      <section className="panel" style={{ padding: 24 }}>
        <h2>Payment method</h2>
        <div className="stack">
          <label className="row">
            <input type="radio" name="payment" defaultChecked /> Cash on
            delivery
          </label>
          <label className="row">
            <input type="radio" name="payment" /> Mock card payment
          </label>
        </div>
      </section>

      {error && <ErrorMessage message={error} />}
      {message && (
        <div className="message" role="status">
          {message}
        </div>
      )}

      <Button type="submit" size="lg" loading={loading}>
        Place order
      </Button>
    </form>
  );
}
