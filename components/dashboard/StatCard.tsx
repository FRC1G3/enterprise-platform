export function StatCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <article className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
      <span className="leading-7 text-slate-500">{label}</span>
      <strong className="my-2.5 block text-[1.75rem]">{value}</strong>
      <span className="text-emerald-700">{change} vs last month</span>
    </article>
  );
}
