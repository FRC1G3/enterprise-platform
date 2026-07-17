import type { StoreProduct } from "@/lib/mock-data";
import { ProductCard } from "./ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProductListProps { products:StoreProduct[]; view?:"grid"|"list"; }

export function ProductList({products,view="grid"}:ProductListProps) {
  if(!products.length) return <EmptyState title="No products found" message="Try changing or resetting your filters." href="/products" action="Reset filters"/>;
  return <div className={`product-grid ${view==="list"?"list-view":""}`}>{products.map(product=><ProductCard key={product.id} product={product}/>)}</div>;
}
