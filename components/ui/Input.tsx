import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export function Input({ label, error, id, className = "", ...props }: Props) {
  const inputId = id ?? props.name;

  return (
    <div className="grid gap-[7px]">
      {label && (
        <label className="text-[0.84rem] font-bold" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      {error && (
        <span id={`${inputId}-error`} className="text-xs text-red-700">
          {error}
        </span>
      )}
    </div>
  );
}
