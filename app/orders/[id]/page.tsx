import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { orders, products } from "@/lib/mock-data";

const timeline = ["Order confirmed", "Processing", "Shipped", "Delivered"];

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = orders.find((item) => item.id === id);

  if (!order) {
    notFound();
  }

  const items = products.slice(0, order.items);

  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <Link href="/orders" className="leading-7 text-slate-500">
              ← Back to orders
            </Link>
            <h1>Order {order.id}</h1>
            <p className="leading-7 text-slate-500">Placed {order.date}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="grid gap-[38px] lg:grid-cols-[1fr_370px]">
          <div className="grid gap-[18px]">
            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Order timeline</h2>
              <div className="grid gap-5 border-l-2 border-slate-300 pl-6">
                {timeline.map((item, index) => (
                  <div key={item}>
                    <strong>{item}</strong>
                    <div className="leading-7 text-slate-500">
                      {index < 2 ? "Completed" : "Pending"}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Items</h2>
              {items.map((product) => (
                <div
                  className="flex items-center justify-between gap-3 border-b border-slate-200 py-[13px]"
                  key={product.id}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      className="rounded-md object-cover"
                      src={product.image}
                      alt={product.name}
                      width={56}
                      height={68}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <div className="leading-7 text-slate-500">Qty 1</div>
                    </div>
                  </div>
                  <strong>${product.price}</strong>
                </div>
              ))}
            </section>

            {["PENDING", "PROCESSING"].includes(order.status) && (
              <button className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-red-600 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-red-700" type="button">
                Cancel order
              </button>
            )}
          </div>

          <aside className="grid gap-[18px]">
            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h3>Shipping address</h3>
              <p className="leading-7 text-slate-500">
                {order.customer}
                <br />
                {order.address}
              </p>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h3>Payment</h3>
              <p>Mock card ending in 4242</p>
              <OrderStatusBadge status={order.payment} />
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>${order.total}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-[18px] text-[1.18rem] font-black">
                <span>Total</span>
                <span>${order.total}</span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

