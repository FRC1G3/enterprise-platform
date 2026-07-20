"use client";

import { useCallback } from "react";
import useSWR from "swr";

import { authRequest } from "@/lib/auth/client";
import { apiFetcher } from "@/lib/swr/fetcher";

import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "@/schemas/cart.schema";

import type {
  Cart,
  CartTotals,
} from "@/types/cart";

export const CART_KEY = "/api/cart";

export const EMPTY_CART_TOTALS: CartTotals = {
  itemCount: 0,
  subtotal: 0,
  shipping: 0,
  discount: 0,
  total: 0,
};

function getCartFromResponse(
  data: Cart | undefined,
): Cart {
  if (!data) {
    throw new Error(
      "Cart request succeeded but cart data was not returned.",
    );
  }

  return data;
}

export function useCart(enabled = true) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Cart, Error>(
    enabled ? CART_KEY : null,
    apiFetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  );

  const addItem = useCallback(
    async (
      input: AddCartItemInput,
    ): Promise<Cart> => {
      const response = await authRequest<Cart>(
        "/api/cart/items",
        {
          method: "POST",
          body: JSON.stringify(input),
        },
      );

      const nextCart = getCartFromResponse(
        response.data,
      );

      await mutate(nextCart, {
        revalidate: false,
      });

      return nextCart;
    },
    [mutate],
  );

  const updateItem = useCallback(
    async (
      itemId: string,
      input: UpdateCartItemInput,
    ): Promise<Cart> => {
      const response = await authRequest<Cart>(
        `/api/cart/items/${itemId}`,
        {
          method: "PATCH",
          body: JSON.stringify(input),
        },
      );

      const nextCart = getCartFromResponse(
        response.data,
      );

      await mutate(nextCart, {
        revalidate: false,
      });

      return nextCart;
    },
    [mutate],
  );

  const removeItem = useCallback(
    async (itemId: string): Promise<Cart> => {
      const response = await authRequest<Cart>(
        `/api/cart/items/${itemId}`,
        {
          method: "DELETE",
        },
      );

      const nextCart = getCartFromResponse(
        response.data,
      );

      await mutate(nextCart, {
        revalidate: false,
      });

      return nextCart;
    },
    [mutate],
  );

  return {
    cart: data ?? null,
    items: data?.items ?? [],
    totals:
      data?.totals ?? EMPTY_CART_TOTALS,

    error: error ?? null,
    isLoading,
    isValidating,

    addItem,
    updateItem,
    removeItem,
    refresh: mutate,
  };
}