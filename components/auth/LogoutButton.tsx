"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";

import { useAuthContext } from "@/lib/contexts/AuthContext";

interface LogoutButtonProps {
  className?: string;
  onLoggedOut?: () => void;
}

export function LogoutButton({
  className = "",
  onLoggedOut,
}: LogoutButtonProps) {
  const { logout, isLoggingOut } = useAuthContext();

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleLogout() {
    setErrorMessage("");

    try {
      await logout();
      onLoggedOut?.();
    } catch (error) {
      console.error("Logout button error:", error);

      setErrorMessage(
        "Logout could not be completed. Please try again.",
      );
    }
  }

  return (
    <div className={className}>
      <Button
        variant="secondary"
        loading={isLoggingOut}
        onClick={() => void handleLogout()}
      >
        Log out
      </Button>

      {errorMessage && (
        <ErrorMessage
          message={errorMessage}
          className="mt-2"
        />
      )}
    </div>
  );
}