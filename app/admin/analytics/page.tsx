"use client";

import dynamic from "next/dynamic";

import {
  useState,
} from "react";

import {
  StatCard,
} from "@/components/dashboard/StatCard";

import {
  type AnalyticsPeriod,
  useAnalytics,
} from "@/hooks/useAnalytics";

function ChartLoading() {
  return (
    <div className="grid h-[280px] place-items-center rounded-lg bg-slate-50 text-sm text-slate-500">
      Loading chart...
    </div>
  );
}

const SalesSummary = dynamic(
  () =>
    import(
      "@/components/dashboard/SalesSummary"
    ).then(
      (module) =>
        module.SalesSummary,
    ),
  {
    loading: ChartLoading,
  },
);

const CustomerGrowthChart =
  dynamic(
    () =>
      import(
        "@/components/dashboard/AnalyticsCharts"
      ).then(
        (module) =>
          module.CustomerGrowthChart,
      ),
    {
      loading: ChartLoading,
    },
  );

const CategorySalesChart =
  dynamic(
    () =>
      import(
        "@/components/dashboard/AnalyticsCharts"
      ).then(
        (module) =>
          module.CategorySalesChart,
      ),
    {
      loading: ChartLoading,
    },
  );

const OrderStatusChart =
  dynamic(
    () =>
      import(
        "@/components/dashboard/AnalyticsCharts"
      ).then(
        (module) =>
          module.OrderStatusChart,
      ),
    {
      loading: ChartLoading,
    },
  );

const currencyFormatter =
  new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
    },
  );

const numberFormatter =
  new Intl.NumberFormat(
    "en-US",
  );

export default function AdminAnalyticsPage() {
  const [
    period,
    setPeriod,
  ] =
    useState<AnalyticsPeriod>(
      30,
    );

  const {
    analytics,
    error,
    isLoading,
    isValidating,
  } = useAnalytics(period);

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            Performance
          </span>

          <h1>Analytics</h1>

          <p className="leading-7 text-slate-500">
            Live revenue, customer and
            product performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isValidating &&
            !isLoading && (
              <span className="text-sm text-slate-500">
                Refreshing...
              </span>
            )}

          <select
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            value={period}
            onChange={(event) =>
              setPeriod(
                Number(
                  event.target.value,
                ) as AnalyticsPeriod,
              )
            }
            aria-label="Analytics period"
          >
            <option value={7}>
              Last 7 days
            </option>

            <option value={30}>
              Last 30 days
            </option>

            <option value={90}>
              Last 90 days
            </option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          Analytics could not be
          loaded. {error.message}
        </div>
      )}

      {isLoading ||
      !analytics ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          Loading analytics...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue"
              value={currencyFormatter.format(
                analytics.summary
                  .revenue.value,
              )}
              changePercentage={
                analytics.summary
                  .revenue
                  .changePercentage
              }
            />

            <StatCard
              label="Orders"
              value={numberFormatter.format(
                analytics.summary
                  .orders.value,
              )}
              changePercentage={
                analytics.summary
                  .orders
                  .changePercentage
              }
            />

            <StatCard
              label="New customers"
              value={numberFormatter.format(
                analytics.summary
                  .customers.value,
              )}
              changePercentage={
                analytics.summary
                  .customers
                  .changePercentage
              }
            />

            <StatCard
              label="Average order value"
              value={currencyFormatter.format(
                analytics.summary
                  .averageOrderValue
                  .value,
              )}
              changePercentage={
                analytics.summary
                  .averageOrderValue
                  .changePercentage
              }
            />
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
            <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Revenue trend</h2>

              <SalesSummary
                data={
                  analytics.salesTrend
                }
              />
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Order status</h2>

              <OrderStatusChart
                data={
                  analytics.orderStatusDistribution
                }
              />
            </section>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>New customers</h2>

              <CustomerGrowthChart
                data={
                  analytics.customerGrowth
                }
              />
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Sales by category</h2>

              <CategorySalesChart
                data={
                  analytics.salesByCategory
                }
              />
            </section>
          </div>

          <section className="mt-5 rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <h2>
              Top-selling products
            </h2>

            <div className="overflow-auto">
              <table className="w-full min-w-[650px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-slate-500">
                <thead>
                  <tr>
                    <th>Position</th>
                    <th>Product</th>
                    <th>Units sold</th>
                    <th>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {analytics
                    .topProducts
                    .length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center text-slate-500"
                      >
                        No product sales
                        for this period.
                      </td>
                    </tr>
                  ) : (
                    analytics
                      .topProducts
                      .map(
                        (
                          product,
                          index,
                        ) => (
                          <tr
                            key={`${product.productId}-${product.productName}`}
                          >
                            <td>
                              #
                              {index + 1}
                            </td>

                            <td>
                              <strong>
                                {
                                  product.productName
                                }
                              </strong>
                            </td>

                            <td>
                              {
                                product.quantity
                              }
                            </td>

                            <td>
                              {currencyFormatter.format(
                                product.revenue,
                              )}
                            </td>
                          </tr>
                        ),
                      )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </>
  );
}