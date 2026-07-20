"use client";

import useSWR from "swr";

import { apiFetcher } from "@/lib/swr/fetcher";

import type {
  AdminOrderListParams,
  AdminOrderListResult,
} from "@/types/admin-order";

import type { Order } from "@/types/order";

function buildAdminOrdersKey(
  params: AdminOrderListParams,
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

  if (params.paymentStatus) {
    searchParams.set(
      "paymentStatus",
      params.paymentStatus,
    );
  }

  if (params.date) {
    searchParams.set(
      "date",
      params.date,
    );
  }

  return `/api/admin/orders?${searchParams.toString()}`;
}

export function useOrders(
  enabled = true,
) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<Order[], Error>(
    enabled ? "/api/orders" : null,
    apiFetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  );

  return {
    orders: data ?? [],
    error: error ?? null,
    isLoading,
    isValidating,
    mutate,
  };
}

export function useAdminOrders(
  params: AdminOrderListParams,
) {
  const key =
    buildAdminOrdersKey(params);

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<
    AdminOrderListResult,
    Error
  >(key, apiFetcher, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  return {
    orders: data?.orders ?? [],

    pagination:
      data?.pagination ?? null,

    error: error ?? null,
    isLoading,
    isValidating,
    mutate,
  };
}