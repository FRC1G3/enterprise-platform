"use client";

import Image from "next/image";
import Link from "next/link";

import type {
  CartItem as CartItemData,
} from "@/types/cart";

interface CartItemProps {
  item: CartItemData;

  isUpdating: boolean;
  isRemoving: boolean;

  onQuantity: (
    quantity: number,
  ) => void;

  onRemove: () => void;
}

export function CartItem({
  item,
  isUpdating,
  isRemoving,
  onQuantity,
  onRemove,
}: CartItemProps) {
  const isBusy =
    isUpdating || isRemoving;

  return (
    <article className="grid grid-cols-[120px_1fr_auto] gap-[18px] border-b border-slate-200 py-5 max-sm:grid-cols-[88px_1fr]">
      <Link
        href={`/products/${item.product.slug}`}
      >
        <Image
          className="h-[145px] w-[120px] rounded-lg object-cover max-sm:h-[110px] max-sm:w-[88px]"
          src={item.product.image}
          alt={item.product.name}
          width={120}
          height={145}
        />
      </Link>

      <div>
        <Link
          href={`/products/${item.product.slug}`}
        >
          <h3 className="mb-[7px] mt-0.5">
            {item.product.name}
          </h3>
        </Link>

        <div className="leading-7 text-slate-500">
          {[
            item.selectedColor,
            item.selectedSize
              ? `Size ${item.selectedSize}`
              : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Standard option"}
        </div>

        <div className="mt-4 flex w-max border border-slate-300">
          <button
            className="grid h-[42px] w-10 place-items-center bg-white disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            aria-label="Decrease quantity"
            disabled={
              isBusy || item.quantity <= 1
            }
            onClick={() =>
              onQuantity(
                Math.max(
                  1,
                  item.quantity - 1,
                ),
              )
            }
          >
            −
          </button>

          <span className="grid h-[42px] min-w-10 place-items-center px-2">
            {isUpdating
              ? "..."
              : item.quantity}
          </span>

          <button
            className="grid h-[42px] w-10 place-items-center bg-white disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            aria-label="Increase quantity"
            disabled={
              isBusy ||
              item.quantity >=
                item.product.stock
            }
            onClick={() =>
              onQuantity(
                item.quantity + 1,
              )
            }
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="mt-2 inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent py-1.5 pr-3 text-[0.82rem] font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isBusy}
          onClick={onRemove}
        >
          {isRemoving
            ? "Removing..."
            : "Remove"}
        </button>
      </div>

      <strong className="max-sm:col-start-2">
        ${item.lineTotal.toFixed(2)}
      </strong>
    </article>
  );
}