"use client";

import {
  useState,
} from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

import {
  AuthRequestError,
  authRequest,
} from "@/lib/auth/client";

import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/types/order";

const orderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const paymentStatuses:
  PaymentStatus[] = [
    "PENDING",
    "PAID",
    "FAILED",
    "REFUNDED",
  ];

interface AdminOrderStatusFormProps {
  order: Pick<
    Order,
    | "id"
    | "status"
    | "paymentStatus"
  >;
}

export function AdminOrderStatusForm({
  order,
}: AdminOrderStatusFormProps) {
  const router = useRouter();

  const [status, setStatus] =
    useState<OrderStatus>(
      order.status,
    );

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState<PaymentStatus>(
    order.paymentStatus,
  );

  const [
    internalNote,
    setInternalNote,
  ] = useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  async function saveOrder() {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response =
        await authRequest<Order>(
          `/api/admin/orders/${order.id}`,
          {
            method: "PATCH",

            body: JSON.stringify({
              status,
              paymentStatus,
              internalNote,
            }),
          },
        );

      if (!response.data) {
        throw new Error(
          "Order update response did not contain order data.",
        );
      }

      setStatus(
        response.data.status,
      );

      setPaymentStatus(
        response.data.paymentStatus,
      );

      setInternalNote("");

      setSuccessMessage(
        "Order updated successfully.",
      );

      router.refresh();
    } catch (error) {
      if (
        error instanceof
        AuthRequestError
      ) {
        setErrorMessage(
          error.message,
        );
      } else {
        console.error(
          "Admin order update error:",
          error,
        );

        setErrorMessage(
          "Order could not be updated.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
      <h3>Update order</h3>

      <label className="mt-3 grid gap-[7px]">
        <span>Order status</span>

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={status}
          disabled={isSaving}
          onChange={(event) =>
            setStatus(
              event.target
                .value as OrderStatus,
            )
          }
        >
          {orderStatuses.map(
            (value) => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            ),
          )}
        </select>
      </label>

      <label className="mt-3 grid gap-[7px]">
        <span>Payment status</span>

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={paymentStatus}
          disabled={isSaving}
          onChange={(event) =>
            setPaymentStatus(
              event.target
                .value as PaymentStatus,
            )
          }
        >
          {paymentStatuses.map(
            (value) => (
              <option
                key={value}
                value={value}
              >
                {value}
              </option>
            ),
          )}
        </select>
      </label>

      <label className="mt-3 grid gap-[7px]">
        <span>Internal note</span>

        <textarea
          className="min-h-[110px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          placeholder="This note will be saved in the activity log"
          value={internalNote}
          disabled={isSaving}
          onChange={(event) =>
            setInternalNote(
              event.target.value,
            )
          }
        />
      </label>

      {errorMessage && (
        <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      )}

      <Button
        className="mt-4 w-full"
        loading={isSaving}
        onClick={() =>
          void saveOrder()
        }
      >
        Update order
      </Button>
    </section>
  );
}