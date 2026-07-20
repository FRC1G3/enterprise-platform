import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AdminOrderStatusForm } from "@/components/orders/AdminOrderStatusForm";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import {
  AdminOrderNotFoundError,
  getAdminOrder,
} from "@/lib/services/admin-order.service";

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

const orderTimeline = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
] as const;

async function getOrderPageData(
  id: string,
) {
  try {
    return await getAdminOrder(id);
  } catch (error) {
    if (
      error instanceof
      AdminOrderNotFoundError
    ) {
      notFound();
    }

    throw error;
  }
}

export default async function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const order =
    await getOrderPageData(id);

  const currentTimelineIndex =
    orderTimeline.findIndex(
      (status) =>
        status === order.status,
    );

  const paymentMethodLabel =
    order.paymentMethod ===
    "CASH_ON_DELIVERY"
      ? "Cash on delivery"
      : "Mock card payment";

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link
            href="/admin/orders"
            className="leading-7 text-slate-500"
          >
            ← Orders
          </Link>

          <h1>
            Order {order.orderNumber}
          </h1>

          <p className="leading-7 text-slate-500">
            Received{" "}
            {dateFormatter.format(
              new Date(
                order.createdAt,
              ),
            )}
          </p>
        </div>

        <OrderStatusBadge
          status={order.status}
        />
      </div>

      <div className="grid gap-[38px] lg:grid-cols-[1fr_370px]">
        <div className="grid gap-[18px]">
          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>
              Customer and shipping
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <small className="leading-7 text-slate-500">
                  Customer
                </small>

                <p>
                  <strong>
                    {order.customerName}
                  </strong>

                  <br />

                  {order.customerEmail}

                  {order.customerPhone && (
                    <>
                      <br />

                      {
                        order.customerPhone
                      }
                    </>
                  )}
                </p>
              </div>

              <div>
                <small className="leading-7 text-slate-500">
                  Address
                </small>

                <p>
                  {order.shippingAddress}

                  <br />

                  {order.shippingCity},{" "}
                  {
                    order.shippingPostalCode
                  }

                  <br />

                  {
                    order.shippingCountry
                  }
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Products</h2>

            {order.items.map(
              (item) => (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-3"
                  key={item.id}
                >
                  <div className="flex items-center gap-3">
                    <Image
                      className="h-[64px] w-[52px] rounded-[5px] object-cover"
                      src={
                        item.productImage
                      }
                      alt={
                        item.productName
                      }
                      width={52}
                      height={64}
                    />

                    <div>
                      <strong>
                        {item.productName}
                      </strong>

                      <div className="leading-7 text-slate-500">
                        Qty{" "}
                        {item.quantity}

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
              ),
            )}
          </section>

          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Timeline</h2>

            {order.status ===
            "CANCELLED" ? (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                This order was cancelled.
              </div>
            ) : (
              <div className="grid gap-5 border-l-2 border-slate-300 pl-6">
                {orderTimeline.map(
                  (
                    status,
                    index,
                  ) => (
                    <div key={status}>
                      <strong>
                        {status.replaceAll(
                          "_",
                          " ",
                        )}
                      </strong>

                      <div
                        className={
                          currentTimelineIndex >=
                          index
                            ? "leading-7 text-emerald-700"
                            : "leading-7 text-slate-500"
                        }
                      >
                        {currentTimelineIndex >=
                        index
                          ? "Completed"
                          : "Pending"}
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}
          </section>

          {order.notes && (
            <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Customer notes</h2>

              <p className="leading-7 text-slate-500">
                {order.notes}
              </p>
            </section>
          )}
        </div>

        <aside className="grid h-max gap-[18px]">
          <AdminOrderStatusForm
            order={order}
          />

          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h3>Payment</h3>

            <p>{paymentMethodLabel}</p>

            <OrderStatusBadge
              status={
                order.paymentStatus
              }
            />
          </section>

          <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
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
    </>
  );
}