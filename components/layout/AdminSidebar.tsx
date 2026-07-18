"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["Dashboard", "/admin"],
  ["Products", "/admin/products"],
  ["Orders", "/admin/orders"],
  ["Inventory", "/admin/inventory"],
  ["Users", "/admin/users"],
  ["Analytics", "/admin/analytics"],
  ["Activity Logs", "/admin/activity"],
  ["Back to Store", "/"],
];

export function AdminSidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const path = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-[60] w-[250px] bg-slate-900 px-4 py-6 text-slate-200 transition-transform md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <Link className="mb-6 block whitespace-nowrap text-[1.35rem] font-black" href="/admin">
        <span className="text-indigo-600">NOVA</span> ADMIN
      </Link>
      <nav className="grid gap-[5px]" aria-label="Admin navigation">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={
              path === href ||
              (href !== "/admin" && href !== "/" && path.startsWith(href))
                ? "rounded-md bg-indigo-900 px-3 py-[11px] text-white"
                : "rounded-md px-3 py-[11px] text-slate-400 hover:bg-slate-800 hover:text-white"
            }
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
