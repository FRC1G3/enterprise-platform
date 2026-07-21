"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  CategorySalesItem,
  CustomerGrowthPoint,
  OrderStatusDistributionItem,
} from "@/types/analytics";

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const pieColors = [
  "#4338ca",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#dc2626",
];

export function CustomerGrowthChart({
  data,
}: {
  data: CustomerGrowthPoint[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="4 4"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />

          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip />

          <Bar
            dataKey="customers"
            name="New customers"
            fill="#4338ca"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategorySalesChart({
  data,
}: {
  data: CategorySalesItem[];
}) {
  if (data.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        No category sales for this period.
      </p>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            left: 20,
            right: 20,
          }}
        >
          <CartesianGrid
            strokeDasharray="4 4"
            horizontal={false}
          />

          <XAxis
            type="number"
            tickFormatter={(value) =>
              currencyFormatter.format(
                Number(value),
              )
            }
          />

          <YAxis
            type="category"
            dataKey="category"
            width={90}
            tickLine={false}
            axisLine={false}
          />

          <Tooltip
            formatter={(value) => [
              currencyFormatter.format(
                Number(value),
              ),
              "Revenue",
            ]}
          />

          <Bar
            dataKey="revenue"
            fill="#4338ca"
            radius={[0, 6, 6, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrderStatusChart({
  data,
}: {
  data: OrderStatusDistributionItem[];
}) {
  const visibleData = data.filter(
    (item) => item.count > 0,
  );

  if (visibleData.length === 0) {
    return (
      <p className="py-16 text-center text-slate-500">
        No orders for this period.
      </p>
    );
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <PieChart>
          <Pie
            data={visibleData}
            dataKey="count"
            nameKey="status"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={3}
          >
            {visibleData.map(
              (item, index) => (
                <Cell
                  key={item.status}
                  fill={
                    pieColors[
                      index %
                        pieColors.length
                    ]
                  }
                />
              ),
            )}
          </Pie>

          <Tooltip />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}