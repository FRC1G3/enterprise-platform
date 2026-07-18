import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="grid min-h-[70vh] place-items-center bg-[#f5f6f8] px-4 py-[50px]">
      <div className="w-full max-w-[480px] rounded-[14px] border border-slate-200 bg-white p-8 text-center shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
        <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">403 · Access denied</span>
        <h1 className="text-[42px]">You can&apos;t access this page.</h1>
        <p className="leading-7 text-slate-500">
          Your current account does not have permission to view this area.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900" href="/">
            Go home
          </Link>
          <Link className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50" href="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

