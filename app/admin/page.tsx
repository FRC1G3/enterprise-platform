import Link from "next/link";

import { LowStockList } from "@/components/dashboard/LowStockList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SalesSummary } from "@/components/dashboard/SalesSummary";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import { getAdminDashboardData } from "@/lib/services/analytics.service";

export const dynamic = "force-dynamic";

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

const numberFormatter =
  new Intl.NumberFormat("en-US");

export default async function AdminDashboardPage() {
  const dashboard =
    await getAdminDashboardData();

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            Overview
          </span>

          <h1>Dashboard</h1>

          <p className="leading-7 text-slate-500">
            Live platform performance for
            the last{" "}
            {dashboard.periodDays} days.
          </p>
        </div>

        <Link
          href="/admin/analytics"
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900"
        >
          View analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Revenue"
          value={currencyFormatter.format(
            dashboard.stats.revenue.value,
          )}
          changePercentage={
            dashboard.stats.revenue
              .changePercentage
          }
        />

        <StatCard
          label="Orders"
          value={numberFormatter.format(
            dashboard.stats.orders.value,
          )}
          changePercentage={
            dashboard.stats.orders
              .changePercentage
          }
        />

        <StatCard
          label="Active products"
          value={numberFormatter.format(
            dashboard.stats.products.value,
          )}
          changePercentage={
            dashboard.stats.products
              .changePercentage
          }
        />

        <StatCard
          label="Customers"
          value={numberFormatter.format(
            dashboard.stats.customers.value,
          )}
          changePercentage={
            dashboard.stats.customers
              .changePercentage
          }
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2>Revenue trend</h2>

            <span className="inline-flex rounded-md bg-indigo-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-indigo-800">
              Last 30 days
            </span>
          </div>

          <SalesSummary
            data={
              dashboard.salesTrend
            }
          />
        </section>

        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h2>Order distribution</h2>

          {dashboard.orderStatusDistribution.map(
            (item) => (
              <div
                className="my-4"
                key={item.status}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>
                    {item.status.replaceAll(
                      "_",
                      " ",
                    )}
                  </span>

                  <strong>
                    {item.percentage}%
                  </strong>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <span
                    className="block h-full rounded-full bg-indigo-600"
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
              </div>
            ),
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2>Recent orders</h2>

            <Link
              href="/admin/orders"
              className="font-bold text-indigo-800"
            >
              View all
            </Link>
          </div>

          <div className="overflow-auto rounded-xl bg-white">
            <table className="w-full min-w-[760px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {dashboard.recentOrders.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center text-slate-500"
                    >
                      No orders yet.
                    </td>
                  </tr>
                ) : (
                  dashboard.recentOrders.map(
                    (order) => (
                      <tr key={order.id}>
                        <td>
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-bold text-indigo-800"
                          >
                            {
                              order.orderNumber
                            }
                          </Link>
                        </td>

                        <td>
                          {
                            order.customerName
                          }
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
                              order.status
                            }
                          />
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-[18px]">
          <div className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Low stock</h2>

            <LowStockList
              items={
                dashboard.lowStock
              }
            />
          </div>

          <div className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Recent activity</h2>

            <RecentActivity
              items={
                dashboard.recentActivity
              }
            />
          </div>
        </section>
      </div>
    </>
  );
}