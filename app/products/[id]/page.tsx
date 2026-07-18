import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductDetails } from "@/components/products/ProductDetails";

import {
  getProductByIdOrSlug,
  listProducts,
  ProductNotFoundError,
} from "@/lib/services/product.service";

async function getProductPageData(id: string) {
  try {
    const product = await getProductByIdOrSlug(id);

    const relatedResult = await listProducts({
      page: 1,
      limit: 5,
      category: product.category,
      sort: "featured",
    });

    const related = relatedResult.products
      .filter((item) => item.id !== product.id)
      .slice(0, 4);

    return {
      product,
      related,
    };
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      notFound();
    }

    throw error;
  }
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const { product, related } = await getProductPageData(id);

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