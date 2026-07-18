"use client";

import Link from "next/link";
import { useState } from "react";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { orders } from "@/lib/mock-data";

const paymentStatuses = ["PAID", "PENDING", "REFUNDED"];
const orderStatuses = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [payment, setPayment] = useState("");

  const rows = orders.filter(
    (order) =>
      (order.id.toLowerCase().includes(q.toLowerCase()) ||
        order.customer.toLowerCase().includes(q.toLowerCase())) &&
      (!status || order.status === status) &&
      (!payment || order.payment === payment),
  );

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Operations</span>
          <h1>Orders</h1>
          <p className="leading-7 text-slate-500">Review and manage customer orders.</p>
        </div>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-2.5 [&_input]:min-w-[170px] [&_input]:w-auto [&_select]:min-w-[170px] [&_select]:w-auto">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search order or customer"
          aria-label="Search orders"
        />
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={payment}
          onChange={(event) => setPayment(event.target.value)}
          aria-label="Payment status"
        >
          <option value="">All payments</option>
          {paymentStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          aria-label="Order status"
        >
          <option value="">All statuses</option>
          {orderStatuses.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <input className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200" type="date" aria-label="Order date" />
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
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
            {rows.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.id}</strong>
                </td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>{order.items}</td>
                <td>${order.total}</td>
                <td>
                  <OrderStatusBadge status={order.payment} />
                </td>
                <td>
                  <OrderStatusBadge status={order.status} />
                </td>
                <td>
                  <Link
                    className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[0.82rem] font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
                    href={`/admin/orders/${order.id}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

