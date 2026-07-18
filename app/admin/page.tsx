import Link from "next/link";
import { LowStockList } from "@/components/dashboard/LowStockList";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SalesSummary } from "@/components/dashboard/SalesSummary";
import { StatCard } from "@/components/dashboard/StatCard";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { dashboardStats, orders } from "@/lib/mock-data";

const orderDistribution = [
  ["Delivered", 68],
  ["Processing", 18],
  ["Shipped", 10],
  ["Cancelled", 4],
];

export default function AdminDashboardPage() {
  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Overview</span>
          <h1>Dashboard</h1>
          <p className="leading-7 text-slate-500">
            Welcome back, Ava. Here is what is happening today.
          </p>
        </div>
        <button className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900" type="button">
          Download report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2>Sales summary</h2>
            <span className="inline-flex rounded-md bg-indigo-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-indigo-800">
              Last 7 days
            </span>
          </div>
          <SalesSummary />
        </section>

        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <h2>Order distribution</h2>
          {orderDistribution.map(([label, value]) => (
            <div className="my-4" key={label}>
              <div className="flex items-center justify-between gap-3">
                <span>{label}</span>
                <strong>{value}%</strong>
              </div>
              <div className="h-2 bg-slate-200">
                <span
                  className="block h-full bg-indigo-600"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between gap-3">
            <h2>Recent orders</h2>
            <Link href="/admin/orders">View all</Link>
          </div>
          <div className="overflow-auto rounded-xl bg-white">
            <table className="w-full min-w-[760px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>${order.total}</td>
                    <td>
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-[18px]">
          <div className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Low stock</h2>
            <LowStockList />
          </div>
          <div className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>Recent activity</h2>
            <RecentActivity />
          </div>
        </section>
      </div>
    </>
  );
}

