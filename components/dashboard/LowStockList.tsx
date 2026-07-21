import Image from "next/image";
import Link from "next/link";

import type {
  DashboardLowStockItem,
} from "@/types/analytics";

interface LowStockListProps {
  items: DashboardLowStockItem[];
}

export function LowStockList({
  items,
}: LowStockListProps) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        No low-stock products.
      </p>
    );
  }

  return (
    <div>
      {items.map((item) => (
        <div
          className="flex items-center justify-between gap-3 border-b border-slate-200 py-2.5"
          key={item.id}
        >
          <div className="flex min-w-0 items-center gap-3">
            <Image
              className="h-[45px] w-[38px] shrink-0 rounded-[5px] object-cover"
              src={item.image}
              alt={item.name}
              width={38}
              height={45}
            />

            <div className="min-w-0">
              <Link
                href="/admin/inventory"
                className="block truncate text-[13px] font-bold"
              >
                {item.name}
              </Link>

              <div className="text-[11px] leading-7 text-slate-500">
                {item.sku}
              </div>
            </div>
          </div>

          <span
            className={`inline-flex shrink-0 rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
              item.availableQuantity === 0
                ? "bg-red-50 text-red-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {item.availableQuantity} left
          </span>
        </div>
      ))}
    </div>
  );
}