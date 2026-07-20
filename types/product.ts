export const PRODUCT_CATEGORIES = [
  "Men",
  "Women",
  "Shoes",
  "Accessories",
] as const;

export type ProductCategory =
  (typeof PRODUCT_CATEGORIES)[number];

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;

  price: number;
  originalPrice?: number;

  category: ProductCategory;
  sku: string;

  image: string;
  images: string[];
  colors: string[];
  sizes: string[];

  rating: number;
  reviewCount: number;

  stock: number;
  reservedStock: number;

  isFeatured: boolean;
  isNew: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface ProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductListResult {
  products: Product[];
  pagination: ProductPagination;
}

export type ProductCardItem = Pick<
  Product,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "originalPrice"
  | "category"
  | "image"
  | "rating"
  | "reviewCount"
  | "isNew"
  | "colors"
  | "sizes"
  | "stock"
  | "isActive"
>;