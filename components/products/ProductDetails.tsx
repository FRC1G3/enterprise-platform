"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import {
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";

import { useCart } from "@/hooks/useCart";

import {
  AuthRequestError,
} from "@/lib/auth/client";

import {
  useAuthContext,
} from "@/lib/contexts/AuthContext";

import type {
  Product,
} from "@/types/product";

import {
  ProductList,
} from "./ProductList";

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

  const {
    cart,
    addItem,
  } = useCart(isAuthenticated);

  const galleryImages =
    product.images.length > 0
      ? product.images
      : [product.image];

  const [image, setImage] =
    useState(product.image);

  const [size, setSize] =
    useState(
      product.sizes[0] ?? "",
    );

  const [color, setColor] =
    useState(
      product.colors[0] ?? "",
    );

  const [quantity, setQuantity] =
    useState(1);

  const [
    pendingAction,
    setPendingAction,
  ] = useState<PendingAction>(
    null,
  );

  const [feedback, setFeedback] =
    useState<Feedback>(null);

  const quantityAlreadyInCart =
    useMemo(() => {
      return (
        cart?.items
          .filter(
            (item) =>
              item.product.id ===
              product.id,
          )
          .reduce(
            (total, item) =>
              total +
              item.quantity,
            0,
          ) ?? 0
      );
    }, [
      cart?.items,
      product.id,
    ]);

  const remainingStock =
    Math.max(
      0,

      product.stock -
        quantityAlreadyInCart,
    );

  const stockLimitReached =
    remainingStock <= 0;

  const quantityToAdd =
    stockLimitReached
      ? 1
      : Math.min(
          Math.max(quantity, 1),
          remainingStock,
        );

  const isUnavailable =
    !product.isActive ||
    product.stock <= 0;

  async function addProductToCart(
    action: Exclude<
      PendingAction,
      null
    >,
  ) {
    if (!isAuthenticated) {
      router.push(
        `/login?next=/products/${product.slug}`,
      );

      return;
    }

    if (
      isUnavailable ||
      stockLimitReached
    ) {
      setFeedback({
        type: "error",

        message:
          `You already have the maximum available quantity of this product in your cart.`,
      });

      return;
    }

    if (
      quantityToAdd >
      remainingStock
    ) {
      setFeedback({
        type: "error",

        message:
          `Only ${remainingStock} more unit${
            remainingStock === 1
              ? ""
              : "s"
          } can be added.`,
      });

      return;
    }

    setPendingAction(action);
    setFeedback(null);

    try {
      await addItem({
        productId: product.id,

        quantity: quantityToAdd,

        selectedColor:
          product.colors.length >
          0
            ? color
            : null,

        selectedSize:
          product.sizes.length >
          0
            ? size
            : null,
      });

      if (
        action === "checkout"
      ) {
        router.push("/checkout");

        return;
      }

      setFeedback({
        type: "success",

        message:
          "Product added to cart.",
      });

      setQuantity(1);
    } catch (error) {
      if (
        error instanceof
        AuthRequestError
      ) {
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
          "Product add to cart error:",
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
            {galleryImages.map(
              (
                source,
                index,
              ) => (
                <button
                  className={`h-[92px] w-[78px] border-2 p-0 ${
                    image === source
                      ? "border-indigo-900"
                      : "border-transparent"
                  }`}
                  onClick={() =>
                    setImage(source)
                  }
                  key={source}
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
              {product.reviewCount}{" "}
              reviews
            </span>
          </div>

          <div className="my-[18px] text-[1.7rem] font-black">
            ${product.price}{" "}

            {product.originalPrice && (
              <span className="text-[0.88rem] text-slate-400 line-through">
                $
                {
                  product.originalPrice
                }
              </span>
            )}
          </div>

          <p className="leading-7 text-slate-500">
            {product.description}
          </p>

          {product.colors.length >
            0 && (
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
                      onClick={() => {
  setColor(value);
  setQuantity(1);
  setFeedback(null);
}}
                      key={value}
                    >
                      {value}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {product.sizes.length >
            0 && (
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
                      onClick={() => {
  setSize(value);
  setQuantity(1);
  setFeedback(null);
}}
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
                <strong>
                  Quantity
                </strong>

                <div className="mt-2.5 flex w-max border border-slate-300">
                  <button
                    className="grid h-[42px] w-10 place-items-center bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (current) =>
                          Math.max(
                            1,
                            Math.min(
                              current,
                              remainingStock,
                            ) - 1,
                          ),
                      )
                    }
                    disabled={
                      quantityToAdd <= 1 ||
                      stockLimitReached
                    }
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span className="grid h-[42px] w-10 place-items-center">
                    {quantityToAdd}
                  </span>

                  <button
                    className="grid h-[42px] w-10 place-items-center bg-white disabled:cursor-not-allowed disabled:opacity-40"
                    type="button"
                    onClick={() =>
                      setQuantity(
                        (current) =>
                          Math.min(
                            remainingStock,
                            Math.min(
                              current,
                              remainingStock,
                            ) + 1,
                          ),
                      )
                    }
                    disabled={
                      stockLimitReached ||
                      quantityToAdd >=
                        remainingStock
                    }
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                    stockLimitReached ||
                    isUnavailable
                      ? "bg-red-50 text-red-700"
                      : remainingStock < 8
                        ? "bg-amber-50 text-amber-700"
                        : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {isUnavailable
                    ? "Out of stock"
                    : stockLimitReached
                      ? "Stock limit reached"
                      : `${remainingStock} available to add`}
                </span>

                {quantityAlreadyInCart >
                  0 && (
                  <p className="mt-2 text-xs text-slate-500">
                    {
                      quantityAlreadyInCart
                    }{" "}
                    already in your cart
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Button
              size="lg"
              loading={
                pendingAction ===
                "cart"
              }
              disabled={
                isAuthLoading ||
                isUnavailable ||
                stockLimitReached ||
                pendingAction !== null
              }
              onClick={() =>
                void addProductToCart(
                  "cart",
                )
              }
            >
              {stockLimitReached
                ? "Stock limit reached"
                : "Add to cart"}
            </Button>

            <Button
              size="lg"
              variant="secondary"
              loading={
                pendingAction ===
                "checkout"
              }
              disabled={
                isAuthLoading ||
                isUnavailable ||
                stockLimitReached ||
                pendingAction !== null
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

          {feedback && (
            <div
              className={`mt-3 rounded-lg border p-3 text-sm ${
                feedback.type ===
                "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
              role="alert"
            >
              {feedback.message}
            </div>
          )}



          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="bg-slate-50 p-[15px]">
              <strong>
                Free shipping
              </strong>

              <div className="leading-7 text-slate-500">
                On orders above $100
              </div>
            </div>

            <div className="bg-slate-50 p-[15px]">
              <strong>
                Easy returns
              </strong>

              <div className="leading-7 text-slate-500">
                Within 30 days
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 py-5">
            <h3>Product details</h3>

            <p className="leading-7 text-slate-500">
              Premium materials ·
              Designed for everyday wear
              · SKU {product.sku} ·
              Thoughtfully finished.
            </p>
          </div>

          <div className="border-t border-slate-200 py-5">
            <h3>
              Reviews (
              {product.reviewCount})
            </h3>

            <p className="leading-7 text-slate-500">
              Customer review content
              will be available when the
              review service is
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

        <ProductList
          products={related}
        />
      </section>
    </>
  );
}
