"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

import { useOrders } from "@/hooks/useOrders";

import { useAuthContext } from "@/lib/contexts/AuthContext";

import type {
  OrderStatus,
} from "@/types/order";

const PAGE_SIZE = 8;

const statuses: Array<
  "ALL" | OrderStatus
> = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
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

export default function OrdersPage() {
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuthContext();

  const {
    orders,
    error,
    isLoading,
    isValidating,
  } = useOrders(isAuthenticated);

  const [filter, setFilter] =
    useState<
      "ALL" | OrderStatus
    >("ALL");

  const [page, setPage] =
    useState(1);

  useEffect(() => {
    if (
      !isAuthLoading &&
      !isAuthenticated
    ) {
      router.replace("/login");
    }
  }, [
    isAuthLoading,
    isAuthenticated,
    router,
  ]);

  const filteredOrders =
    useMemo(() => {
      if (filter === "ALL") {
        return orders;
      }

      return orders.filter(
        (order) =>
          order.status === filter,
      );
    }, [orders, filter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredOrders.length /
        PAGE_SIZE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const visibleOrders =
    useMemo(() => {
      const start =
        (currentPage - 1) *
        PAGE_SIZE;

      return filteredOrders.slice(
        start,
        start + PAGE_SIZE,
      );
    }, [
      filteredOrders,
      currentPage,
    ]);

  if (
    isAuthLoading ||
    !isAuthenticated
  ) {
    return (
      <div className="min-h-[60vh] py-20 text-center">
        <p className="text-slate-500">
          Loading your account...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
              My account
            </span>

            <h1>Order history</h1>

            {isValidating &&
              !isLoading && (
                <p className="text-sm text-slate-500">
                  Refreshing orders...
                </p>
              )}
          </div>

          <Link
            href="/profile"
            className="font-bold text-indigo-800"
          >
            Back to profile
          </Link>
        </div>

        <div className="mb-[18px] flex flex-wrap gap-2.5">
          {statuses.map((status) => (
            <button
              className={`inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-[0.82rem] font-bold transition ${
                filter === status
                  ? "border-transparent bg-indigo-800 text-white hover:bg-indigo-900"
                  : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              }`}
              type="button"
              key={status}
              onClick={() => {
                setFilter(status);
                setPage(1);
              }}
            >
              {status === "ALL"
                ? "All"
                : status[0] +
                  status
                    .slice(1)
                    .toLowerCase()}
            </button>
          ))}
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

        {isLoading ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">
              Loading orders...
            </p>
          </div>
        ) : visibleOrders.length === 0 ? (
          <EmptyState
            title="No orders found"
            message={
              filter === "ALL"
                ? "You have not placed an order yet."
                : "No orders match the selected status."
            }
            href="/products"
            action="Browse products"
          />
        ) : (
          <>
            <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full min-w-[800px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {visibleOrders.map(
                    (order) => {
                      const itemCount =
                        order.items.reduce(
                          (
                            count,
                            item,
                          ) =>
                            count +
                            item.quantity,
                          0,
                        );

                      return (
                        <tr
                          key={order.id}
                        >
                          <td>
                            <strong>
                              {
                                order.orderNumber
                              }
                            </strong>
                          </td>

                          <td>
                            {dateFormatter.format(
                              new Date(
                                order.createdAt,
                              ),
                            )}
                          </td>

                          <td>
                            {itemCount}{" "}
                            {itemCount === 1
                              ? "item"
                              : "items"}
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
                              href={`/orders/${order.id}`}
                            >
                              View details
                            </Link>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <nav className="mt-7 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="min-h-[38px] rounded-md border border-slate-200 bg-white px-3 disabled:opacity-50"
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    setPage(
                      Math.max(
                        1,
                        currentPage - 1,
                      ),
                    )
                  }
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1,
                ).map(
                  (pageNumber) => (
                    <button
                      key={
                        pageNumber
                      }
                      type="button"
                      className={`h-[38px] min-w-[38px] rounded-md border border-slate-200 ${
                        pageNumber ===
                        currentPage
                          ? "bg-indigo-900 text-white"
                          : "bg-white"
                      }`}
                      onClick={() =>
                        setPage(
                          pageNumber,
                        )
                      }
                    >
                      {pageNumber}
                    </button>
                  ),
                )}

                <button
                  type="button"
                  className="min-h-[38px] rounded-md border border-slate-200 bg-white px-3 disabled:opacity-50"
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setPage(
                      Math.min(
                        totalPages,
                        currentPage + 1,
                      ),
                    )
                  }
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}