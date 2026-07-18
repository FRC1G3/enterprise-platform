"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface FilterState {
  search: string;
  category: string;
  min: string;
  max: string;
  inStock: boolean;
}

interface ProductFiltersProps {
  value: FilterState;
  onChange: (value: FilterState) => void;
  open: boolean;
  onReset: () => void;
}

const categoryOptions = [
  { label: "All categories", value: "" },
  { label: "Men", value: "Men" },
  { label: "Women", value: "Women" },
  { label: "Shoes", value: "Shoes" },
  { label: "Accessories", value: "Accessories" },
];

export function ProductFilters({
  value,
  onChange,
  open,
  onReset,
}: ProductFiltersProps) {
  function updateFilter(key: keyof FilterState, nextValue: string | boolean) {
    onChange({ ...value, [key]: nextValue });
  }

  return (
    <aside
      className={`h-max rounded-[14px] border border-slate-200 bg-white p-[22px] shadow-[0_10px_35px_rgba(15,23,42,0.06)] md:sticky md:top-[95px] ${
        open ? "block" : "hidden md:block"
      }`}
      aria-label="Product filters"
    >
      <div className="border-b border-slate-200 py-[18px]">
        <Input
          label="Search"
          value={value.search}
          onChange={(event) => updateFilter("search", event.target.value)}
          placeholder="Jacket, shoes..."
        />
      </div>

      <div className="border-b border-slate-200 py-[18px]">
        <Select
          label="Category"
          value={value.category}
          onChange={(event) => updateFilter("category", event.target.value)}
          options={categoryOptions}
        />
      </div>

      <div className="border-b border-slate-200 py-[18px]">
        <h3>Price range</h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            aria-label="Minimum price"
            type="number"
            min="0"
            value={value.min}
            onChange={(event) => updateFilter("min", event.target.value)}
            placeholder="Min"
          />
          <Input
            aria-label="Maximum price"
            type="number"
            min="0"
            value={value.max}
            onChange={(event) => updateFilter("max", event.target.value)}
            placeholder="Max"
          />
        </div>
      </div>

      <div className="border-b border-slate-200 py-[18px]">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={value.inStock}
            onChange={(event) => updateFilter("inStock", event.target.checked)}
          />{" "}
          In stock only
        </label>
      </div>

      <button
        type="button"
        className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-[17px] py-2.5 font-bold text-slate-900 transition hover:-translate-y-px hover:bg-slate-50"
        onClick={onReset}
      >
        Reset filters
      </button>
    </aside>
  );
}
