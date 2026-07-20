"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useSWRConfig } from "swr";

import { useAuth } from "@/hooks/useAuth";
import { CART_KEY } from "@/hooks/useCart";

import { authRequest } from "@/lib/auth/client";

import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;

  isAuthenticated: boolean;
  isLoading: boolean;
  isValidating: boolean;
  isLoggingOut: boolean;

  error: Error | null;

  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextValue | null>(
    null,
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();

  const { mutate: mutateGlobalCache } =
    useSWRConfig();

  const {
    user,
    isAuthenticated,
    isLoading,
    isValidating,
    error,
    mutate,
  } = useAuth();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const refresh = useCallback(
    async () => {
      await mutate();
    },
    [mutate],
  );

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      await authRequest(
        "/api/auth/logout",
        {
          method: "POST",
        },
      );

      await mutate(null, {
        revalidate: false,
      });

      await mutateGlobalCache(
        CART_KEY,
        undefined,
        {
          revalidate: false,
        },
      );

      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }, [
    mutate,
    mutateGlobalCache,
    router,
  ]);

  const value =
    useMemo<AuthContextValue>(
      () => ({
        user,
        isAuthenticated,
        isLoading,
        isValidating,
        isLoggingOut,
        error,
        refresh,
        logout,
      }),
      [
        user,
        isAuthenticated,
        isLoading,
        isValidating,
        isLoggingOut,
        error,
        refresh,
        logout,
      ],
    );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuthContext must be used inside AuthProvider.",
    );
  }

  return context;
}