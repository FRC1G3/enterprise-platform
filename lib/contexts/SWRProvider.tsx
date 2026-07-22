"use client";

import {
  type ReactNode,
} from "react";

import {
  SWRConfig,
} from "swr";

import type {
  SWRConfiguration,
} from "swr";

import {
  ApiRequestError,
} from "@/lib/swr/fetcher";

const swrConfiguration:
  SWRConfiguration = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,

  dedupingInterval: 2_000,

  errorRetryCount: 2,
  errorRetryInterval: 1_500,

  shouldRetryOnError: (
    error: unknown,
  ) => {
    if (
      error instanceof
      ApiRequestError
    ) {
      return error.retryable;
    }

    return true;
  },
};

export function SWRProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SWRConfig
      value={swrConfiguration}
    >
      {children}
    </SWRConfig>
  );
}