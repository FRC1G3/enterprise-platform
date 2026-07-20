import { CartItem } from "@/components/cart/CartItem";

import type {
  CartItem as CartItemData,
} from "@/types/cart";

interface CartListProps {
  items: CartItemData[];

  updatingItemId: string | null;
  removingItemId: string | null;

  setQuantity: (
    itemId: string,
    quantity: number,
  ) => void;

  remove: (itemId: string) => void;
}

export function CartList({
  items,
  updatingItemId,
  removingItemId,
  setQuantity,
  remove,
}: CartListProps) {
  return (
    <div>
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          isUpdating={
            updatingItemId === item.id
          }
          isRemoving={
            removingItemId === item.id
          }
          onQuantity={(quantity) =>
            setQuantity(
              item.id,
              quantity,
            )
          }
          onRemove={() => remove(item.id)}
        />
      ))}
    </div>
  );
}