export function OrderStatusBadge({
  status,
}: {
  status: string;
}) {
  const className =
    status === "DELIVERED" ||
    status === "PAID"
      ? "bg-emerald-50 text-emerald-700"
      : status === "CANCELLED" ||
          status === "REFUNDED" ||
          status === "FAILED"
        ? "bg-red-50 text-red-700"
        : status === "PENDING"
          ? "bg-amber-50 text-amber-700"
          : "bg-indigo-50 text-indigo-800";

  return (
    <span
      className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${className}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}