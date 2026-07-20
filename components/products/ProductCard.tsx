"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

import { useCart } from "@/hooks/useCart";

import { AuthRequestError } from "@/lib/auth/client";
import { useAuthContext } from "@/lib/contexts/AuthContext";

import type { ProductCardItem } from "@/types/product";

interface ProductCardProps {
  product: ProductCardItem;
  view?: "grid" | "list";
}

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

export function ProductCard({
  product,
  view = "grid",
}: ProductCardProps) {
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuthContext();

  const { addItem } = useCart(isAuthenticated);

  const [isAdding, setIsAdding] =
    useState(false);

  const [feedback, setFeedback] =
    useState<Feedback>(null);

  const isOnSale = Boolean(
    product.originalPrice &&
      product.originalPrice > product.price,
  );

  const isUnavailable =
    !product.isActive || product.stock <= 0;

  async function addToCart() {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsAdding(true);
    setFeedback(null);

    try {
      await addItem({
        productId: product.id,
        quantity: 1,

        selectedColor:
          product.colors.length > 0
            ? product.colors[0]
            : null,

        selectedSize:
          product.sizes.length > 0
            ? product.sizes[0]
            : null,
      });

      setFeedback({
        type: "success",
        message: "Added to cart.",
      });
    } catch (error) {
      if (error instanceof AuthRequestError) {
        if (error.status === 401) {
          router.push("/login");
          return;
        }

        setFeedback({
          type: "error",
          message: error.message,
        });
      } else {
        console.error(
          "Product card add to cart error:",
          error,
        );

        setFeedback({
          type: "error",
          message:
            "Product could not be added to cart.",
        });
      }
    } finally {
      setIsAdding(false);
    }
  }

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

          {isUnavailable && (
            <span className="inline-flex rounded-md bg-red-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-red-700">
              Out of stock
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
          <h3 className="mb-2 mt-1">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-3">
          <span className="text-[0.8rem] text-yellow-700">
            ★ {product.rating}{" "}
            <span className="leading-7 text-slate-500">
              ({product.reviewCount})
            </span>
          </span>

          <span className="flex items-center gap-3">
            <span className="font-extrabold">
              ${product.price}
            </span>

            {isOnSale && (
              <span className="text-[0.88rem] text-slate-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </span>
        </div>

        <Button
          className="mt-3 w-full"
          loading={isAdding}
          disabled={
            isUnavailable || isAuthLoading
          }
          onClick={() => void addToCart()}
        >
          {isUnavailable
            ? "Out of stock"
            : "Add to cart"}
        </Button>

        {feedback && (
          <p
            className={`mt-2 text-center text-xs ${
              feedback.type === "success"
                ? "text-emerald-700"
                : "text-red-700"
            }`}
            role="alert"
          >
            {feedback.message}
          </p>
        )}
      </div>
    </article>
  );
}