"use client";

import Link from "next/link";
import { useState } from "react";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import { useDebounce } from "@/hooks/useDebounce";
import { useAdminOrders } from "@/hooks/useOrders";

import type {
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

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

const dateFormatter =
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function AdminOrdersPage() {
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<OrderStatus | "">("");

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState<
    PaymentStatus | ""
  >("");

  const [date, setDate] =
    useState("");

  const [page, setPage] =
    useState(1);

  const debouncedSearch =
    useDebounce(search, 350);

  const {
    orders,
    pagination,
    error,
    isLoading,
    isValidating,
  } = useAdminOrders({
    page,
    limit: 10,

    search:
      debouncedSearch ||
      undefined,

    status:
      status || undefined,

    paymentStatus:
      paymentStatus ||
      undefined,

    date:
      date || undefined,
  });

  const totalPages =
    pagination?.totalPages ?? 1;

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            Operations
          </span>

          <h1>Orders</h1>

          <p className="leading-7 text-slate-500">
            {pagination?.total ?? 0}{" "}
            {(pagination?.total ?? 0) ===
            1
              ? "order"
              : "orders"}{" "}
            found
          </p>
        </div>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-2.5 [&_input]:min-w-[170px] [&_select]:min-w-[170px]">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={search}
          onChange={(event) => {
            setSearch(
              event.target.value,
            );

            setPage(1);
          }}
          placeholder="Order, customer or email"
          aria-label="Search orders"
        />

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={paymentStatus}
          onChange={(event) => {
            setPaymentStatus(
              event.target
                .value as
                | PaymentStatus
                | "",
            );

            setPage(1);
          }}
          aria-label="Payment status"
        >
          <option value="">
            All payments
          </option>

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

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={status}
          onChange={(event) => {
            setStatus(
              event.target
                .value as
                | OrderStatus
                | "",
            );

            setPage(1);
          }}
          aria-label="Order status"
        >
          <option value="">
            All statuses
          </option>

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

        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          type="date"
          value={date}
          onChange={(event) => {
            setDate(
              event.target.value,
            );

            setPage(1);
          }}
          aria-label="Order date"
        />

        {isValidating &&
          !isLoading && (
            <span className="self-center text-sm text-slate-500">
              Refreshing...
            </span>
          )}
      </div>

      {error && (
        <div
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          Orders could not be loaded.{" "}
          {error.message}
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-slate-500"
                >
                  Loading orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-slate-500"
                >
                  No orders match the selected filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>
                      {order.orderNumber}
                    </strong>
                  </td>

                  <td>
                    <strong className="block">
                      {order.customerName}
                    </strong>

                    <span className="text-slate-500">
                      {order.customerEmail}
                    </span>
                  </td>

                  <td>
                    {dateFormatter.format(
                      new Date(
                        order.createdAt,
                      ),
                    )}
                  </td>

                  <td>
                    {order.itemCount}
                  </td>

                  <td>
                    {currencyFormatter.format(
                      order.total,
                    )}
                  </td>

                  <td>
                    <OrderStatusBadge
                      status={
                        order.paymentStatus
                      }
                    />
                  </td>

                  <td>
                    <OrderStatusBadge
                      status={
                        order.status
                      }
                    />
                  </td>

                  <td>
                    <Link
                      className="inline-flex min-h-[34px] items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[0.82rem] font-bold text-slate-900 hover:bg-slate-50"
                      href={`/admin/orders/${order.id}`}
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-7 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="min-h-[38px] rounded-md border border-slate-200 bg-white px-3 disabled:opacity-50"
            disabled={page === 1}
            onClick={() =>
              setPage(
                Math.max(
                  1,
                  page - 1,
                ),
              )
            }
          >
            Previous
          </button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) =>
              index + 1,
          ).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`h-[38px] min-w-[38px] rounded-md border border-slate-200 ${
                pageNumber === page
                  ? "bg-indigo-900 text-white"
                  : "bg-white"
              }`}
              onClick={() =>
                setPage(pageNumber)
              }
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            className="min-h-[38px] rounded-md border border-slate-200 bg-white px-3 disabled:opacity-50"
            disabled={
              page === totalPages
            }
            onClick={() =>
              setPage(
                Math.min(
                  totalPages,
                  page + 1,
                ),
              )
            }
          >
            Next
          </button>
        </nav>
      )}
    </>
  );
}