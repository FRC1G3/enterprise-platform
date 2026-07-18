"use client";

import Image from "next/image";
import { useState } from "react";
import { products } from "@/lib/mock-data";

export default function AdminInventoryPage() {
  const [stocks, setStocks] = useState(
    Object.fromEntries(products.map((product) => [product.id, product.stock])),
  );

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Stock control</span>
          <h1>Inventory</h1>
          <p className="leading-7 text-slate-500">Monitor availability and update mock stock levels.</p>
        </div>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Current</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const stock = stocks[product.id];
              const reserved = Math.min(2, stock);
              const status =
                stock === 0
                  ? "Out of stock"
                  : stock < 10
                    ? "Low stock"
                    : "In stock";

              return (
                <tr
                  key={product.id}
                  className={stock < 10 ? "stock-low" : ""}
                >
                  <td>
                    <div className="flex items-center gap-[11px]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={44}
                        height={52}
                      />
                      <strong>{product.name}</strong>
                    </div>
                  </td>
                  <td>{product.sku}</td>
                  <td>{stock}</td>
                  <td>{reserved}</td>
                  <td>{stock - reserved}</td>
                  <td>
                    <span
                      className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                        stock === 0
                          ? "bg-red-50 text-red-700"
                          : stock < 10
                            ? "bg-amber-50 text-amber-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-3">
                      <button
                        className="relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white"
                        type="button"
                        aria-label={`Decrease ${product.name} stock`}
                        onClick={() =>
                          setStocks((current) => ({
                            ...current,
                            [product.id]: Math.max(0, stock - 1),
                          }))
                        }
                      >
                        −
                      </button>
                      <button
                        className="relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white"
                        type="button"
                        aria-label={`Increase ${product.name} stock`}
                        onClick={() =>
                          setStocks((current) => ({
                            ...current,
                            [product.id]: stock + 1,
                          }))
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

