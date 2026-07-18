import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/LogoutButton";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import {
  getSession,
} from "@/lib/auth/session";

import prisma from "@/lib/db/prisma";

import {
  getAuthenticatedUser,
  InvalidSessionError,
} from "@/lib/services/auth.service";

async function requireProfileUser() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  try {
    return await getAuthenticatedUser(session.userId);
  } catch (error) {
    if (error instanceof InvalidSessionError) {
      redirect("/login");
    }

    throw error;
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const currencyFormatter = new Intl.NumberFormat(
  "en-US",
  {
    style: "currency",
    currency: "USD",
  },
);

const dateFormatter = new Intl.DateTimeFormat(
  "en-US",
  {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
);

export default async function ProfilePage() {
  const user = await requireProfileUser();

  const recentOrders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 3,
  });

  const hasAddress = Boolean(
    user.address ||
      user.city ||
      user.country ||
      user.postalCode,
  );

  return (
    <div className="min-h-[60vh] bg-[#f6f7f9] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7">
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            My account
          </span>

          <h1>Profile</h1>
        </div>

        <div className="grid gap-[26px] md:grid-cols-[280px_1fr]">
          <aside className="rounded-[14px] border border-slate-200 bg-white p-[26px] text-center shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
            <div className="mx-auto mb-3.5 grid h-[74px] w-[74px] place-items-center rounded-full bg-indigo-100 font-black text-indigo-800">
              {getInitials(user.name)}
            </div>

            <h2>{user.name}</h2>

            <p className="leading-7 text-slate-500">
              {user.email}
            </p>

            <span className="mb-4 inline-flex rounded-md bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-800">
              {user.role}
            </span>

            <p className="text-sm text-slate-500">
              Member since{" "}
              {dateFormatter.format(
                new Date(user.createdAt),
              )}
            </p>

            <LogoutButton className="mt-4" />
          </aside>

          <div className="grid gap-[18px]">
            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Account details</h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <small className="leading-7 text-slate-500">
                    Full name
                  </small>
                  <p>{user.name}</p>
                </div>

                <div>
                  <small className="leading-7 text-slate-500">
                    Email
                  </small>
                  <p>{user.email}</p>
                </div>

                <div>
                  <small className="leading-7 text-slate-500">
                    Phone
                  </small>
                  <p>{user.phone ?? "Not added"}</p>
                </div>

                <div>
                  <small className="leading-7 text-slate-500">
                    Account status
                  </small>
                  <p>
                    {user.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Saved address</h2>

              {hasAddress ? (
                <p>
                  {user.address && (
                    <>
                      {user.address}
                      <br />
                    </>
                  )}

                  {[user.city, user.postalCode]
                    .filter(Boolean)
                    .join(", ")}

                  {(user.city || user.postalCode) && (
                    <br />
                  )}

                  {user.country}
                </p>
              ) : (
                <p className="text-slate-500">
                  No saved address has been added yet.
                </p>
              )}
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <h2>Security</h2>

              <p className="leading-7 text-slate-500">
                Your account uses a securely hashed password
                and an HttpOnly JWT session cookie.
              </p>
            </section>

            <section className="rounded-[14px] border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between gap-3">
                <h2>Recent orders</h2>

                <Link
                  href="/orders"
                  className="font-bold text-indigo-800"
                >
                  View all
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-5">
                  <p className="text-slate-500">
                    You have not placed any orders yet.
                  </p>

                  <Link
                    href="/products"
                    className="font-bold text-indigo-800"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 py-3.5"
                    key={order.id}
                  >
                    <div>
                      <strong>{order.orderNumber}</strong>

                      <div className="leading-7 text-slate-500">
                        {dateFormatter.format(order.createdAt)}
                        {" · "}
                        {order._count.items}{" "}
                        {order._count.items === 1
                          ? "item"
                          : "items"}
                      </div>
                    </div>

                    <OrderStatusBadge
                      status={order.status}
                    />

                    <strong>
                      {currencyFormatter.format(
                        Number(order.total),
                      )}
                    </strong>
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}