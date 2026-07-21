export type InventoryStatus =
  | "IN_STOCK"
  | "LOW_STOCK"
  | "OUT_OF_STOCK";

export interface InventoryProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  image: string;
  isActive: boolean;
}

export interface InventoryItem {
  id: string;
  productId: string;

  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;

  status: InventoryStatus;

  product: InventoryProduct;

  createdAt: string;
  updatedAt: string;
}

export interface InventoryPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryListResult {
  inventory: InventoryItem[];
  pagination: InventoryPagination;
}

export interface InventoryListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InventoryStatus;
}