import type { Product } from "./product";

export type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export interface OrderItem { id: string; product: Product; quantity: number; unitPrice: number; }
export interface Order { id: string; userId: string; items: OrderItem[]; status: OrderStatus; paymentStatus: PaymentStatus; }

