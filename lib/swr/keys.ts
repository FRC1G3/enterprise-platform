import type { ProductCategory } from "@/types/product";

export type ProductSort =
  | "featured"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";

export interface ProductListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: ProductCategory;
  min?: number;
  max?: number;
  inStock?: boolean;
  sort?: ProductSort;
}

export function getProductsKey(params: ProductListParams): string {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  if (params.search?.trim()) {
    searchParams.set("search", params.search.trim());
  }

  if (params.category) {
    searchParams.set("category", params.category);
  }

  if (params.min !== undefined) {
    searchParams.set("min", String(params.min));
  }

  if (params.max !== undefined) {
    searchParams.set("max", String(params.max));
  }

  if (params.inStock) {
    searchParams.set("inStock", "true");
  }

  if (params.sort) {
    searchParams.set("sort", params.sort);
  }

  const queryString = searchParams.toString();

  return queryString
    ? `/api/products?${queryString}`
    : "/api/products";
}