import type { Metadata } from "next";
import { ProductCatalog } from "@/components/products/ProductCatalog";
export const metadata:Metadata={title:"Shop all"};
export default async function ProductsPage({searchParams}:{searchParams:Promise<{search?:string;category?:string;sort?:string}>}){const query=await searchParams;return <div className="page"><div className="container"><div className="page-head"><div><span className="eyebrow">Nova collection</span><h1>Shop all products</h1></div></div><ProductCatalog initialSearch={query.search} initialCategory={query.category} initialSort={query.sort}/></div></div>}
