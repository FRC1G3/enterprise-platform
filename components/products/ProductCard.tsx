"use client";
import Image from "next/image";
import Link from "next/link";
import type { StoreProduct } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";

interface ProductCardProps { product:StoreProduct; }

export function ProductCard({product}:ProductCardProps) {
  const isOnSale=Boolean(product.originalPrice&&product.originalPrice>product.price);
  return <article className="product-card"><div className="product-media"><Link href={`/products/${product.slug}`}><Image src={product.image} alt={product.name} fill sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 25vw"/></Link><div className="product-badges">{product.isNew&&<span className="badge">New</span>}{isOnSale&&<span className="badge danger">Sale</span>}</div><button type="button" className="icon-btn wishlist" aria-label={`Add ${product.name} to wishlist`}>♡</button></div><div className="product-info"><span className="product-category">{product.category}</span><Link href={`/products/${product.slug}`}><h3>{product.name}</h3></Link><div className="spread"><span className="rating">★ {product.rating} <span className="muted">({product.reviewCount})</span></span><span className="row"><span className="price">${product.price}</span>{isOnSale&&<span className="old-price">${product.originalPrice}</span>}</span></div><Button className="product-action">Add to cart</Button></div></article>;
}
