"use client";

import useSWR from "swr";

import { apiFetcher } from "@/lib/swr/fetcher";

import type {
  AdminAnalyticsData,
} from "@/types/analytics";

export type AnalyticsPeriod =
  | 7
  | 30
  | 90;

export function useAnalytics(
  period: AnalyticsPeriod,
) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<
    AdminAnalyticsData,
    Error
  >(
    `/api/admin/analytics?days=${period}`,
    apiFetcher,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    },
  );

  return {
    analytics: data ?? null,
    error: error ?? null,
    isLoading,
    isValidating,
    mutate,
  };
}