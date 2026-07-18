export function ErrorMessage({
  message,
  className = "",
}: {
  message: string;
  className?: string;
}) {
  return (
    <div className={`text-xs text-red-700 ${className}`} role="alert">
      {message}
    </div>
  );
}
