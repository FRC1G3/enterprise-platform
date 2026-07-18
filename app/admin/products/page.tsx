"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { products as seed } from "@/lib/mock-data";

const categories = ["Men", "Women", "Shoes", "Accessories"];

export default function AdminProductsPage() {
  const [rows, setRows] = useState(seed);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [target, setTarget] = useState<string | null>(null);

  const visible = useMemo(
    () =>
      rows.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) &&
          (!category || product.category === category) &&
          (!stock || (stock === "low" ? product.stock < 10 : product.stock >= 10)),
      ),
    [rows, search, category, stock],
  );

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Catalog</span>
          <h1>Products</h1>
          <p className="leading-7 text-slate-500">{rows.length} products in your catalog</p>
        </div>
        <Link className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900" href="/admin/products/create">
          + Add product
        </Link>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-2.5 [&_input]:min-w-[170px] [&_input]:w-auto [&_select]:min-w-[170px] [&_select]:w-auto">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products"
          aria-label="Search products"
        />
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter category"
        >
          <option value="">All categories</option>
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          value={stock}
          onChange={(event) => setStock(event.target.value)}
          aria-label="Filter stock"
        >
          <option value="">All stock</option>
          <option value="low">Low stock</option>
          <option value="ok">In stock</option>
        </select>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((product) => (
              <tr
                key={product.id}
                className={product.stock < 6 ? "bg-amber-50" : ""}
              >
                <td>
                  <div className="flex items-center gap-[11px]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={44}
                      height={52}
                    />
                    <div>
                      <strong>{product.name}</strong>
                      <div className="leading-7 text-slate-500">{product.sku}</div>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span
                    className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                      product.stock
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {product.stock ? "Active" : "Out of stock"}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <Link
                      className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[0.82rem] font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
                      href={`/admin/products/${product.id}/edit`}
                    >
                      Edit
                    </Link>
                    <button
                      className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-[0.82rem] font-bold text-slate-600 transition hover:-translate-y-px hover:bg-slate-100"
                      onClick={() => setTarget(product.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav className="mt-[42px] flex justify-center gap-[7px]">
        <button
          type="button"
          className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-indigo-900 text-white"
        >
          1
        </button>
        <button
          type="button"
          className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-white"
        >
          2
        </button>
        <button
          type="button"
          className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-white"
        >
          3
        </button>
      </nav>

      <Modal
        open={Boolean(target)}
        title="Delete product?"
        onClose={() => setTarget(null)}
      >
        <p className="leading-7 text-slate-500">
          This removes the product from the current mock table only.
        </p>
        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={() => setTarget(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setRows((currentRows) =>
                currentRows.filter((product) => product.id !== target),
              );
              setTarget(null);
            }}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}

