import Image from "next/image";
import { lowStockProducts } from "@/lib/mock-data";

export function LowStockList() {
  return (
    <div>
      {lowStockProducts.map((product) => (
        <div
          className="flex items-center justify-between gap-3 border-b border-slate-200 py-2.5"
          key={product.id}
        >
          <div className="flex items-center gap-3">
            <Image
              className="rounded-[5px] object-cover"
              src={product.image}
              alt={product.name}
              width={38}
              height={45}
            />
            <div>
              <strong className="text-[13px]">{product.name}</strong>
              <div className="text-[11px] leading-7 text-slate-500">
                {product.sku}
              </div>
            </div>
          </div>
          <span className="inline-flex rounded-md bg-amber-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-amber-700">
            {product.stock} left
          </span>
        </div>
      ))}
    </div>
  );
}
