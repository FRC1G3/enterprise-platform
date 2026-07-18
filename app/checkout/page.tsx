import Image from "next/image";
import { products } from "@/lib/mock-data";
import { CheckoutForm } from "@/components/orders/CheckoutForm";
export default function CheckoutPage() {
  const items = [products[0], products[2]],
    subtotal = items.reduce((s, p) => s + p.price, 0);
  return (
    <div className="min-h-[60vh] bg-[#f6f7f9] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Secure checkout</span>
            <h1>Complete your order</h1>
          </div>
        </div>
        <div className="grid gap-[38px] lg:grid-cols-[1fr_370px]">
          <CheckoutForm />
          <aside className="h-max rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:sticky md:top-24">
            <h2>Order summary</h2>
            {items.map((p) => (
              <div
                className="flex items-center justify-between gap-3 border-b border-slate-200 py-3"
                key={p.id}
              >
                <div className="flex items-center gap-3">
                  <Image
                    className="rounded-md object-cover"
                    src={p.image}
                    alt={p.name}
                    width={54}
                    height={68}
                  />
                  <div>
                    <strong>{p.name}</strong>
                    <div className="leading-7 text-slate-500">Qty 1</div>
                  </div>
                </div>
                <span>${p.price}</span>
              </div>
            ))}
            <div className="flex justify-between py-2">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className="flex justify-between py-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="mt-2.5 flex justify-between border-t border-slate-200 pt-[18px] text-[1.18rem] font-black">
              <span>Total</span>
              <span>${subtotal}</span>
            </div>
            <p className="text-xs leading-7 text-slate-500">
              This is a UI demonstration. No real payment or backend request is
              made.
            </p>
          </aside>
        </div>
      </div>
    </div>
  );
}

