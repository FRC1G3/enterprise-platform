"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import { useDebounce } from "@/hooks/useDebounce";
import { useInventory } from "@/hooks/useInventory";

import {
  AuthRequestError,
  authRequest,
} from "@/lib/auth/client";

import type {
  InventoryItem,
  InventoryStatus,
} from "@/types/inventory";

const inventoryStatuses: Array<{
  label: string;
  value: InventoryStatus;
}> = [
  {
    label: "In stock",
    value: "IN_STOCK",
  },
  {
    label: "Low stock",
    value: "LOW_STOCK",
  },
  {
    label: "Out of stock",
    value: "OUT_OF_STOCK",
  },
];

function getStatusClasses(
  status: InventoryStatus,
): string {
  if (status === "OUT_OF_STOCK") {
    return "bg-red-50 text-red-700";
  }

  if (status === "LOW_STOCK") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-emerald-50 text-emerald-700";
}

function getStatusLabel(
  status: InventoryStatus,
): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^./, (letter) =>
      letter.toUpperCase(),
    );
}

export default function AdminInventoryPage() {
  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<InventoryStatus | "">("");

  const [page, setPage] =
    useState(1);

  const [target, setTarget] =
    useState<InventoryItem | null>(null);

  const [quantity, setQuantity] =
    useState("");

  const [
    reservedQuantity,
    setReservedQuantity,
  ] = useState("");

  const [isSaving, setIsSaving] =
    useState(false);

  const [updateError, setUpdateError] =
    useState("");

  const debouncedSearch =
    useDebounce(search, 350);

  const {
    inventory,
    pagination,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useInventory({
    page,
    limit: 10,

    search:
      debouncedSearch || undefined,

    status:
      status || undefined,
  });

  const totalPages =
    pagination?.totalPages ?? 1;

  function openInventoryModal(
    inventoryItem: InventoryItem,
  ) {
    setTarget(inventoryItem);

    setQuantity(
      String(inventoryItem.quantity),
    );

    setReservedQuantity(
      String(
        inventoryItem.reservedQuantity,
      ),
    );

    setUpdateError("");
  }

  function closeInventoryModal() {
    if (isSaving) {
      return;
    }

    setTarget(null);
    setUpdateError("");
  }

  async function saveInventory() {
    if (!target) {
      return;
    }

    const parsedQuantity =
      Number(quantity);

    const parsedReservedQuantity =
      Number(reservedQuantity);

    if (
      !Number.isInteger(parsedQuantity) ||
      parsedQuantity < 0
    ) {
      setUpdateError(
        "Stock quantity must be a non-negative integer.",
      );

      return;
    }

    if (
      !Number.isInteger(
        parsedReservedQuantity,
      ) ||
      parsedReservedQuantity < 0
    ) {
      setUpdateError(
        "Reserved quantity must be a non-negative integer.",
      );

      return;
    }

    if (
      parsedReservedQuantity >
      parsedQuantity
    ) {
      setUpdateError(
        "Reserved quantity cannot exceed total quantity.",
      );

      return;
    }

    setIsSaving(true);
    setUpdateError("");

    try {
      await authRequest<InventoryItem>(
        `/api/inventory/${target.id}`,
        {
          method: "PATCH",

          body: JSON.stringify({
            quantity: parsedQuantity,

            reservedQuantity:
              parsedReservedQuantity,
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
          "Inventory update error:",
          requestError,
        );

        setUpdateError(
          "Inventory could not be updated.",
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
            Stock control
          </span>

          <h1>Inventory</h1>

          <p className="leading-7 text-slate-500">
            {pagination?.total ?? 0}{" "}
            {(pagination?.total ?? 0) ===
            1
              ? "product"
              : "products"}{" "}
            found
          </p>
        </div>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-2.5 [&_input]:min-w-[190px] [&_select]:min-w-[180px]">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search name or SKU"
          aria-label="Search inventory"
        />

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={status}
          onChange={(event) => {
            setStatus(
              event.target.value as
                | InventoryStatus
                | "",
            );

            setPage(1);
          }}
          aria-label="Filter inventory status"
        >
          <option value="">
            All stock statuses
          </option>

          {inventoryStatuses.map(
            (inventoryStatus) => (
              <option
                key={
                  inventoryStatus.value
                }
                value={
                  inventoryStatus.value
                }
              >
                {inventoryStatus.label}
              </option>
            ),
          )}
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
          Inventory could not be loaded.{" "}
          {error.message}
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Total</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Status</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-slate-500"
                >
                  Loading inventory...
                </td>
              </tr>
            ) : inventory.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center text-slate-500"
                >
                  No inventory records match the selected filters.
                </td>
              </tr>
            ) : (
              inventory.map(
                (inventoryItem) => (
                  <tr
                    key={inventoryItem.id}
                    className={
                      inventoryItem.status !==
                      "IN_STOCK"
                        ? "bg-amber-50/50"
                        : ""
                    }
                  >
                    <td>
                      <div className="flex items-center gap-[11px]">
                        <Image
                          className="h-[52px] w-[44px] rounded-md object-cover"
                          src={
                            inventoryItem
                              .product.image
                          }
                          alt={
                            inventoryItem
                              .product.name
                          }
                          width={44}
                          height={52}
                        />

                        <strong>
                          {
                            inventoryItem
                              .product.name
                          }
                        </strong>
                      </div>
                    </td>

                    <td>
                      {
                        inventoryItem
                          .product.sku
                      }
                    </td>

                    <td>
                      {
                        inventoryItem.quantity
                      }
                    </td>

                    <td>
                      {
                        inventoryItem.reservedQuantity
                      }
                    </td>

                    <td>
                      <strong>
                        {
                          inventoryItem.availableQuantity
                        }
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${getStatusClasses(
                          inventoryItem.status,
                        )}`}
                      >
                        {getStatusLabel(
                          inventoryItem.status,
                        )}
                      </span>
                    </td>

                    <td>
                      {new Date(
                        inventoryItem.updatedAt,
                      ).toLocaleDateString(
                        "en-US",
                      )}
                    </td>

                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          openInventoryModal(
                            inventoryItem,
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
        title="Update inventory"
        onClose={closeInventoryModal}
      >
        {target && (
          <>
            <p className="mb-4 leading-7 text-slate-500">
              {target.product.name}
              <br />
              SKU: {target.product.sku}
            </p>

            <label className="grid gap-[7px]">
              <span className="text-sm font-bold">
                Total quantity
              </span>

              <input
                type="number"
                min="0"
                step="1"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={quantity}
                disabled={isSaving}
                onChange={(event) =>
                  setQuantity(
                    event.target.value,
                  )
                }
              />
            </label>

            <label className="mt-4 grid gap-[7px]">
              <span className="text-sm font-bold">
                Reserved quantity
              </span>

              <input
                type="number"
                min="0"
                step="1"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                value={reservedQuantity}
                disabled={isSaving}
                onChange={(event) =>
                  setReservedQuantity(
                    event.target.value,
                  )
                }
              />
            </label>

            <p className="mt-3 text-sm text-slate-500">
              Available quantity:{" "}
              {Math.max(
                0,
                Number(quantity || 0) -
                  Number(
                    reservedQuantity || 0,
                  ),
              )}
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
                onClick={
                  closeInventoryModal
                }
              >
                Cancel
              </Button>

              <Button
                loading={isSaving}
                onClick={() =>
                  void saveInventory()
                }
              >
                Save inventory
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}