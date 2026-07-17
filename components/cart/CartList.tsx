import { CartItem, type CartLine } from "./CartItem";

type CartListProps = {
  items: CartLine[];
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
};

export function CartList({ items, setQuantity, remove }: CartListProps) {
  return (
    <div>
      {items.map((item) => (
        <CartItem
          key={item.product.id}
          item={item}
          onQuantity={(quantity) => setQuantity(item.product.id, quantity)}
          onRemove={() => remove(item.product.id)}
        />
      ))}
    </div>
  );
}
