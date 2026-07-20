"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ProductList } from "@/components/products/ProductList";

import { useCart } from "@/hooks/useCart";

import { AuthRequestError } from "@/lib/auth/client";
import { useAuthContext } from "@/lib/contexts/AuthContext";

import type { Product } from "@/types/product";

type ProductDetailsProps = {
  product: Product;
  related: Product[];
};

type PendingAction =
  | "cart"
  | "checkout"
  | null;

type Feedback = {
  type: "success" | "error";
  message: string;
} | null;

export function ProductDetails({
  product,
  related,
}: ProductDetailsProps) {
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuthContext();

  const { addItem } = useCart(
    isAuthenticated,
  );

  const productImages =
    product.images.length > 0
      ? product.images
      : [product.image];

  const [image, setImage] = useState(
    product.image,
  );

  const [size, setSize] = useState(
    product.sizes[0] ?? "",
  );

  const [color, setColor] = useState(
    product.colors[0] ?? "",
  );

  const [quantity, setQuantity] =
    useState(1);

  const [pendingAction, setPendingAction] =
    useState<PendingAction>(null);

  const [feedback, setFeedback] =
    useState<Feedback>(null);

  async function addProductToCart(
    destination: "cart" | "checkout",
  ) {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setPendingAction(destination);
    setFeedback(null);

    try {
      await addItem({
        productId: product.id,
        quantity,

        selectedColor:
          product.colors.length > 0
            ? color
            : null,

        selectedSize:
          product.sizes.length > 0
            ? size
            : null,
      });

      if (destination === "checkout") {
        router.push("/checkout");
        return;
      }

      setFeedback({
        type: "success",
        message:
          "Product added to your cart.",
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
          "Add to cart error:",
          error,
        );

        setFeedback({
          type: "error",
          message:
            "Product could not be added to cart.",
        });
      }
    } finally {
      setPendingAction(null);
    }
  }

  const isOutOfStock =
    product.stock <= 0 ||
    !product.isActive;

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
            {productImages.map(
              (source, index) => (
                <button
                  className={`h-[92px] w-[78px] border-2 p-0 ${
                    image === source
                      ? "border-indigo-900"
                      : "border-transparent"
                  }`}
                  onClick={() =>
                    setImage(source)
                  }
                  key={`${source}-${index}`}
                  type="button"
                  aria-label={`View image ${
                    index + 1
                  }`}
                >
                  <Image
                    className="h-full w-full object-cover"
                    src={source}
                    alt=""
                    width={90}
                    height={110}
                  />
                </button>
              ),
            )}
          </div>
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            {product.category}
          </span>

          <h1 className="text-[clamp(2rem,4vw,3.4rem)]">
            {product.name}
          </h1>

          <div className="text-[0.8rem] text-yellow-700">
            ★★★★★{" "}
            <span className="leading-7 text-slate-500">
              {product.rating} ·{" "}
              {product.reviewCount} reviews
            </span>
          </div>

          <div className="my-[18px] text-[1.7rem] font-black">
            ${product.price.toFixed(2)}{" "}

            {product.originalPrice && (
              <span className="text-[0.88rem] text-slate-400 line-through">
                $
                {product.originalPrice.toFixed(
                  2,
                )}
              </span>
            )}
          </div>

          <p className="leading-7 text-slate-500">
            {product.description}
          </p>

          {product.colors.length > 0 && (
            <div className="border-t border-slate-200 py-5">
              <div className="flex items-center justify-between gap-3">
                <strong>Color</strong>

                <span className="leading-7 text-slate-500">
                  {color}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.colors.map(
                  (value) => (
                    <button
                      className={`rounded-md border bg-white px-3 py-2 ${
                        color === value
                          ? "border-indigo-900"
                          : "border-slate-300"
                      }`}
                      type="button"
                      onClick={() =>
                        setColor(value)
                      }
                      key={value}
                    >
                      {value}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="border-t border-slate-200 py-5">
              <div className="flex items-center justify-between gap-3">
                <strong>Size</strong>

                <span className="leading-7 text-slate-500">
                  {size}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.sizes.map(
                  (value) => (
                    <button
                      className={`rounded-md border bg-white px-3 py-2 ${
                        size === value
                          ? "border-indigo-900"
                          : "border-slate-300"
                      }`}
                      type="button"
                      onClick={() =>
                        setSize(value)
                      }
                      key={value}
                    >
                      {value}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 py-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <strong>Quantity</strong>

                <div className="mt-2.5 flex w-max border border-slate-300">
                  <button
                    className="grid h-[42px] w-10 place-items-center bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    disabled={
                      quantity <= 1 ||
                      isOutOfStock
                    }
                    onClick={() =>
                      setQuantity((current) =>
                        Math.max(
                          1,
                          current - 1,
                        ),
                      )
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span className="grid h-[42px] w-10 place-items-center">
                    {quantity}
                  </span>

                  <button
                    className="grid h-[42px] w-10 place-items-center bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    onClick={() =>
                      setQuantity((current) =>
                        Math.min(
                          product.stock,
                          current + 1,
                        ),
                      )
                    }
                    disabled={
                      quantity >= product.stock ||
                      isOutOfStock
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <span
                className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                  isOutOfStock
                    ? "bg-red-50 text-red-700"
                    : product.stock < 8
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {isOutOfStock
                  ? "Out of stock"
                  : `${product.stock} in stock`}
              </span>
            </div>
          </div>

          {feedback && (
            <div
              className={`mb-3 rounded-lg p-3 text-sm ${
                feedback.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-red-50 text-red-700"
              }`}
              role="alert"
            >
              {feedback.message}
            </div>
          )}

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Button
              size="lg"
              disabled={
                isOutOfStock ||
                isAuthLoading
              }
              loading={
                pendingAction === "cart"
              }
              onClick={() =>
                void addProductToCart("cart")
              }
            >
              Add to cart
            </Button>

            <Button
              size="lg"
              variant="secondary"
              disabled={
                isOutOfStock ||
                isAuthLoading
              }
              loading={
                pendingAction === "checkout"
              }
              onClick={() =>
                void addProductToCart(
                  "checkout",
                )
              }
            >
              Buy now
            </Button>
          </div>

          <Button
            variant="ghost"
            className="mt-2 w-full"
          >
            ♡ Add to wishlist
          </Button>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="bg-slate-50 p-[15px]">
              <strong>Free shipping</strong>

              <div className="leading-7 text-slate-500">
                On orders above $100
              </div>
            </div>

            <div className="bg-slate-50 p-[15px]">
              <strong>Easy returns</strong>

              <div className="leading-7 text-slate-500">
                Within 30 days
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 py-5">
            <h3>Product details</h3>

            <p className="leading-7 text-slate-500">
              Premium materials · Designed for
              everyday wear · SKU {product.sku} ·
              Thoughtfully finished.
            </p>
          </div>

          <div className="border-t border-slate-200 py-5">
            <h3>
              Reviews ({product.reviewCount})
            </h3>

            <p className="leading-7 text-slate-500">
              Customer review content will be
              available when the review service is
              connected.
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