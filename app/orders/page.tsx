"use client";
import { useState } from "react";
import Link from "next/link";
import { orders } from "@/lib/mock-data";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
const statuses = [
  "All",
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];
export default function OrdersPage() {
  const [filter, setFilter] = useState("All"),
    visible = orders.filter((o) => filter === "All" || o.status === filter);
  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">My account</span>
            <h1>Order history</h1>
          </div>
        </div>
        <div className="mb-[18px] flex flex-wrap gap-2.5">
          {statuses.map((s) => (
            <button
              className={`inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border px-3 py-1.5 text-[0.82rem] font-bold transition hover:-translate-y-px ${
                filter === s
                  ? "border-transparent bg-indigo-800 text-white hover:bg-indigo-900"
                  : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              }`}
              type="button"
              key={s}
              onClick={() => setFilter(s)}
            >
              {s[0] + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
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
              {visible.map((o) => (
                <tr key={o.id}>
                  <td>
                    <strong>{o.id}</strong>
                  </td>
                  <td>{o.date}</td>
                  <td>{o.items}</td>
                  <td>${o.total}</td>
                  <td>
                    <OrderStatusBadge status={o.payment} />
                  </td>
                  <td>
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td>
                    <Link
                      className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[0.82rem] font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
                      href={`/orders/${o.id}`}
                    >
                      View details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

