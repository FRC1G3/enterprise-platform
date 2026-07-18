"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { StoreProduct } from "@/lib/mock-data";

const categoryOptions = ["Men", "Women", "Shoes", "Accessories"].map(
  (value) => ({
    label: value,
    value,
  }),
);

export function ProductForm({ product }: { product?: StoreProduct }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState(product?.image ?? "");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setDone(true);
    }, 700);
  }

  return (
    <form onSubmit={submit} className="grid gap-[18px]">
      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Basic information</h2>
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Input
            label="Product name"
            name="name"
            defaultValue={product?.name}
            required
          />
          <Select
            label="Category"
            name="category"
            defaultValue={product?.category ?? "Men"}
            options={categoryOptions}
          />
          <div className="grid gap-[7px] md:col-span-2">
            <label className="text-[0.84rem] font-bold" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              className="min-h-[120px] w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              defaultValue={product?.description}
            />
          </div>
          <Input
            label="Price"
            name="price"
            type="number"
            defaultValue={product?.price}
          />
          <Input
            label="Original price"
            name="originalPrice"
            type="number"
            defaultValue={product?.originalPrice}
          />
          <Input
            label="Stock"
            name="stock"
            type="number"
            defaultValue={product?.stock}
          />
          <Input label="SKU" name="sku" defaultValue={product?.sku} />
        </div>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Media</h2>
        <Input
          label="Image URL"
          name="image"
          value={preview}
          onChange={(event) => setPreview(event.target.value)}
          placeholder="https://images.unsplash.com/..."
        />
        {preview && (
          <Image
            className="mt-3.5 rounded-lg object-cover"
            src={preview}
            alt="Product preview"
            width={150}
            height={185}
          />
        )}
        <p className="leading-7 text-slate-500">
          Image upload is represented by URL preview only in this frontend phase.
        </p>
      </section>

      <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <h2>Variants</h2>
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          <Input
            label="Sizes"
            name="sizes"
            defaultValue={product?.sizes.join(", ")}
            placeholder="S, M, L"
          />
          <Input
            label="Colors"
            name="colors"
            defaultValue={product?.colors.join(", ")}
            placeholder="Black, White"
          />
        </div>
        <div className="mt-[18px] flex items-center gap-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked={product?.isFeatured} />{" "}
            Featured product
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked /> Active status
          </label>
        </div>
      </section>

      {done && (
        <div className="rounded-md bg-emerald-50 p-3 text-emerald-700">
          Product saved in demo mode. No server action was called.
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
          href="/admin/products"
        >
          Cancel
        </Link>
        <Button type="submit" loading={loading}>
          Save product
        </Button>
      </div>
    </form>
  );
}
