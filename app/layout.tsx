import type {
  Metadata,
} from "next";

import "./globals.css";

import {
  SiteShell,
} from "@/components/layout/SiteShell";

import {
  AuthProvider,
} from "@/lib/contexts/AuthContext";

import {
  SWRProvider,
} from "@/lib/contexts/SWRProvider";

export const metadata: Metadata = {
  title: {
    default:
      "Nova Store — Modern essentials",

    template:
      "%s | Nova Store",
  },

  description:
    "A modern, minimal clothing store for considered everyday style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SWRProvider>
          <AuthProvider>
            <SiteShell>
              {children}
            </SiteShell>
          </AuthProvider>
        </SWRProvider>
      </body>
    </html>
  );
}