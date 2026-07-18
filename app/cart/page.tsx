"use client";

import Link from "next/link";
import { useState } from "react";
import { CartList } from "@/components/cart/CartList";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/ui/EmptyState";
import { products } from "@/lib/mock-data";
import type { CartLine } from "@/components/cart/CartItem";

const initialItems: CartLine[] = [
  { product: products[0], quantity: 1, size: "M", color: "Camel" },
  { product: products[2], quantity: 2, size: "41", color: "White" },
];

export default function CartPage() {
  const [items, setItems] = useState(initialItems);

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  );

  function updateQuantity(id: string, quantity: number) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === id ? { ...item, quantity } : item,
      ),
    );
  }

  function removeItem(id: string) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.product.id !== id),
    );
  }

  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Your selection</span>
            <h1>Shopping cart</h1>
          </div>
          <Link href="/products">{"\u2190"} Continue shopping</Link>
        </div>

        {items.length ? (
          <div className="grid gap-[38px] lg:grid-cols-[1fr_370px]">
            <CartList
              items={items}
              setQuantity={updateQuantity}
              remove={removeItem}
            />
            <CartSummary subtotal={subtotal} />
          </div>
        ) : (
          <EmptyState
            title="Your cart is empty"
            message="A considered wardrobe starts with one great piece."
            href="/products"
            action="Explore products"
          />
        )}
      </div>
    </div>
  );
}

