import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CartSummary({ subtotal }: { subtotal: number }) {
  const shipping = subtotal >= 100 ? 0 : 12;
  const discount = subtotal * 0.1;
  const total = subtotal + shipping - discount;

  return (
    <aside className="h-max rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:sticky md:top-24">
      <h2>Order summary</h2>
      <div className="flex justify-between py-2">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between py-2">
        <span>Shipping</span>
        <span>{shipping ? "$12.00" : "Free"}</span>
      </div>
      <div className="flex justify-between py-2">
        <span>Discount</span>
        <span>−${discount.toFixed(2)}</span>
      </div>
      <div className="my-4 grid gap-[7px]">
        <label className="text-[0.84rem] font-bold" htmlFor="promo">
          Promo code
        </label>
        <div className="flex items-center gap-3">
          <input
            id="promo"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            placeholder="NOVA10"
          />
          <Button variant="secondary">Apply</Button>
        </div>
      </div>
      <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-[18px] text-[1.18rem] font-black">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <Link
        href="/checkout"
        className="mt-[18px] inline-flex min-h-[50px] w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[22px] py-[13px] font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900"
      >
        Proceed to checkout
      </Link>
    </aside>
  );
}
