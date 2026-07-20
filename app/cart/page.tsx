"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

import { CartList } from "@/components/cart/CartList";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";

import { useCart } from "@/hooks/useCart";

import { AuthRequestError } from "@/lib/auth/client";
import { useAuthContext } from "@/lib/contexts/AuthContext";

export default function CartPage() {
  const router = useRouter();

  const {
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useAuthContext();

  const {
    items,
    totals,
    error,
    isLoading,
    isValidating,
    updateItem,
    removeItem,
  } = useCart(isAuthenticated);

  const [
    updatingItemId,
    setUpdatingItemId,
  ] = useState<string | null>(null);

  const [
    removingItemId,
    setRemovingItemId,
  ] = useState<string | null>(null);

  const [
    operationError,
    setOperationError,
  ] = useState("");

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

  async function updateQuantity(
    itemId: string,
    quantity: number,
  ) {
    setUpdatingItemId(itemId);
    setOperationError("");

    try {
      await updateItem(itemId, {
        quantity,
      });
    } catch (updateError) {
      if (
        updateError instanceof
        AuthRequestError
      ) {
        setOperationError(
          updateError.message,
        );
      } else {
        console.error(
          "Update cart quantity error:",
          updateError,
        );

        setOperationError(
          "Cart quantity could not be updated.",
        );
      }
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function remove(
    itemId: string,
  ) {
    setRemovingItemId(itemId);
    setOperationError("");

    try {
      await removeItem(itemId);
    } catch (removeError) {
      if (
        removeError instanceof
        AuthRequestError
      ) {
        setOperationError(
          removeError.message,
        );
      } else {
        console.error(
          "Remove cart item error:",
          removeError,
        );

        setOperationError(
          "Cart item could not be removed.",
        );
      }
    } finally {
      setRemovingItemId(null);
    }
  }

  if (
    isAuthLoading ||
    !isAuthenticated
  ) {
    return (
      <div className="min-h-[60vh] py-20 text-center">
        <p className="text-slate-500">
          Loading your account...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
              Your selection
            </span>

            <h1>Shopping cart</h1>

            {isValidating && !isLoading && (
              <p className="text-sm text-slate-500">
                Refreshing cart...
              </p>
            )}
          </div>

          <Link href="/products">
            ← Continue shopping
          </Link>
        </div>

        {(error || operationError) && (
          <div
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {operationError ||
              error?.message ||
              "Cart could not be loaded."}
          </div>
        )}

        {isLoading ? (
          <div className="rounded-[14px] border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">
              Loading cart...
            </p>
          </div>
        ) : items.length > 0 ? (
          <div className="grid gap-[38px] lg:grid-cols-[1fr_370px]">
            <CartList
              items={items}
              updatingItemId={
                updatingItemId
              }
              removingItemId={
                removingItemId
              }
              setQuantity={(
                itemId,
                quantity,
              ) =>
                void updateQuantity(
                  itemId,
                  quantity,
                )
              }
              remove={(itemId) =>
                void remove(itemId)
              }
            />

            <CartSummary totals={totals} />
          </div>
        ) : (
          <EmptyState
            title="Your cart is empty"
            message="A considered wardrobe starts with one great piece."
            href="/products"
            action="Explore products"
          />
        )}
      </div>
    </div>
  );
}