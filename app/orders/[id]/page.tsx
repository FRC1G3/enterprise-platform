import Image from "next/image";
import Link from "next/link";
import {
  notFound,
  redirect,
} from "next/navigation";

import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import { getSession } from "@/lib/auth/session";

import {
  getOrderForUser,
  OrderNotFoundError,
} from "@/lib/services/order.service";

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

const dateFormatter =
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const statusTimeline = [
  {
    status: "PENDING",
    label: "Order received",
  },
  {
    status: "CONFIRMED",
    label: "Order confirmed",
  },
  {
    status: "PROCESSING",
    label: "Processing",
  },
  {
    status: "SHIPPED",
    label: "Shipped",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
  },
] as const;

async function getOrderPageData(
  id: string,
) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  try {
    return await getOrderForUser(
      session.userId,
      id,
    );
  } catch (error) {
    if (
      error instanceof
      OrderNotFoundError
    ) {
      notFound();
    }

    throw error;
  }
}

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const order =
    await getOrderPageData(id);

  const currentStatusIndex =
    statusTimeline.findIndex(
      (item) =>
        item.status === order.status,
    );

  const paymentMethodLabel =
    order.paymentMethod ===
    "CASH_ON_DELIVERY"
      ? "Cash on delivery"
      : "Mock card payment";

  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <Link
              href="/profile"
              className="leading-7 text-slate-500"
            >
              ← Back to profile
            </Link>

            <h1>
              Order {order.orderNumber}
            </h1>

            <p className="leading-7 text-slate-500">
              Placed{" "}
              {dateFormatter.format(
                new Date(order.createdAt),
              )}
            </p>
          </div>

          <OrderStatusBadge
            status={order.status}
          />
        </div>

        <div className="grid gap-[38px] lg:grid-cols-[1fr_370px]">
          <div className="grid gap-[18px]">
            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Order timeline</h2>

              {order.status ===
              "CANCELLED" ? (
                <div className="rounded-lg bg-red-50 p-4 text-red-700">
                  This order was cancelled.
                </div>
              ) : (
                <div className="grid gap-5 border-l-2 border-slate-300 pl-6">
                  {statusTimeline.map(
                    (item, index) => {
                      const isCompleted =
                        currentStatusIndex >=
                        index;

                      return (
                        <div
                          key={item.status}
                        >
                          <strong>
                            {item.label}
                          </strong>

                          <div
                            className={
                              isCompleted
                                ? "leading-7 text-emerald-700"
                                : "leading-7 text-slate-500"
                            }
                          >
                            {isCompleted
                              ? "Completed"
                              : "Pending"}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Items</h2>

              {order.items.map((item) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-[13px]"
                  key={item.id}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      className="h-[68px] w-[56px] rounded-md object-cover"
                      src={item.productImage}
                      alt={item.productName}
                      width={56}
                      height={68}
                    />

                    <div>
                      <strong>
                        {item.productName}
                      </strong>

                      <div className="leading-7 text-slate-500">
                        Qty {item.quantity}

                        {item.selectedColor
                          ? ` · ${item.selectedColor}`
                          : ""}

                        {item.selectedSize
                          ? ` · ${item.selectedSize}`
                          : ""}
                      </div>
                    </div>
                  </div>

                  <strong>
                    {currencyFormatter.format(
                      item.totalPrice,
                    )}
                  </strong>
                </div>
              ))}
            </section>

            {order.notes && (
              <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
                <h2>Order notes</h2>

                <p className="leading-7 text-slate-500">
                  {order.notes}
                </p>
              </section>
            )}
          </div>

          <aside className="grid h-max gap-[18px]">
            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h3>Customer</h3>

              <p className="leading-7 text-slate-500">
                {order.customerName}
                <br />
                {order.customerEmail}

                {order.customerPhone && (
                  <>
                    <br />
                    {order.customerPhone}
                  </>
                )}
              </p>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h3>Shipping address</h3>

              <p className="leading-7 text-slate-500">
                {order.shippingAddress}
                <br />

                {order.shippingCity},{" "}
                {
                  order.shippingPostalCode
                }

                <br />
                {order.shippingCountry}
              </p>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h3>Payment</h3>

              <p>{paymentMethodLabel}</p>

              <OrderStatusBadge
                status={
                  order.paymentStatus
                }
              />
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>

                <span>
                  {currencyFormatter.format(
                    order.subtotal,
                  )}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span>Shipping</span>

                <span>
                  {order.shipping === 0
                    ? "Free"
                    : currencyFormatter.format(
                        order.shipping,
                      )}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span>Discount</span>

                <span>
                  −
                  {currencyFormatter.format(
                    order.discount,
                  )}
                </span>
              </div>

              <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-[18px] text-[1.18rem] font-black">
                <span>Total</span>

                <span>
                  {currencyFormatter.format(
                    order.total,
                  )}
                </span>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}