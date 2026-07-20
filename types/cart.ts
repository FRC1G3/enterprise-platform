export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;

  stock: number;
  colors: string[];
  sizes: string[];

  isActive: boolean;
}

export interface CartItem {
  id: string;
  quantity: number;

  selectedColor: string | null;
  selectedSize: string | null;

  lineTotal: number;
  product: CartProduct;

  createdAt: string;
  updatedAt: string;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Cart {
  id: string;
  userId: string;

  items: CartItem[];
  totals: CartTotals;

  createdAt: string;
  updatedAt: string;
}