interface StatCardProps {
  label: string;
  value: string;
  changePercentage: number | null;
  comparisonLabel?: string;
}

export function StatCard({
  label,
  value,
  changePercentage,
  comparisonLabel = "vs previous period",
}: StatCardProps) {
  const changeLabel =
    changePercentage === null
      ? "New in this period"
      : `${changePercentage >= 0 ? "+" : ""}${changePercentage}% ${comparisonLabel}`;

  const changeClasses =
    changePercentage === null ||
    changePercentage >= 0
      ? "text-emerald-700"
      : "text-red-700";

  return (
    <article className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
      <span className="leading-7 text-slate-500">
        {label}
      </span>

      <strong className="my-2.5 block text-[1.75rem]">
        {value}
      </strong>

      <span
        className={`text-sm ${changeClasses}`}
      >
        {changeLabel}
      </span>
    </article>
  );
}