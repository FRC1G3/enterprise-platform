import Link from "next/link";

import type {
  CartTotals,
} from "@/types/cart";

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

interface CartSummaryProps {
  totals: CartTotals;
}

export function CartSummary({
  totals,
}: CartSummaryProps) {
  return (
    <aside className="h-max rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:sticky md:top-24">
      <h2>Order summary</h2>

      <div className="flex justify-between py-2">
        <span>Items</span>

        <span>{totals.itemCount}</span>
      </div>

      <div className="flex justify-between py-2">
        <span>Subtotal</span>

        <span>
          {currencyFormatter.format(
            totals.subtotal,
          )}
        </span>
      </div>

      <div className="flex justify-between py-2">
        <span>Shipping</span>

        <span>
          {totals.shipping === 0
            ? "Free"
            : currencyFormatter.format(
                totals.shipping,
              )}
        </span>
      </div>

      <div className="flex justify-between py-2">
        <span>Discount</span>

        <span>
          −
          {currencyFormatter.format(
            totals.discount,
          )}
        </span>
      </div>

      <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-[18px] text-[1.18rem] font-black">
        <span>Total</span>

        <span>
          {currencyFormatter.format(
            totals.total,
          )}
        </span>
      </div>

      <Link
        href="/checkout"
        className="mt-[18px] inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[22px] py-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900"
      >
        Proceed to checkout
      </Link>

      {totals.shipping > 0 && (
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Add{" "}
          {currencyFormatter.format(
            Math.max(
              0,
              100 - totals.subtotal,
            ),
          )}{" "}
          more for free shipping.
        </p>
      )}
    </aside>
  );
}