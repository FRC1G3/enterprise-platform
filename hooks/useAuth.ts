"use client";

import useSWR from "swr";

import {
  ApiRequestError,
  apiFetcher,
} from "@/lib/swr/fetcher";

import type { AuthResult } from "@/types/auth";

export const AUTH_ME_KEY = "/api/auth/me";

async function currentUserFetcher(
  url: string,
): Promise<AuthResult | null> {
  try {
    return await apiFetcher<AuthResult>(url);
  } catch (error) {
    if (
      error instanceof ApiRequestError &&
      error.status === 401
    ) {
      return null;
    }

    throw error;
  }
}

export function useAuth() {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<AuthResult | null, Error>(
    AUTH_ME_KEY,
    currentUserFetcher,
    {
      revalidateOnFocus: true,
      shouldRetryOnError: false,
    },
  );

  return {
    data,
    user: data?.user ?? null,
    isAuthenticated: Boolean(data?.user),
    isLoading,
    isValidating,
    error: error ?? null,
    mutate,
  };
}