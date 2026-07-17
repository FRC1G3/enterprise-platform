"use client";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const isAdmin = usePathname().startsWith("/admin");
  if (isAdmin) return <>{children}</>;
  return <><Header /><main>{children}</main><Footer /></>;
}
