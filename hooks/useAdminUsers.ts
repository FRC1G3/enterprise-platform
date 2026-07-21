"use client";

import useSWR from "swr";

import { apiFetcher } from "@/lib/swr/fetcher";

import type {
  AdminUserListParams,
  AdminUserListResult,
} from "@/types/admin-user";

function buildAdminUsersKey(
  params: AdminUserListParams,
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

  if (params.role) {
    searchParams.set(
      "role",
      params.role,
    );
  }

  if (params.status) {
    searchParams.set(
      "status",
      params.status,
    );
  }

  return `/api/admin/users?${searchParams.toString()}`;
}

export function useAdminUsers(
  params: AdminUserListParams,
) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<
    AdminUserListResult,
    Error
  >(
    buildAdminUsersKey(params),
    apiFetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  return {
    users: data?.users ?? [],

    pagination:
      data?.pagination ?? null,

    error: error ?? null,
    isLoading,
    isValidating,
    mutate,
  };
}