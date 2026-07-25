"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main className="grid min-h-screen place-items-center bg-[#f5f6f8] px-4 py-[50px]">
          <div className="w-full max-w-[480px] rounded-[14px] border border-slate-200 bg-white p-8 text-center shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
              Service interruption
            </span>
            <h1>Nova Store is temporarily unavailable.</h1>
            <p className="leading-7 text-slate-500">
              Your information has not been displayed. Please retry the page in a moment.
            </p>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900"
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
