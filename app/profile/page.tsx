import Link from "next/link";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { orders } from "@/lib/mock-data";

export default function ProfilePage() {
  return (
    <div className="min-h-[60vh] bg-[#f6f7f9] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">My account</span>
            <h1>Profile</h1>
          </div>
        </div>

        <div className="grid gap-[26px] md:grid-cols-[280px_1fr]">
          <aside className="rounded-[14px] border border-slate-200 bg-white p-[26px] text-center shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <div className="mx-auto mb-3.5 grid h-[74px] w-[74px] place-items-center rounded-full bg-indigo-100 font-black text-indigo-800">
              EW
            </div>
            <h2>Emma Wilson</h2>
            <p className="leading-7 text-slate-500">user@novastore.com</p>
            <button className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900" type="button">
              Edit profile
            </button>
            <div className="mt-3">
              <LogoutButton />
            </div>
          </aside>

          <div className="grid gap-[18px]">
            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Account details</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <small className="leading-7 text-slate-500">Phone</small>
                  <p>+1 202 555 0142</p>
                </div>
                <div>
                  <small className="leading-7 text-slate-500">Email</small>
                  <p>user@novastore.com</p>
                </div>
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <h2>Saved address</h2>
                <button type="button" className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-[17px] py-2.5 font-bold text-slate-600 transition hover:-translate-y-px hover:bg-slate-100">
                  Edit
                </button>
              </div>
              <p>
                18 Park Avenue
                <br />
                New York, NY 10016
                <br />
                United States
              </p>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <h2>Security</h2>
                <button type="button" className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50">
                  Change password
                </button>
              </div>
              <p className="leading-7 text-slate-500">
                Your password was last changed 3 months ago.
              </p>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <h2>Recent orders</h2>
                <Link href="/orders">View all</Link>
              </div>
              {orders.slice(0, 3).map((order) => (
                <div
                  className="flex items-center justify-between gap-3 border-b border-slate-200 py-3.5"
                  key={order.id}
                >
                  <div>
                    <strong>{order.id}</strong>
                    <div className="leading-7 text-slate-500">
                      {order.date} · {order.items} items
                    </div>
                  </div>
                  <span className="inline-flex rounded-md bg-indigo-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-indigo-800">{order.status}</span>
                  <strong>${order.total}</strong>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

