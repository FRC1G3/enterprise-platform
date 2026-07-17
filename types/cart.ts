import type { Product } from "./product";

export interface CartItem { id: string; product: Product; quantity: number; }
export interface Cart { id: string; userId: string; items: CartItem[]; }

