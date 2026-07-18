import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses = {
  primary: "border-transparent bg-indigo-800 text-white hover:bg-indigo-900",
  secondary:
    "border-slate-300 bg-white text-slate-900 hover:bg-slate-50",
  ghost: "border-transparent bg-transparent text-slate-600 hover:bg-slate-100",
  danger: "border-transparent bg-red-600 text-white hover:bg-red-700",
};

const sizeClasses = {
  sm: "min-h-[34px] px-3 py-1.5 text-[0.82rem]",
  md: "min-h-[42px] px-[17px] py-2.5",
  lg: "min-h-[50px] px-[22px] py-[13px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border font-bold transition hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" />}
      <span>{children}</span>
    </button>
  );
}
