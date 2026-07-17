import type { ButtonHTMLAttributes } from "react";
import { Spinner } from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ variant="primary", size="md", loading=false, className="", children, disabled, type="button", ...props }:ButtonProps) {
  const sizeClass=size==="md"?"":`btn-${size}`;
  return <button type={type} disabled={disabled||loading} className={`btn btn-${variant} ${sizeClass} ${className}`} {...props}>{loading&&<Spinner size="sm"/>}<span>{children}</span></button>;
}
