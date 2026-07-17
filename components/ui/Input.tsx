import type { InputHTMLAttributes } from "react";
type Props = InputHTMLAttributes<HTMLInputElement> & { label?:string; error?:string };
export function Input({ label, error, id, className="", ...props }: Props) {
  const inputId = id ?? props.name;
  return <div className="field">{label && <label htmlFor={inputId}>{label}</label>}<input id={inputId} className={`input ${className}`} aria-invalid={Boolean(error)} aria-describedby={error ? `${inputId}-error` : undefined} {...props}/>{error && <span id={`${inputId}-error`} className="error-message">{error}</span>}</div>;
}
