"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

import type { AuthUser } from "@/types/auth";

interface AdminShellProps {
  children: ReactNode;
  user: Pick<AuthUser, "name" | "email">;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminShell({
  children,
  user,
}: AdminShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <AdminSidebar
        open={open}
        onNavigate={() => setOpen(false)}
      />

      <div className="md:ml-[250px]">
        <header className="sticky top-0 z-40 flex min-h-[70px] items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 md:px-7">
          <div className="flex items-center gap-3">
            <button
              className="relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white md:hidden"
              type="button"
              aria-label="Toggle admin navigation"
              aria-expanded={open}
              onClick={() => setOpen((current) => !current)}
            >
              ☰
            </button>

            <input
              className="hidden w-[260px] rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 md:block"
              aria-label="Search admin"
              placeholder="Search admin..."
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="grid h-[38px] w-[38px] place-items-center rounded-full bg-indigo-100 text-[13px] font-black text-indigo-800">
              {getInitials(user.name)}
            </div>

            <div className="hidden sm:block">
              <strong className="block text-[13px]">
                {user.name}
              </strong>

              <div className="text-[11px] text-slate-500">
                {user.email}
              </div>
            </div>

            <LogoutButton />
          </div>
        </header>

        <main className="p-[22px_14px] md:p-[30px]">
          {children}
        </main>
      </div>
    </div>
  );
}