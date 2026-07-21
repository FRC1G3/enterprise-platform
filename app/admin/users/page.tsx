"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import { useAdminUsers } from "@/hooks/useAdminUsers";
import { useDebounce } from "@/hooks/useDebounce";

import {
  AuthRequestError,
  authRequest,
} from "@/lib/auth/client";

import { useAuthContext } from "@/lib/contexts/AuthContext";

import type {
  AdminUser,
  AdminUserStatus,
} from "@/types/admin-user";

import type {
  UserRole,
} from "@/types/auth";

const currencyFormatter =
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

const dateFormatter =
  new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) =>
      part[0]?.toUpperCase(),
    )
    .join("");
}

export default function AdminUsersPage() {
  const { user: currentUser } =
    useAuthContext();

  const [search, setSearch] =
    useState("");

  const [role, setRole] =
    useState<UserRole | "">("");

  const [status, setStatus] =
    useState<AdminUserStatus | "">("");

  const [page, setPage] =
    useState(1);

  const [target, setTarget] =
    useState<AdminUser | null>(null);

  const [targetRole, setTargetRole] =
    useState<UserRole>("USER");

  const [
    targetIsActive,
    setTargetIsActive,
  ] = useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [updateError, setUpdateError] =
    useState("");

  const debouncedSearch =
    useDebounce(search, 350);

  const {
    users,
    pagination,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useAdminUsers({
    page,
    limit: 10,

    search:
      debouncedSearch || undefined,

    role:
      role || undefined,

    status:
      status || undefined,
  });

  const totalPages =
    pagination?.totalPages ?? 1;

  function openUserModal(
    selectedUser: AdminUser,
  ) {
    setTarget(selectedUser);

    setTargetRole(
      selectedUser.role,
    );

    setTargetIsActive(
      selectedUser.isActive,
    );

    setUpdateError("");
  }

  function closeUserModal() {
    if (isSaving) {
      return;
    }

    setTarget(null);
    setUpdateError("");
  }

  async function saveUser() {
    if (!target) {
      return;
    }

    setIsSaving(true);
    setUpdateError("");

    try {
      await authRequest<AdminUser>(
        `/api/admin/users/${target.id}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            role: targetRole,

            isActive:
              targetIsActive,
          }),
        },
      );

      setTarget(null);

      await mutate();
    } catch (requestError) {
      if (
        requestError instanceof
        AuthRequestError
      ) {
        setUpdateError(
          requestError.message,
        );
      } else {
        console.error(
          "Admin user update error:",
          requestError,
        );

        setUpdateError(
          "User could not be updated.",
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            Customers
          </span>

          <h1>Users</h1>

          <p className="leading-7 text-slate-500">
            {pagination?.total ?? 0}{" "}
            {(pagination?.total ?? 0) ===
            1
              ? "user"
              : "users"}{" "}
            found
          </p>
        </div>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-2.5 [&_input]:min-w-[190px] [&_select]:min-w-[170px]">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name or email"
          aria-label="Search users"
        />

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={role}
          onChange={(event) => {
            setRole(
              event.target.value as
                | UserRole
                | "",
            );

            setPage(1);
          }}
          aria-label="Filter user role"
        >
          <option value="">
            All roles
          </option>

          <option value="USER">
            USER
          </option>

          <option value="ADMIN">
            ADMIN
          </option>
        </select>

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={status}
          onChange={(event) => {
            setStatus(
              event.target.value as
                | AdminUserStatus
                | "",
            );

            setPage(1);
          }}
          aria-label="Filter user status"
        >
          <option value="">
            All statuses
          </option>

          <option value="ACTIVE">
            Active
          </option>

          <option value="INACTIVE">
            Inactive
          </option>
        </select>

        {isValidating &&
          !isLoading && (
            <span className="self-center text-sm text-slate-500">
              Refreshing...
            </span>
          )}
      </div>

      {error && (
        <div
          className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          role="alert"
        >
          Users could not be loaded.{" "}
          {error.message}
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[980px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Orders</th>
              <th>Order value</th>
              <th>Status</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-slate-500"
                >
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="text-center text-slate-500"
                >
                  No users match the selected filters.
                </td>
              </tr>
            ) : (
              users.map(
                (platformUser) => (
                  <tr
                    key={platformUser.id}
                  >
                    <td>
                      <div className="flex items-center gap-[11px]">
                        <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-black text-indigo-800">
                          {getInitials(
                            platformUser.name,
                          )}
                        </div>

                        <div>
                          <strong>
                            {
                              platformUser.name
                            }

                            {currentUser?.id ===
                              platformUser.id && (
                              <span className="ml-2 text-xs text-indigo-700">
                                You
                              </span>
                            )}
                          </strong>

                          <div className="leading-7 text-slate-500">
                            {
                              platformUser.email
                            }
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="inline-flex rounded-md bg-indigo-50 px-[9px] py-[5px] text-[0.72rem] font-extrabold text-indigo-800">
                        {
                          platformUser.role
                        }
                      </span>
                    </td>

                    <td>
                      {
                        platformUser.orderCount
                      }
                    </td>

                    <td>
                      {currencyFormatter.format(
                        platformUser.totalSpent,
                      )}
                    </td>

                    <td>
                      <span
                        className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                          platformUser.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {platformUser.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      {dateFormatter.format(
                        new Date(
                          platformUser.createdAt,
                        ),
                      )}
                    </td>

                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          openUserModal(
                            platformUser,
                          )
                        }
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav className="mt-7 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="min-h-[38px] rounded-md border border-slate-200 bg-white px-3 disabled:opacity-50"
            disabled={page === 1}
            onClick={() =>
              setPage(
                Math.max(1, page - 1),
              )
            }
          >
            Previous
          </button>

          {Array.from(
            {
              length: totalPages,
            },
            (_, index) => index + 1,
          ).map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`h-[38px] min-w-[38px] rounded-md border border-slate-200 ${
                pageNumber === page
                  ? "bg-indigo-900 text-white"
                  : "bg-white"
              }`}
              onClick={() =>
                setPage(pageNumber)
              }
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            className="min-h-[38px] rounded-md border border-slate-200 bg-white px-3 disabled:opacity-50"
            disabled={page === totalPages}
            onClick={() =>
              setPage(
                Math.min(
                  totalPages,
                  page + 1,
                ),
              )
            }
          >
            Next
          </button>
        </nav>
      )}

      <Modal
        open={Boolean(target)}
        title="Manage user"
        onClose={closeUserModal}
      >
        {target && (
          <>
            <div className="mb-5 rounded-lg bg-slate-50 p-4">
              <strong>
                {target.name}
              </strong>

              <p className="mt-1 text-sm text-slate-500">
                {target.email}
              </p>
            </div>

            <label className="grid gap-[7px]">
              <span className="text-sm font-bold">
                Role
              </span>

              <select
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={targetRole}
                disabled={isSaving}
                onChange={(event) =>
                  setTargetRole(
                    event.target
                      .value as UserRole,
                  )
                }
              >
                <option value="USER">
                  USER
                </option>

                <option value="ADMIN">
                  ADMIN
                </option>
              </select>
            </label>

            <label className="mt-5 flex items-center gap-3">
              <input
                type="checkbox"
                checked={targetIsActive}
                disabled={isSaving}
                onChange={(event) =>
                  setTargetIsActive(
                    event.target.checked,
                  )
                }
              />

              <span>
                Account is active
              </span>
            </label>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Inactive users cannot authenticate or use protected account features.
            </p>

            {updateError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {updateError}
              </div>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <Button
                variant="secondary"
                disabled={isSaving}
                onClick={closeUserModal}
              >
                Cancel
              </Button>

              <Button
                loading={isSaving}
                onClick={() =>
                  void saveUser()
                }
              >
                Save user
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}