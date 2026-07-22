"use client";

import {
  useCallback,
} from "react";

import useSWR from "swr";

import {
  AuthRequestError,
  authRequest,
} from "@/lib/auth/client";

import { apiFetcher } from "@/lib/swr/fetcher";

import type {
  AddCartItemInput,
  UpdateCartItemInput,
} from "@/schemas/cart.schema";

import type {
  Cart,
  CartItem,
  CartTotals,
} from "@/types/cart";

export const CART_KEY = "/api/cart";

export const EMPTY_CART_TOTALS:
  CartTotals = {
  itemCount: 0,
  subtotal: 0,
  shipping: 0,
  discount: 0,
  total: 0,
};

function roundCurrency(
  value: number,
): number {
  return Number(value.toFixed(2));
}

function calculateTotals(
  items: CartItem[],
): CartTotals {
  const itemCount = items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );

  const subtotal = roundCurrency(
    items.reduce(
      (total, item) =>
        total + item.lineTotal,
      0,
    ),
  );

  const shipping =
    subtotal === 0 ||
    subtotal >= 100
      ? 0
      : 12;

  const discount = 0;

  const total = roundCurrency(
    subtotal +
      shipping -
      discount,
  );

  return {
    itemCount,
    subtotal,
    shipping,
    discount,
    total,
  };
}

function rebuildCart(
  cart: Cart,
  items: CartItem[],
): Cart {
  return {
    ...cart,

    items,

    totals:
      calculateTotals(items),

    updatedAt:
      new Date().toISOString(),
  };
}

function createOptimisticUpdatedCart(
  cart: Cart,
  itemId: string,
  input: UpdateCartItemInput,
): Cart {
  const items = cart.items.map(
    (item) => {
      if (item.id !== itemId) {
        return item;
      }

      const nextQuantity =
        input.quantity ??
        item.quantity;

      const nextSelectedColor =
        input.selectedColor ===
        undefined
          ? item.selectedColor
          : input.selectedColor;

      const nextSelectedSize =
        input.selectedSize ===
        undefined
          ? item.selectedSize
          : input.selectedSize;

      return {
        ...item,

        quantity: nextQuantity,

        selectedColor:
          nextSelectedColor,

        selectedSize:
          nextSelectedSize,

        lineTotal: roundCurrency(
          item.product.price *
            nextQuantity,
        ),

        updatedAt:
          new Date().toISOString(),
      };
    },
  );

  return rebuildCart(cart, items);
}

function createOptimisticRemovedCart(
  cart: Cart,
  itemId: string,
): Cart {
  return rebuildCart(
    cart,

    cart.items.filter(
      (item) =>
        item.id !== itemId,
    ),
  );
}

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

export function useCart(
  enabled = true,
) {
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

      shouldRetryOnError: (
        requestError,
      ) => {
        if (
          requestError instanceof
            AuthRequestError &&
          requestError.status >= 400 &&
          requestError.status < 500
        ) {
          return false;
        }

        return true;
      },

      errorRetryCount: 2,
      errorRetryInterval: 1200,
    },
  );

  const addItem =
    useCallback(
      async (
        input: AddCartItemInput,
      ) => {
        const response =
          await authRequest<Cart>(
            "/api/cart/items",
            {
              method: "POST",

              body: JSON.stringify(
                input,
              ),
            },
          );

        const nextCart =
          getCartFromResponse(
            response.data,
          );

        await mutate(nextCart, {
          revalidate: false,
        });

        return nextCart;
      },
      [mutate],
    );

  const updateItem =
    useCallback(
      async (
        itemId: string,
        input: UpdateCartItemInput,
      ) => {
        const requestPromise =
          authRequest<Cart>(
            `/api/cart/items/${itemId}`,
            {
              method: "PATCH",

              body: JSON.stringify(
                input,
              ),
            },
          ).then((response) =>
            getCartFromResponse(
              response.data,
            ),
          );

        if (!data) {
          const nextCart =
            await requestPromise;

          await mutate(nextCart, {
            revalidate: false,
          });

          return nextCart;
        }

        const nextCart =
          await mutate(
            requestPromise,

            {
              optimisticData:
                createOptimisticUpdatedCart(
                  data,
                  itemId,
                  input,
                ),

              rollbackOnError: true,

              populateCache: true,

              revalidate: false,
            },
          );

        return getCartFromResponse(
          nextCart,
        );
      },
      [data, mutate],
    );

  const removeItem =
    useCallback(
      async (itemId: string) => {
        const requestPromise =
          authRequest<Cart>(
            `/api/cart/items/${itemId}`,
            {
              method: "DELETE",
            },
          ).then((response) =>
            getCartFromResponse(
              response.data,
            ),
          );

        if (!data) {
          const nextCart =
            await requestPromise;

          await mutate(nextCart, {
            revalidate: false,
          });

          return nextCart;
        }

        const nextCart =
          await mutate(
            requestPromise,

            {
              optimisticData:
                createOptimisticRemovedCart(
                  data,
                  itemId,
                ),

              rollbackOnError: true,

              populateCache: true,

              revalidate: false,
            },
          );

        return getCartFromResponse(
          nextCart,
        );
      },
      [data, mutate],
    );

  return {
    cart: data ?? null,

    items:
      data?.items ?? [],

    totals:
      data?.totals ??
      EMPTY_CART_TOTALS,

    error: error ?? null,

    isLoading,
    isValidating,

    addItem,
    updateItem,
    removeItem,

    refresh: mutate,
  };
}