"use client";

import useSWR from "swr";

import { apiFetcher } from "@/lib/swr/fetcher";

import type {
  InventoryListParams,
  InventoryListResult,
} from "@/types/inventory";

function buildInventoryKey(
  params: InventoryListParams,
): string {
  const searchParams =
    new URLSearchParams();

  searchParams.set(
    "page",
    String(params.page ?? 1),
  );

  searchParams.set(
    "limit",
    String(params.limit ?? 10),
  );

  if (params.search) {
    searchParams.set(
      "search",
      params.search,
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  return `/api/inventory?${searchParams.toString()}`;
}

export function useInventory(
  params: InventoryListParams,
) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<
    InventoryListResult,
    Error
  >(
    buildInventoryKey(params),
    apiFetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  return {
    inventory:
      data?.inventory ?? [],

    pagination:
      data?.pagination ?? null,

    error: error ?? null,
    isLoading,
    isValidating,
    mutate,
  };
}