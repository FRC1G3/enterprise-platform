"use client";

import useSWR from "swr";

import { apiFetcher } from "@/lib/swr/fetcher";
import {
  getProductsKey,
  type ProductListParams,
} from "@/lib/swr/keys";

import type { ProductListResult } from "@/types/product";

export function useProducts(params: ProductListParams) {
  const key = getProductsKey(params);

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<ProductListResult, Error>(
    key,
    apiFetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  return {
    data,
    products: data?.products ?? [],
    pagination: data?.pagination,
    error: error ?? null,
    isLoading,
    isValidating,
    mutate,
  };
}