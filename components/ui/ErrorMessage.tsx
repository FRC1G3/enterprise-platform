export function ErrorMessage({ message, className="" }: { message:string; className?:string }) {
  return <div className={`error-message ${className}`} role="alert">{message}</div>;
}
