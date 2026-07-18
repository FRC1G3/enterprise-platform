import Link from "next/link";

export function EmptyState({
  title,
  message,
  href,
  action,
}: {
  title: string;
  message: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-12 text-center shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
      <div className="text-[42px]">◇</div>
      <h2>{title}</h2>
      <p className="leading-7 text-slate-500">{message}</p>
      {href && action && (
        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900"
          href={href}
        >
          {action}
        </Link>
      )}
    </div>
  );
}
