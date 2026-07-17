interface SpinnerProps { size?:"sm"|"md"|"lg"; className?:string; }
export function Spinner({size="md",className=""}:SpinnerProps) {
  const pixels=size==="sm"?16:size==="lg"?32:22;
  return <span className={`spinner ${className}`} style={{width:pixels,height:pixels}} role="status" aria-label="Loading"/>;
}
