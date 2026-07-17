import type { SelectHTMLAttributes } from "react";
type Props = SelectHTMLAttributes<HTMLSelectElement> & { label?:string; options?:Array<{label:string;value:string}> };
export function Select({ label, options=[], id, className="", children, ...props }: Props) {
  const selectId=id ?? props.name;
  return <div className="field">{label && <label htmlFor={selectId}>{label}</label>}<select id={selectId} className={`select ${className}`} {...props}>{children ?? options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>;
}
