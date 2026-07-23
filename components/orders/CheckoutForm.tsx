"use client";

import {
  type FormEvent,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

import { CART_KEY } from "@/hooks/useCart";

import {
  AuthRequestError,
  authRequest,
} from "@/lib/auth/client";

import { createOrderSchema } from "@/schemas/order.schema";

import type { AuthUser } from "@/types/auth";
import type { Order } from "@/types/order";

const countryOptions = [
  {
    label: "Azerbaijan",
    value: "AZ",
  },
  {
    label: "United States",
    value: "US",
  },
  {
    label: "United Kingdom",
    value: "UK",
  },
  {
    label: "Turkey",
    value: "TR",
  },
];

type CheckoutField =
  | "customerName"
  | "customerEmail"
  | "customerPhone"
  | "shippingCountry"
  | "shippingCity"
  | "shippingAddress"
  | "shippingPostalCode"
  | "paymentMethod"
  | "notes";

type CheckoutFieldErrors = Partial<
  Record<CheckoutField, string>
>;

interface CheckoutFormProps {
  user: AuthUser;
}

export function CheckoutForm({
  user,
}: CheckoutFormProps) {
  const router = useRouter();

  const { mutate } = useSWRConfig();

  const [loading, setLoading] =
    useState(false);

  const [formError, setFormError] =
    useState("");

  const [fieldErrors, setFieldErrors] =
    useState<CheckoutFieldErrors>({});

  const idempotencyKeyRef =
    useRef<string | null>(null);

  const defaultCountry =
    countryOptions.some(
      (option) =>
        option.value === user.country,
    )
      ? user.country ?? "AZ"
      : "AZ";

  async function submit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const formData = new FormData(
      event.currentTarget,
    );

    const input = {
      customerName: String(
        formData.get("customerName") ??
          "",
      ),

      customerEmail: String(
        formData.get("customerEmail") ??
          "",
      ),

      customerPhone: String(
        formData.get("customerPhone") ??
          "",
      ),

      shippingCountry: String(
        formData.get(
          "shippingCountry",
        ) ?? "",
      ),

      shippingCity: String(
        formData.get("shippingCity") ??
          "",
      ),

      shippingAddress: String(
        formData.get(
          "shippingAddress",
        ) ?? "",
      ),

      shippingPostalCode: String(
        formData.get(
          "shippingPostalCode",
        ) ?? "",
      ),

      paymentMethod: String(
        formData.get("paymentMethod") ??
          "",
      ),

      notes: String(
        formData.get("notes") ?? "",
      ),
    };

    const validationResult =
      createOrderSchema.safeParse(input);

    if (!validationResult.success) {
      const errors =
        validationResult.error.flatten();

      setFieldErrors({
        customerName:
          errors.fieldErrors
            .customerName?.[0],

        customerEmail:
          errors.fieldErrors
            .customerEmail?.[0],

        customerPhone:
          errors.fieldErrors
            .customerPhone?.[0],

        shippingCountry:
          errors.fieldErrors
            .shippingCountry?.[0],

        shippingCity:
          errors.fieldErrors
            .shippingCity?.[0],

        shippingAddress:
          errors.fieldErrors
            .shippingAddress?.[0],

        shippingPostalCode:
          errors.fieldErrors
            .shippingPostalCode?.[0],

        paymentMethod:
          errors.fieldErrors
            .paymentMethod?.[0],

        notes:
          errors.fieldErrors.notes?.[0],
      });

      setFormError(
        errors.formErrors[0] ??
          "Please check the checkout information.",
      );

      return;
    }

    setLoading(true);
    setFormError("");
    setFieldErrors({});

    try {
      const idempotencyKey =
        idempotencyKeyRef.current ??
        crypto.randomUUID();

      idempotencyKeyRef.current =
        idempotencyKey;

      const response =
        await authRequest<Order>(
          "/api/orders",
          {
            method: "POST",

            headers: {
              "Idempotency-Key":
                idempotencyKey,
            },

            body: JSON.stringify(
              validationResult.data,
            ),
          },
        );

      if (!response.data) {
        throw new Error(
          "Order was created but order information was not returned.",
        );
      }

      await mutate(CART_KEY);

      idempotencyKeyRef.current =
        null;

      router.replace(
        `/orders/${response.data.id}`,
      );

      router.refresh();
    } catch (error) {
      if (
        error instanceof AuthRequestError
      ) {
        if (error.status === 401) {
          router.replace("/login");
          return;
        }

        setFormError(error.message);

        setFieldErrors({
          customerName:
            error.fieldErrors
              .customerName?.[0],

          customerEmail:
            error.fieldErrors
              .customerEmail?.[0],

          customerPhone:
            error.fieldErrors
              .customerPhone?.[0],

          shippingCountry:
            error.fieldErrors
              .shippingCountry?.[0],

          shippingCity:
            error.fieldErrors
              .shippingCity?.[0],

          shippingAddress:
            error.fieldErrors
              .shippingAddress?.[0],

          shippingPostalCode:
            error.fieldErrors
              .shippingPostalCode?.[0],

          paymentMethod:
            error.fieldErrors
              .paymentMethod?.[0],

          notes:
            error.fieldErrors.notes?.[0],
        });
      } else {
        console.error(
          "Checkout form error:",
          error,
        );

        setFormError(
          "An unexpected error occurred while placing the order.",
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      className="grid gap-[18px]"
      onSubmit={submit}
      noValidate
    >
      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Contact information</h2>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Input
            label="Full name"
            name="customerName"
            defaultValue={user.name}
            error={
              fieldErrors.customerName
            }
            disabled={loading}
            required
          />

          <Input
            label="Email"
            name="customerEmail"
            type="email"
            defaultValue={user.email}
            error={
              fieldErrors.customerEmail
            }
            disabled={loading}
            required
          />

          <Input
            label="Phone"
            name="customerPhone"
            type="tel"
            defaultValue={
              user.phone ?? ""
            }
            error={
              fieldErrors.customerPhone
            }
            disabled={loading}
          />
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Shipping address</h2>

        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <div className="grid gap-[7px]">
            <Select
              label="Country"
              name="shippingCountry"
              options={countryOptions}
              defaultValue={defaultCountry}
              disabled={loading}
            />

            {fieldErrors.shippingCountry && (
              <ErrorMessage
                message={
                  fieldErrors.shippingCountry
                }
              />
            )}
          </div>

          <Input
            label="City"
            name="shippingCity"
            defaultValue={
              user.city ?? ""
            }
            error={
              fieldErrors.shippingCity
            }
            disabled={loading}
            required
          />

          <Input
            label="Address"
            name="shippingAddress"
            defaultValue={
              user.address ?? ""
            }
            error={
              fieldErrors.shippingAddress
            }
            disabled={loading}
            required
          />

          <Input
            label="Postal code"
            name="shippingPostalCode"
            defaultValue={
              user.postalCode ?? ""
            }
            error={
              fieldErrors.shippingPostalCode
            }
            disabled={loading}
            required
          />
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Delivery method</h2>

        <div className="flex items-center justify-between gap-3 rounded-[14px] border border-slate-200 bg-white p-[15px]">
          <span>
            <strong>
              Standard delivery
            </strong>

            <span className="block leading-7 text-slate-500">
              3–5 business days
            </span>
          </span>

          <span>Calculated automatically</span>
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Payment method</h2>

        <div className="grid gap-[18px]">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              value="CASH_ON_DELIVERY"
              defaultChecked
              disabled={loading}
            />

            Cash on delivery
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              name="paymentMethod"
              value="MOCK_CARD"
              disabled={loading}
            />

            Mock card payment
          </label>

          <p className="text-xs leading-6 text-slate-500">
            Mock card payment is only a
            demonstration. No real payment
            is processed.
          </p>

          {fieldErrors.paymentMethod && (
            <ErrorMessage
              message={
                fieldErrors.paymentMethod
              }
            />
          )}
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Order notes</h2>

        <textarea
          name="notes"
          className="min-h-[110px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Optional delivery instructions"
          disabled={loading}
        />

        {fieldErrors.notes && (
          <ErrorMessage
            message={fieldErrors.notes}
            className="mt-2"
          />
        )}
      </section>

      {formError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <ErrorMessage
            message={formError}
          />
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        loading={loading}
      >
        Place order
      </Button>
    </form>
  );
}
