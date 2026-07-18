"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import { products } from "@/lib/mock-data";
import { ProductFilters, FilterState } from "./ProductFilters";
import { ProductList } from "./ProductList";

interface ProductCatalogProps {
  initialSearch?: string;
  initialCategory?: string;
  initialSort?: string;
}

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to high", value: "price-low" },
  { label: "Price: High to low", value: "price-high" },
  { label: "Top rated", value: "rating" },
];

export function ProductCatalog({
  initialSearch = "",
  initialCategory = "",
  initialSort = "featured",
}: ProductCatalogProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: initialSearch,
    category: initialCategory,
    min: "",
    max: "",
    inStock: false,
  });
  const [sort, setSort] = useState(initialSort);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const searchMatches =
        !filters.search ||
        product.name.toLowerCase().includes(filters.search.toLowerCase());
      const categoryMatches =
        !filters.category ||
        product.category.toLowerCase() === filters.category.toLowerCase();
      const minimumMatches =
        !filters.min || product.price >= Number(filters.min);
      const maximumMatches =
        !filters.max || product.price <= Number(filters.max);
      const stockMatches = !filters.inStock || product.stock > 0;

      return (
        searchMatches &&
        categoryMatches &&
        minimumMatches &&
        maximumMatches &&
        stockMatches
      );
    });

    if (sort === "price-low") {
      return [...result].sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      return [...result].sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      return [...result].sort((a, b) => b.rating - a.rating);
    }

    return [...result].sort(
      (a, b) => Number(b.isFeatured) - Number(a.isFeatured),
    );
  }, [filters, sort]);

  function resetFilters() {
    setFilters({
      search: "",
      category: "",
      min: "",
      max: "",
      inStock: false,
    });
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-3.5">
        <div>
          <strong>{filteredProducts.length} products</strong>
          <p className="m-[3px] leading-7 text-slate-500">
            Curated pieces for an intentional wardrobe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex min-h-[42px] items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50 md:hidden"
            type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            Filters
          </button>
          <Select
            aria-label="Sort products"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            options={sortOptions}
          />
          <button
            className={`relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white ${
              view === "grid" ? "text-indigo-800 ring-2 ring-indigo-200" : ""
            }`}
            type="button"
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            ▦
          </button>
          <button
            className={`relative inline-grid h-[42px] w-[42px] place-items-center rounded-lg border border-slate-200 bg-white ${
              view === "list" ? "text-indigo-800 ring-2 ring-indigo-200" : ""
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
          onChange={setFilters}
          open={filtersOpen}
          onReset={resetFilters}
        />
        <div>
          <ProductList products={filteredProducts} view={view} />

          {filteredProducts.length > 0 && (
            <nav className="pagination" aria-label="Pagination">
              <button
                className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-white"
                type="button"
              >
                ‹
              </button>
              <button
                type="button"
                className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-indigo-900 text-white"
              >
                1
              </button>
              <button
                className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-white"
                type="button"
              >
                2
              </button>
              <button
                className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-white"
                type="button"
              >
                3
              </button>
              <button
                className="h-[38px] w-[38px] rounded-md border border-slate-200 bg-white"
                type="button"
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
