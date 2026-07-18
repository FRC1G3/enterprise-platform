"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { orders, products } from "@/lib/mock-data";

const orderStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const order = orders.find((item) => item.id === id) ?? orders[0];
  const [status, setStatus] = useState(order.status);
  const [done, setDone] = useState(false);

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <Link href="/admin/orders" className="leading-7 text-slate-500">
            ← Orders
          </Link>
          <h1>Order {order.id}</h1>
          <p className="leading-7 text-slate-500">Received {order.date}</p>
        </div>
        <OrderStatusBadge status={status} />
      </div>

      <div className="grid gap-[38px] lg:grid-cols-[1fr_370px]">
        <div className="grid gap-[18px]">
          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Customer & shipping</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <small className="leading-7 text-slate-500">Customer</small>
                <p>
                  <strong>{order.customer}</strong>
                  <br />
                  emma@example.com
                  <br />
                  +1 202 555 0142
                </p>
              </div>
              <div>
                <small className="leading-7 text-slate-500">Address</small>
                <p>{order.address}</p>
              </div>
            </div>
          </section>

          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Products</h2>
            {products.slice(0, 3).map((product) => (
              <div
                className="flex items-center justify-between gap-3 border-b border-slate-200 py-3"
                key={product.id}
              >
                <div className="flex items-center gap-3">
                  <Image
                    className="rounded-[5px] object-cover"
                    src={product.image}
                    alt={product.name}
                    width={48}
                    height={58}
                  />
                  <div>
                    <strong>{product.name}</strong>
                    <div className="leading-7 text-slate-500">
                      Qty 1 · {product.sku}
                    </div>
                  </div>
                </div>
                <strong>${product.price}</strong>
              </div>
            ))}
          </section>

          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Timeline</h2>
            <div className="grid gap-5 border-l-2 border-slate-300 pl-6">
              {["Order received", "Payment confirmed", "Processing"].map(
                (item) => (
                  <div key={item}>
                    <strong>{item}</strong>
                    <div className="leading-7 text-slate-500">Jul 15, 2026</div>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <aside className="grid gap-[18px]">
          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h3>Update status</h3>
            <select
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setDone(false);
              }}
              aria-label="Order status"
            >
              {orderStatuses.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <label className="mt-3.5 grid gap-[7px]">
              <span>Internal notes</span>
              <textarea
                className="min-h-[120px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                placeholder="Visible to admins only"
              />
            </label>
            {done && (
              <div className="mt-3 rounded-md bg-emerald-50 p-3 text-emerald-700">
                Order updated in mock state.
              </div>
            )}
            <Button
              className="mt-3.5 w-full"
              onClick={() => setDone(true)}
            >
              Update order
            </Button>
          </section>

          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h3>Payment</h3>
            <p>Mock card ···· 4242</p>
            <OrderStatusBadge status={order.payment} />
            <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-[18px] text-[1.18rem] font-black">
              <span>Total</span>
              <span>${order.total}</span>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

