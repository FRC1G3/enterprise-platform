import { EmptyState } from "@/components/ui/EmptyState";
import type { StoreProduct } from "@/lib/mock-data";
import { ProductCard } from "./ProductCard";

interface ProductListProps {
  products: StoreProduct[];
  view?: "grid" | "list";
}

export function ProductList({ products, view = "grid" }: ProductListProps) {
  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        message="Try changing or resetting your filters."
        href="/products"
        action="Reset filters"
      />
    );
  }

  return (
    <div
      className={
        view === "list"
          ? "grid grid-cols-1 gap-x-5 gap-y-[26px]"
          : "grid grid-cols-1 gap-x-5 gap-y-[26px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      }
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} view={view} />
      ))}
    </div>
  );
}
