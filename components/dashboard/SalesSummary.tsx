"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type {
  SalesTrendPoint,
} from "@/types/analytics";

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

interface SalesSummaryProps {
  data: SalesTrendPoint[];
}

export function SalesSummary({
  data,
}: SalesSummaryProps) {
  return (
    <div
      className="h-[260px] w-full"
      aria-label="Revenue trend chart"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
      >
        <AreaChart
          data={data}
          margin={{
            top: 15,
            right: 15,
            left: 0,
            bottom: 0,
          }}
        >
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
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(value) =>
              currencyFormatter.format(
                Number(value),
              )
            }
          />

          <Tooltip
            formatter={(value) => [
              currencyFormatter.format(
                Number(value),
              ),
              "Revenue",
            ]}
          />

          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#4338ca"
            fill="#c7d2fe"
            strokeWidth={3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}