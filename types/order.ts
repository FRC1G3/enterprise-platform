export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "REFUNDED";

export type PaymentMethod =
  | "CASH_ON_DELIVERY"
  | "MOCK_CARD";

export interface OrderItem {
  id: string;

  productId: string | null;
  productName: string;
  productImage: string;

  selectedColor: string | null;
  selectedSize: string | null;

  quantity: number;
  unitPrice: number;
  totalPrice: number;

  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;

  userId: string | null;

  customerName: string;
  customerEmail: string;
  customerPhone: string | null;

  shippingCountry: string;
  shippingCity: string;
  shippingAddress: string;
  shippingPostalCode: string;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;

  subtotal: number;
  shipping: number;
  discount: number;
  total: number;

  notes: string | null;

  items: OrderItem[];

  createdAt: string;
  updatedAt: string;
}