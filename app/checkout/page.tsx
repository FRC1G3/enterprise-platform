"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { CheckoutForm } from "@/components/orders/CheckoutForm";
import { EmptyState } from "@/components/ui/EmptyState";

import { useCart } from "@/hooks/useCart";

import { useAuthContext } from "@/lib/contexts/AuthContext";

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

export default function CheckoutPage() {
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuthContext();

  const {
    items,
    totals,
    error,
    isLoading: isCartLoading,
  } = useCart(isAuthenticated);

  useEffect(() => {
    if (
      !isAuthLoading &&
      !isAuthenticated
    ) {
      router.replace("/login");
    }
  }, [
    isAuthLoading,
    isAuthenticated,
    router,
  ]);

  if (
    isAuthLoading ||
    !isAuthenticated ||
    !user
  ) {
    return (
      <div className="min-h-[60vh] py-20 text-center">
        <p className="text-slate-500">
          Loading your account...
        </p>
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="min-h-[60vh] py-20 text-center">
        <p className="text-slate-500">
          Loading checkout...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] py-20">
        <div className="mx-auto max-w-[760px] rounded-lg border border-red-200 bg-red-50 p-5 text-red-700">
          Checkout could not be loaded.{" "}
          {error.message}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] py-12 pb-20">
        <div className="mx-auto w-full max-w-[1180px] px-4">
          <EmptyState
            title="Your cart is empty"
            message="Add products to your cart before proceeding to checkout."
            href="/products"
            action="Browse products"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] bg-[#f6f7f9] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
              Secure checkout
            </span>

            <h1>Complete your order</h1>
          </div>

          <Link
            href="/cart"
            className="font-bold text-indigo-800"
          >
            ← Return to cart
          </Link>
        </div>

        <div className="grid gap-[38px] lg:grid-cols-[1fr_370px]">
          <CheckoutForm user={user} />

          <aside className="h-max rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] lg:sticky lg:top-24">
            <h2>Order summary</h2>

            {items.map((item) => (
              <div
                className="flex items-center justify-between gap-3 border-b border-slate-200 py-3"
                key={item.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Image
                    className="h-[68px] w-[54px] rounded-md object-cover"
                    src={item.product.image}
                    alt={item.product.name}
                    width={54}
                    height={68}
                  />

                  <div className="min-w-0">
                    <strong className="block truncate">
                      {item.product.name}
                    </strong>

                    <div className="leading-6 text-slate-500">
                      Qty {item.quantity}

                      {item.selectedColor
                        ? ` · ${item.selectedColor}`
                        : ""}

                      {item.selectedSize
                        ? ` · ${item.selectedSize}`
                        : ""}
                    </div>
                  </div>
                </div>

                <span className="whitespace-nowrap">
                  {currencyFormatter.format(
                    item.lineTotal,
                  )}
                </span>
              </div>
            ))}

            <div className="flex justify-between py-2">
              <span>Items</span>

              <span>
                {totals.itemCount}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Subtotal</span>

              <span>
                {currencyFormatter.format(
                  totals.subtotal,
                )}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Shipping</span>

              <span>
                {totals.shipping === 0
                  ? "Free"
                  : currencyFormatter.format(
                      totals.shipping,
                    )}
              </span>
            </div>

            <div className="flex justify-between py-2">
              <span>Discount</span>

              <span>
                −
                {currencyFormatter.format(
                  totals.discount,
                )}
              </span>
            </div>

            <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-[18px] text-[1.18rem] font-black">
              <span>Total</span>

              <span>
                {currencyFormatter.format(
                  totals.total,
                )}
              </span>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}