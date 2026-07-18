"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <AdminSidebar open={open} onNavigate={() => setOpen(false)} />
      <div className="md:ml-[250px]">
        <header className="sticky top-0 z-40 flex h-[70px] items-center justify-between border-b border-slate-200 bg-white px-7">
          <div className="flex items-center gap-3">
            <button
              className="relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white md:hidden"
              type="button"
              aria-label="Toggle admin navigation"
              onClick={() => setOpen(!open)}
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
            <button
              className="relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white"
              type="button"
              aria-label="Notifications"
            >
              ♢
              <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-indigo-600 px-1 text-[0.65rem] text-white">
                3
              </span>
            </button>
            <div
              className="grid h-[38px] w-[38px] place-items-center rounded-full bg-indigo-100 text-[13px] font-black text-indigo-800"
            >
              AA
            </div>
            <div>
              <strong className="text-[13px]">Ava Admin</strong>
              <div className="text-[11px] leading-7 text-slate-500">
                Administrator
              </div>
            </div>
          </div>
        </header>

        <main className="p-[22px_14px] md:p-[30px]">{children}</main>
      </div>
    </div>
  );
}

