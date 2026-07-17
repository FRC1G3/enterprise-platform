import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/mock-data";
import { ProductDetails } from "@/components/products/ProductDetails";
export function generateStaticParams(){return products.map(p=>({id:p.slug}));}
export default async function ProductDetailsPage({params}:{params:Promise<{id:string}>}){const {id}=await params;const product=products.find(p=>p.id===id||p.slug===id);if(!product)notFound();const related=products.filter(p=>p.category===product.category&&p.id!==product.id).slice(0,4);return <div className="page"><div className="container"><nav className="breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/products">Products</Link><span>/</span><span>{product.name}</span></nav><ProductDetails product={product} related={related}/></div></div>}
