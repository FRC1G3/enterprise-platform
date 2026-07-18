"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/types/product";
import { ProductList } from "./ProductList";

type ProductDetailsProps = {
  product: Product;
  related: Product[];
};

export function ProductDetails({ product, related }: ProductDetailsProps) {
  const [image, setImage] = useState(product.image);
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [color, setColor] = useState(product.colors[0] ?? "");
  const [qty, setQty] = useState(1);

  return (
    <>
      <div className="grid gap-[54px] md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-xl">
            <Image
              className="h-full w-full object-cover"
              src={image}
              alt={product.name}
              width={900}
              height={1125}
              priority
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2.5">
            {product.images.map((src, index) => (
              <button
                className={`h-[92px] w-[78px] border-2 p-0 ${
                  image === src ? "border-indigo-900" : "border-transparent"
                }`}
                onClick={() => setImage(src)}
                key={src}
                type="button"
                aria-label={`View image ${index + 1}`}
              >
                <Image
                  className="h-full w-full object-cover"
                  src={src}
                  alt=""
                  width={90}
                  height={110}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            {product.category}
          </span>
          <h1 className="text-[clamp(2rem,4vw,3.4rem)]">{product.name}</h1>
          <div className="text-[0.8rem] text-yellow-700">
            ★★★★★{" "}
            <span className="leading-7 text-slate-500">
              {product.rating} · {product.reviewCount} reviews
            </span>
          </div>
          <div className="my-[18px] text-[1.7rem] font-black">
            ${product.price}{" "}
            {product.originalPrice && (
              <span className="text-[0.88rem] text-slate-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <p className="leading-7 text-slate-500">{product.description}</p>

          <div className="border-t border-slate-200 py-5">
            <div className="flex items-center justify-between gap-3">
              <strong>Color</strong>
              <span className="leading-7 text-slate-500">{color}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.colors.map((value) => (
                <button
                  className={`rounded-md border bg-white px-3 py-2 ${
                    color === value ? "border-indigo-900" : "border-slate-300"
                  }`}
                  type="button"
                  onClick={() => setColor(value)}
                  key={value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 py-5">
            <div className="flex items-center justify-between gap-3">
              <strong>Size</strong>
              <a href="#" className="leading-7 text-slate-500">
                Size guide
              </a>
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
              {product.sizes.map((value) => (
                <button
                  className={`rounded-md border bg-white px-3 py-2 ${
                    size === value ? "border-indigo-900" : "border-slate-300"
                  }`}
                  type="button"
                  onClick={() => setSize(value)}
                  key={value}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <strong>Quantity</strong>
                <div className="mt-2.5 flex w-max border border-slate-300">
                  <button
                    className="grid h-[42px] w-10 place-items-center bg-white"
                    type="button"
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="grid h-[42px] w-10 place-items-center">
                    {qty}
                  </span>
                  <button
                    className="grid h-[42px] w-10 place-items-center bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    onClick={() =>
                      setQty((current) => Math.min(product.stock, current + 1))
                    }
                    disabled={qty >= product.stock}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
              <span
                className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                  product.stock < 8
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {product.stock} in stock
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Button size="lg">Add to cart</Button>
            <Button size="lg" variant="secondary">
              Buy now
            </Button>
          </div>

          <Button variant="ghost" className="mt-2 w-full">
            ♡ Add to wishlist
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 p-[15px]">
              <strong>Free shipping</strong>
              <div className="leading-7 text-slate-500">
                On orders above $100
              </div>
            </div>
            <div className="bg-slate-50 p-[15px]">
              <strong>Easy returns</strong>
              <div className="leading-7 text-slate-500">Within 30 days</div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 py-5">
            <h3>Product details</h3>
            <p className="leading-7 text-slate-500">
              Premium materials · Designed for everyday wear · SKU {product.sku}{" "}
              · Thoughtfully finished.
            </p>
          </div>

          <div className="border-t border-slate-200 py-5">
            <h3>Reviews ({product.reviewCount})</h3>
            <p className="leading-7 text-slate-500">
              Customer review content will be available when the review service
              is connected.
            </p>
          </div>
        </div>
      </div>

      <section className="py-[72px]">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
              You may also like
            </span>
            <h2 className="my-2 text-[clamp(1.8rem,4vw,2.7rem)] leading-[1.1]">
              Related products
            </h2>
          </div>
        </div>
        <ProductList products={related} />
      </section>
    </>
  );
}
