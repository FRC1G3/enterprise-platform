import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/types/order";

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;

  customerName: string;
  customerEmail: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  itemCount: number;
  total: number;

  createdAt: string;
  updatedAt: string;
}

export interface AdminOrderPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AdminOrderListResult {
  orders: AdminOrderListItem[];
  pagination: AdminOrderPagination;
}

export interface AdminOrderListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  date?: string;
}