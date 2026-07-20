"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

import { useProducts } from "@/hooks/useProducts";

import {
  AuthRequestError,
  authRequest,
} from "@/lib/auth/client";

import {
  PRODUCT_CATEGORIES,
  type Product,
  type ProductCategory,
  type ProductListResult,
} from "@/types/product";

const PAGE_SIZE = 8;

type StockFilter = "" | "low" | "ok" | "out";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");

  const [category, setCategory] = useState<
    ProductCategory | ""
  >("");

  const [stockFilter, setStockFilter] =
    useState<StockFilter>("");

  const [page, setPage] = useState(1);

  const [target, setTarget] =
    useState<Product | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  const {
    products,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useProducts({
    page: 1,
    limit: 100,
    search: search || undefined,
    category: category || undefined,
    sort: "newest",
  });

  const filteredProducts = useMemo(() => {
    if (!stockFilter) {
      return products;
    }

    return products.filter((product) => {
      if (stockFilter === "low") {
        return (
          product.stock > 0 &&
          product.stock < 10
        );
      }

      if (stockFilter === "ok") {
        return product.stock >= 10;
      }

      return product.stock === 0;
    });
  }, [products, stockFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredProducts.length / PAGE_SIZE,
    ),
  );

  const currentPage = Math.min(
    page,
    totalPages,
  );

  const visibleProducts = useMemo(() => {
    const start =
      (currentPage - 1) * PAGE_SIZE;

    return filteredProducts.slice(
      start,
      start + PAGE_SIZE,
    );
  }, [filteredProducts, currentPage]);

  function openDeleteModal(product: Product) {
    setDeleteError("");
    setTarget(product);
  }

  function closeDeleteModal() {
    if (isDeleting) {
      return;
    }

    setDeleteError("");
    setTarget(null);
  }

  async function deleteSelectedProduct() {
    if (!target) {
      return;
    }

    const productToDelete = target;

    setIsDeleting(true);
    setDeleteError("");

    try {
      await authRequest<{ id: string }>(
        `/api/products/${productToDelete.id}`,
        {
          method: "DELETE",
        },
      );

      await mutate(
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          const nextProducts =
            currentData.products.filter(
              (product) =>
                product.id !==
                productToDelete.id,
            );

          const nextTotal = Math.max(
            0,
            currentData.pagination.total - 1,
          );

          return {
            ...currentData,

            products: nextProducts,

            pagination: {
              ...currentData.pagination,

              total: nextTotal,

              totalPages: Math.max(
                1,
                Math.ceil(
                  nextTotal /
                    currentData.pagination.limit,
                ),
              ),
            },
          } satisfies ProductListResult;
        },
        {
          revalidate: false,
        },
      );

      setTarget(null);

      await mutate();
    } catch (deleteRequestError) {
      if (
        deleteRequestError instanceof
        AuthRequestError
      ) {
        setDeleteError(
          deleteRequestError.message,
        );
      } else {
        console.error(
          "Delete product error:",
          deleteRequestError,
        );

        setDeleteError(
          "Product could not be deleted. Please try again.",
        );
      }
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">
            Catalog
          </span>

          <h1>Products</h1>

          <p className="leading-7 text-slate-500">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}{" "}
            found
          </p>
        </div>

        <Link
          className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-transparent bg-indigo-800 px-[17px] py-2.5 font-bold text-white transition hover:-translate-y-px hover:bg-indigo-900"
          href="/admin/products/create"
        >
          + Add product
        </Link>
      </div>

      <div className="mb-[18px] flex flex-wrap gap-2.5 [&_input]:min-w-[190px] [&_select]:min-w-[170px]">
        <input
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search products"
          aria-label="Search products"
        />

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={category}
          onChange={(event) => {
            setCategory(
              event.target.value as
                | ProductCategory
                | "",
            );

            setPage(1);
          }}
          aria-label="Filter category"
        >
          <option value="">
            All categories
          </option>

          {PRODUCT_CATEGORIES.map((value) => (
            <option
              key={value}
              value={value}
            >
              {value}
            </option>
          ))}
        </select>

        <select
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:w-auto"
          value={stockFilter}
          onChange={(event) => {
            setStockFilter(
              event.target.value as StockFilter,
            );

            setPage(1);
          }}
          aria-label="Filter stock"
        >
          <option value="">
            All stock
          </option>

          <option value="low">
            Low stock: 1–9
          </option>

          <option value="ok">
            In stock: 10+
          </option>

          <option value="out">
            Out of stock
          </option>
        </select>

        {isValidating && !isLoading && (
          <span className="self-center text-sm text-slate-500">
            Refreshing...
          </span>
        )}
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          Products could not be loaded.{" "}
          {error.message}
        </div>
      )}

      <div className="overflow-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[800px] border-collapse [&_td]:border-b [&_td]:border-slate-200 [&_td]:px-4 [&_td]:py-3.5 [&_td]:text-left [&_td]:text-[0.84rem] [&_th]:border-b [&_th]:border-slate-200 [&_th]:bg-slate-50 [&_th]:px-4 [&_th]:py-3.5 [&_th]:text-left [&_th]:text-[0.84rem] [&_th]:text-slate-500">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-slate-500"
                >
                  Loading products...
                </td>
              </tr>
            ) : visibleProducts.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-slate-500"
                >
                  No products match the selected
                  filters.
                </td>
              </tr>
            ) : (
              visibleProducts.map((product) => (
                <tr
                  key={product.id}
                  className={
                    product.stock > 0 &&
                    product.stock < 6
                      ? "bg-amber-50"
                      : ""
                  }
                >
                  <td>
                    <div className="flex items-center gap-[11px]">
                      <Image
                        className="h-[52px] w-[44px] rounded-md object-cover"
                        src={product.image}
                        alt={product.name}
                        width={44}
                        height={52}
                      />

                      <div>
                        <strong>
                          {product.name}
                        </strong>

                        <div className="leading-7 text-slate-500">
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    {product.category}
                  </td>

                  <td>
                    {formatPrice(
                      product.price,
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        product.stock === 0
                          ? "font-bold text-red-700"
                          : product.stock < 10
                            ? "font-bold text-amber-700"
                            : ""
                      }
                    >
                      {product.stock}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`inline-flex rounded-md px-[9px] py-[5px] text-[0.72rem] font-extrabold ${
                        !product.isActive
                          ? "bg-slate-100 text-slate-600"
                          : product.stock === 0
                            ? "bg-red-50 text-red-700"
                            : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {!product.isActive
                        ? "Inactive"
                        : product.stock === 0
                          ? "Out of stock"
                          : "Active"}
                    </span>
                  </td>

                  <td>
                    <div className="flex items-center gap-3">
                      <Link
                        className="inline-flex min-h-[34px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[0.82rem] font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
                        href={`/admin/products/${product.id}/edit`}
                      >
                        Edit
                      </Link>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          openDeleteModal(product)
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <nav
          className="mt-[30px] flex flex-wrap justify-center gap-[7px]"
          aria-label="Product pagination"
        >
          <button
            type="button"
            className="min-h-[38px] rounded-md border border-slate-200 bg-white px-3 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1),
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
              className={`h-[38px] min-w-[38px] rounded-md border border-slate-200 px-2 ${
                pageNumber === currentPage
                  ? "bg-indigo-900 text-white"
                  : "bg-white"
              }`}
              aria-current={
                pageNumber === currentPage
                  ? "page"
                  : undefined
              }
              onClick={() =>
                setPage(pageNumber)
              }
            >
              {pageNumber}
            </button>
          ))}

          <button
            type="button"
            className="min-h-[38px] rounded-md border border-slate-200 bg-white px-3 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              currentPage === totalPages
            }
            onClick={() =>
              setPage((current) =>
                Math.min(
                  totalPages,
                  current + 1,
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
        title="Delete product?"
        onClose={closeDeleteModal}
      >
        <p className="leading-7 text-slate-500">
          {target
            ? `"${target.name}" will be permanently removed from the database.`
            : "The selected product will be permanently removed."}
        </p>

        {deleteError && (
          <div
            className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            role="alert"
          >
            {deleteError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            disabled={isDeleting}
            onClick={closeDeleteModal}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            loading={isDeleting}
            onClick={() =>
              void deleteSelectedProduct()
            }
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}