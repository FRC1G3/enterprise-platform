"use client";

import {
  useCallback,
  useMemo,
} from "react";

import useSWRInfinite from "swr/infinite";

import { apiFetcher } from "@/lib/swr/fetcher";

import type {
  ActivityFilterOptions,
  ActivityLogItem,
  ActivityLogPage,
  ActivityLogParams,
} from "@/types/activity";

const EMPTY_FILTERS:
  ActivityFilterOptions = {
    actions: [],
    entities: [],
    users: [],
  };

interface UseActivityLogsParams
  extends Omit<
    ActivityLogParams,
    "cursor"
  > {
  enabled?: boolean;
}

export function useActivityLogs({
  enabled = true,

  limit = 20,

  search,
  action,
  entity,
  userId,
  status,
  date,
}: UseActivityLogsParams = {}) {
  const getKey = useCallback(
    (
      pageIndex: number,
      previousPage:
        | ActivityLogPage
        | null,
    ) => {
      if (!enabled) {
        return null;
      }

      if (
        previousPage &&
        !previousPage.hasMore
      ) {
        return null;
      }

      const searchParams =
        new URLSearchParams();

      searchParams.set(
        "limit",
        String(limit),
      );

      if (search) {
        searchParams.set(
          "search",
          search,
        );
      }

      if (action) {
        searchParams.set(
          "action",
          action,
        );
      }

      if (entity) {
        searchParams.set(
          "entity",
          entity,
        );
      }

      if (userId) {
        searchParams.set(
          "userId",
          userId,
        );
      }

      if (status) {
        searchParams.set(
          "status",
          status,
        );
      }

      if (date) {
        searchParams.set(
          "date",
          date,
        );
      }

      if (
        pageIndex > 0 &&
        previousPage?.nextCursor
      ) {
        searchParams.set(
          "cursor",
          previousPage.nextCursor,
        );
      }

      return `/api/admin/activity?${searchParams.toString()}`;
    },
    [
      enabled,
      limit,
      search,
      action,
      entity,
      userId,
      status,
      date,
    ],
  );

  const {
    data,
    error,
    size,
    setSize,
    isLoading,
    isValidating,
    mutate,
  } = useSWRInfinite<
    ActivityLogPage,
    Error
  >(getKey, apiFetcher, {
    revalidateFirstPage: true,
    revalidateOnFocus: false,
    persistSize: false,
  });

  const items =
    useMemo<ActivityLogItem[]>(
      () => {
        const activityMap =
          new Map<
            string,
            ActivityLogItem
          >();

        for (const page of data ?? []) {
          for (const item of page.items) {
            activityMap.set(
              item.id,
              item,
            );
          }
        }

        return Array.from(
          activityMap.values(),
        );
      },
      [data],
    );

  const lastPage =
    data?.at(-1) ?? null;

  const isLoadingMore =
    isLoading ||
    Boolean(
      size > 0 &&
        data &&
        typeof data[size - 1] ===
          "undefined",
    );

  const hasMore =
    lastPage?.hasMore ?? false;

  const loadMore =
    useCallback(async () => {
      if (
        !hasMore ||
        isLoadingMore
      ) {
        return;
      }

      await setSize(
        (currentSize) =>
          currentSize + 1,
      );
    }, [
      hasMore,
      isLoadingMore,
      setSize,
    ]);

  const refresh =
    useCallback(async () => {
      await mutate();
    }, [mutate]);

  return {
    items,

    total:
      data?.[0]?.total ?? 0,

    filters:
      data?.[0]?.filters ??
      EMPTY_FILTERS,

    error: error ?? null,

    isLoading,
    isLoadingMore,

    isRefreshing:
      isValidating &&
      !isLoadingMore,

    hasMore,

    loadMore,
    refresh,
  };
}