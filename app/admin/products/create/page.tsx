import Link from "next/link";
import { ProductForm } from "@/components/products/ProductForm";

export default function CreateProductPage() {
  return (
    <>
      <div className="mb-7 flex items-end justify-between gap-6">
        <div>
          <Link href="/admin/products" className="leading-7 text-slate-500">
            ← Products
          </Link>
          <h1>Create product</h1>
        </div>
      </div>
      <ProductForm />
    </>
  );
}

