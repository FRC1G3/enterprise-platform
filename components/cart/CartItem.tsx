"use client";

import Image from "next/image";
import type { StoreProduct } from "@/lib/mock-data";

export type CartLine = {
  product: StoreProduct;
  quantity: number;
  size: string;
  color: string;
};

export function CartItem({
  item,
  onQuantity,
  onRemove,
}: {
  item: CartLine;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
}) {
  return (
    <article className="grid grid-cols-[120px_1fr_auto] gap-[18px] border-b border-slate-200 py-5 max-sm:grid-cols-[88px_1fr]">
      <Image
        className="rounded-lg object-cover"
        src={item.product.image}
        alt={item.product.name}
        width={120}
        height={145}
      />
      <div>
        <h3 className="mb-[7px] mt-0.5">{item.product.name}</h3>
        <div className="leading-7 text-slate-500">
          {item.color} · Size {item.size}
        </div>
        <div className="mt-4 flex w-max border border-slate-300">
          <button
            className="grid h-[42px] w-10 place-items-center bg-white"
            type="button"
            aria-label="Decrease quantity"
            onClick={() => onQuantity(Math.max(1, item.quantity - 1))}
          >
            −
          </button>
          <span className="grid h-[42px] w-10 place-items-center">
            {item.quantity}
          </span>
          <button
            className="grid h-[42px] w-10 place-items-center bg-white"
            type="button"
            aria-label="Increase quantity"
            onClick={() => onQuantity(item.quantity + 1)}
          >
            +
          </button>
        </div>
        <button
          type="button"
          className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent py-1.5 pr-3 text-[0.82rem] font-bold text-slate-600 transition hover:-translate-y-px hover:bg-slate-100"
          onClick={onRemove}
        >
          Remove
        </button>
      </div>
      <strong>${(item.product.price * item.quantity).toFixed(2)}</strong>
    </article>
  );
}
