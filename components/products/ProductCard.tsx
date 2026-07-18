"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { StoreProduct } from "@/lib/mock-data";

interface ProductCardProps {
  product: StoreProduct;
  view?: "grid" | "list";
}

export function ProductCard({ product, view = "grid" }: ProductCardProps) {
  const isOnSale = Boolean(
    product.originalPrice && product.originalPrice > product.price,
  );

  return (
    <article
      className={
        view === "list"
          ? "group grid gap-5 sm:grid-cols-[180px_1fr]"
          : "group"
      }
    >
      <div
        className={
          view === "list"
            ? "relative aspect-square overflow-hidden rounded-[10px] bg-slate-100"
            : "relative aspect-[4/5] overflow-hidden rounded-[10px] bg-slate-100"
        }
      >
        <Link href={`/products/${product.slug}`}>
          <Image
            className="object-cover transition duration-500 group-hover:scale-[1.035]"
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        <div className="absolute left-3 top-3 grid gap-1.5">
          {product.isNew && (
            <span className="inline-flex rounded-md bg-indigo-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-indigo-800">
              New
            </span>
          )}
          {isOnSale && (
            <span className="inline-flex rounded-md bg-red-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-red-700">
              Sale
            </span>
          )}
        </div>

        <button
          type="button"
          className="absolute right-3 top-3 inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white"
          aria-label={`Add ${product.name} to wishlist`}
        >
          ♡
        </button>
      </div>

      <div className="px-0.5 py-3.5">
        <span className="text-xs uppercase text-slate-500">
          {product.category}
        </span>
        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-2 mt-1">{product.name}</h3>
        </Link>
        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.8rem] text-yellow-700">
            ★ {product.rating}{" "}
            <span className="leading-7 text-slate-500">
              ({product.reviewCount})
            </span>
          </span>
          <span className="flex items-center gap-3">
            <span className="font-extrabold">${product.price}</span>
            {isOnSale && (
              <span className="text-[0.88rem] text-slate-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </span>
        </div>
        <Button className="mt-3 w-full">Add to cart</Button>
      </div>
    </article>
  );
}
