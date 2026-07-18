import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/products/ProductForm";
import { products } from "@/lib/mock-data";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id || item.slug === id);

  if (!product) {
    notFound();
  }

  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <Link href="/admin/products" className="leading-7 text-slate-500">
            ← Products
          </Link>
          <h1>Edit product</h1>
          <p className="leading-7 text-slate-500">{product.name}</p>
        </div>
      </div>
      <ProductForm product={product} />
    </>
  );
}

