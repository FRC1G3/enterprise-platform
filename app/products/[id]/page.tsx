import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/products/ProductDetails";
import { products } from "@/lib/mock-data";

export function generateStaticParams() {
  return products.map((product) => ({ id: product.slug }));
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = products.find((item) => item.id === id || item.slug === id);

  if (!product) {
    notFound();
  }

  const related = products
    .filter((item) => item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-[60vh] py-12 pb-20">
      <div className="mx-auto w-full max-w-[1180px] px-4">
        <nav className="mb-7 flex gap-2 text-[0.85rem] text-slate-500">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/products">Products</Link>
          <span>/</span>
          <span>{product.name}</span>
        </nav>
        <ProductDetails product={product} related={related} />
      </div>
    </div>
  );
}

