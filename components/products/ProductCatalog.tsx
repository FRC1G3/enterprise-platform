"use client";

import { useMemo, useState } from "react";

import { ProductFilters, type FilterState } from "./ProductFilters";
import { ProductList } from "./ProductList";

import { Button } from "@/components/ui/Button";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Select } from "@/components/ui/Select";
import { Spinner } from "@/components/ui/Spinner";

import { useDebounce } from "@/hooks/useDebounce";
import { useProducts } from "@/hooks/useProducts";

import type { ProductSort } from "@/lib/swr/keys";
import {
  PRODUCT_CATEGORIES,
  type ProductCategory,
} from "@/types/product";

interface ProductCatalogProps {
  initialSearch?: string;
  initialCategory?: string;
  initialSort?: string;
}

const PRODUCTS_PER_PAGE = 8;

const productSorts: ProductSort[] = [
  "featured",
  "price-low",
  "price-high",
  "rating",
  "newest",
];

const sortOptions: Array<{
  label: string;
  value: ProductSort;
}> = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to high", value: "price-low" },
  { label: "Price: High to low", value: "price-high" },
  { label: "Top rated", value: "rating" },
  { label: "Newest", value: "newest" },
];

function isProductSort(value: string): value is ProductSort {
  return productSorts.includes(value as ProductSort);
}

function getProductCategory(
  value: string,
): ProductCategory | undefined {
  return PRODUCT_CATEGORIES.find(
    (category) => category === value,
  );
}

function parseOptionalNumber(
  value: string,
): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : undefined;
}

export function ProductCatalog({
  initialSearch = "",
  initialCategory = "",
  initialSort = "featured",
}: ProductCatalogProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: initialSearch,
    category: getProductCategory(initialCategory) ?? "",
    min: "",
    max: "",
    inStock: false,
  });

  const [sort, setSort] = useState<ProductSort>(
    isProductSort(initialSort)
      ? initialSort
      : "featured",
  );

  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const debouncedFilters = useDebounce(filters, 350);

  const {
    products,
    pagination,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useProducts({
    page,
    limit: PRODUCTS_PER_PAGE,
    search: debouncedFilters.search || undefined,
    category: getProductCategory(
      debouncedFilters.category,
    ),
    min: parseOptionalNumber(debouncedFilters.min),
    max: parseOptionalNumber(debouncedFilters.max),
    inStock: debouncedFilters.inStock,
    sort,
  });

  const pageNumbers = useMemo(() => {
    const totalPages = pagination?.totalPages ?? 0;

    return Array.from(
      { length: totalPages },
      (_, index) => index + 1,
    );
  }, [pagination?.totalPages]);

  function handleFiltersChange(nextFilters: FilterState) {
    setFilters(nextFilters);
    setPage(1);
  }

  function handleSortChange(nextSort: ProductSort) {
    setSort(nextSort);
    setPage(1);
  }

  function resetFilters() {
    setFilters({
      search: "",
      category: "",
      min: "",
      max: "",
      inStock: false,
    });

    setSort("featured");
    setPage(1);
  }
const totalProducts = pagination?.total ?? 0;
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3.5">
        <div>
          <strong>
            {isLoading && !pagination
              ? "Loading products..."
              : `${totalProducts} ${
  totalProducts === 1 ? "product" : "products"
}`}
          </strong>

          <p className="m-[3px] leading-7 text-slate-500">
            Curated pieces for an intentional wardrobe.
          </p>

          {isValidating && !isLoading && (
            <span className="text-xs text-indigo-700">
              Updating results...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50 md:hidden"
            type="button"
            onClick={() => setFiltersOpen((current) => !current)}
          >
            Filters
          </button>

          <Select
            aria-label="Sort products"
            value={sort}
            onChange={(event) => {
              handleSortChange(
                event.target.value as ProductSort,
              );
            }}
            options={sortOptions}
          />

          <button
            className={`relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white ${
              view === "grid"
                ? "text-indigo-800 ring-2 ring-indigo-200"
                : ""
            }`}
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            ▦
          </button>

          <button
            className={`relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white ${
              view === "list"
                ? "text-indigo-800 ring-2 ring-indigo-200"
                : ""
            }`}
            type="button"
            onClick={() => setView("list")}
            aria-label="List view"
          >
            ☷
          </button>
        </div>
      </div>

      <div className="grid gap-[34px] md:grid-cols-[260px_1fr]">
        <ProductFilters
          value={filters}
          onChange={handleFiltersChange}
          open={filtersOpen}
          onReset={resetFilters}
        />

        <div>
          {isLoading && products.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <Spinner size="lg" className="text-indigo-800" />
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6">
              <ErrorMessage
                message={error.message}
                className="mb-4 text-sm"
              />

              <Button
                variant="secondary"
                onClick={() => void mutate()}
              >
                Try again
              </Button>
            </div>
          ) : (
            <ProductList products={products} view={view} />
          )}

          {pageNumbers.length > 1 && !error && (
            <nav
              className="mt-[42px] flex flex-wrap justify-center gap-[7px]"
              aria-label="Product pagination"
            >
              <button
                className="h-[38px] min-w-[38px] rounded-md border border-slate-200 bg-white px-2 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                disabled={page === 1}
                onClick={() => {
                  setPage((current) =>
                    Math.max(1, current - 1),
                  );
                }}
              >
                ‹
              </button>

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  aria-current={
                    pageNumber === page ? "page" : undefined
                  }
                  className={`h-[38px] min-w-[38px] rounded-md border px-2 ${
                    pageNumber === page
                      ? "border-indigo-900 bg-indigo-900 text-white"
                      : "border-slate-200 bg-white"
                  }`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                className="h-[38px] min-w-[38px] rounded-md border border-slate-200 bg-white px-2 disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
                disabled={
                  page === (pagination?.totalPages ?? 1)
                }
                onClick={() => {
                  setPage((current) =>
                    Math.min(
                      pagination?.totalPages ?? current,
                      current + 1,
                    ),
                  );
                }}
              >
                ›
              </button>
            </nav>
          )}
        </div>
      </div>
    </>
  );
}