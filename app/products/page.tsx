import type { Metadata } from "next";
import { ProductCatalog } from "@/components/products/ProductCatalog";

export const metadata: Metadata = { title: "Shop all" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    category?: string;
    sort?: string;
  }>;
}) {
  const query = await searchParams;

  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <div className="mb-7 flex items-end justify-between gap-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-800">Nova collection</span>
            <h1>Shop all products</h1>
          </div>
        </div>
        <ProductCatalog
          initialSearch={query.search}
          initialCategory={query.category}
          initialSort={query.sort}
        />
      </div>
    </div>
  );
}

