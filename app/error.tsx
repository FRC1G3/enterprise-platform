"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-[#f5f6f8] px-4 py-[50px]">
      <div className="w-full max-w-[480px] rounded-[14px] border border-slate-200 bg-white p-8 text-center shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Something went wrong</span>
        <h1>We hit an unexpected snag.</h1>
        <p className="leading-7 text-slate-500">
          {error.message || "Please try again in a moment."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Link className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50" href="/">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

