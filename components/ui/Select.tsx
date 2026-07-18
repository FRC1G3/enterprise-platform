import type { SelectHTMLAttributes } from "react";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options?: Array<{ label: string; value: string }>;
};

export function Select({
  label,
  options = [],
  id,
  className = "",
  children,
  ...props
}: Props) {
  const selectId = id ?? props.name;

  return (
    <div className="grid gap-[7px]">
      {label && (
        <label className="text-[0.84rem] font-bold" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${className}`}
        {...props}
      >
        {children ??
          options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
      </select>
    </div>
  );
}
