"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  type FormEvent,
  useState,
} from "react";

import { LogoutButton } from "@/components/auth/LogoutButton";

import { useCart } from "@/hooks/useCart";

import { useAuthContext } from "@/lib/contexts/AuthContext";

const navigation = [
  ["Home", "/"],
  ["Products", "/products"],
  ["Men", "/products?category=Men"],
  ["Women", "/products?category=Women"],
  ["Shoes", "/products?category=Shoes"],
  [
    "Accessories",
    "/products?category=Accessories",
  ],
];

function Icon({
  name,
}: {
  name:
    | "search"
    | "user"
    | "cart"
    | "menu";
}) {
  const icons = {
    search: (
      <>
        <circle
          cx="11"
          cy="11"
          r="7"
        />

        <path d="m20 20-4-4" />
      </>
    ),

    user: (
      <>
        <circle
          cx="12"
          cy="8"
          r="4"
        />

        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),

    cart: (
      <>
        <path d="M3 4h2l2 11h11l2-7H6" />

        <circle
          cx="9"
          cy="20"
          r="1"
        />

        <circle
          cx="18"
          cy="20"
          r="1"
        />
      </>
    ),

    menu: (
      <path d="M4 7h16M4 12h16M4 17h16" />
    ),
  };

  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      {icons[name]}
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    user,
    isAuthenticated,
    isLoading,
  } = useAuthContext();

  const { totals } = useCart(
    isAuthenticated && !isLoading,
  );

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [search, setSearch] =
    useState("");

  function submitSearch(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    router.push(
      `/products?search=${encodeURIComponent(
        search,
      )}`,
    );

    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] w-full max-w-[1180px] items-center gap-[30px] px-4">
        <Link
          className="whitespace-nowrap text-[1.35rem] font-black"
          href="/"
        >
          <span className="text-indigo-600">
            NOVA
          </span>{" "}
          STORE
        </Link>

        <nav
          className="m-auto hidden gap-[22px] md:flex"
          aria-label="Main navigation"
        >
          {navigation.map(
            ([label, href]) => (
              <Link
                key={label}
                href={href}
                className={
                  pathname === href ||
                  (label === "Products" &&
                    pathname.startsWith(
                      "/products",
                    ))
                    ? "border-b-2 border-indigo-600 py-[26px] text-[0.89rem] font-semibold text-indigo-900"
                    : "border-b-2 border-transparent py-[26px] text-[0.89rem] font-semibold text-slate-600 hover:border-indigo-600 hover:text-indigo-900"
                }
              >
                {label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <form
            className="relative hidden md:block"
            onSubmit={submitSearch}
          >
            <span className="absolute left-3 top-3 text-slate-500">
              <Icon name="search" />
            </span>

            <label
              className="sr-only"
              htmlFor="site-search"
            >
              Search
            </label>

            <input
              id="site-search"
              className="w-[180px] rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search products"
            />
          </form>

          {!isLoading &&
            user?.role === "ADMIN" && (
              <Link
                className="hidden text-xs font-extrabold text-indigo-700 md:inline"
                href="/admin"
              >
                Admin
              </Link>
            )}

          {!isLoading &&
            !isAuthenticated && (
              <Link
                className="hidden text-xs font-extrabold text-indigo-700 md:inline"
                href="/login"
              >
                Login
              </Link>
            )}

          <Link
            className="relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white"
            href={
              isAuthenticated
                ? "/profile"
                : "/login"
            }
            aria-label={
              isAuthenticated
                ? `Profile: ${user?.name}`
                : "Login"
            }
            title={user?.name ?? "Login"}
          >
            <Icon name="user" />
          </Link>

          <Link
            className="relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white"
            href={
              isAuthenticated
                ? "/cart"
                : "/login"
            }
            aria-label={`Cart with ${totals.itemCount} items`}
          >
            <Icon name="cart" />

            {isAuthenticated &&
              totals.itemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 grid min-h-[19px] min-w-[19px] place-items-center rounded-full bg-indigo-700 px-1 text-[10px] font-black text-white">
                  {totals.itemCount > 99
                    ? "99+"
                    : totals.itemCount}
                </span>
              )}
          </Link>

          {isAuthenticated && (
            <div className="hidden lg:block">
              <LogoutButton />
            </div>
          )}

          <button
            className="relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white md:hidden"
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() =>
              setMenuOpen(
                (current) => !current,
              )
            }
          >
            <Icon name="menu" />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          className="grid gap-3 px-4 pb-4 pt-2 md:hidden"
          aria-label="Mobile navigation"
        >
          {navigation.map(
            ([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                {label}
              </Link>
            ),
          )}

          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Login
              </Link>

              <Link
                href="/register"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Register
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/profile"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Profile — {user?.name}
              </Link>

              <Link
                href="/cart"
                onClick={() =>
                  setMenuOpen(false)
                }
              >
                Cart ({totals.itemCount})
              </Link>

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() =>
                    setMenuOpen(false)
                  }
                >
                  Admin Dashboard
                </Link>
              )}

              <LogoutButton
                onLoggedOut={() =>
                  setMenuOpen(false)
                }
              />
            </>
          )}

          <form
            onSubmit={submitSearch}
            className="flex items-center gap-3 pt-3"
          >
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search products"
              aria-label="Search products"
            />

            <button
              className="inline-flex min-h-[42px] items-center justify-center rounded-lg bg-indigo-800 px-[17px] py-2.5 font-bold text-white"
              type="submit"
            >
              Search
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}