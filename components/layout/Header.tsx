"use client";
import Link from "next/link";
import { usePathname,useRouter } from "next/navigation";
import { FormEvent,useState } from "react";

const navigation=[["Home","/"],["Products","/products"],["Men","/products?category=Men"],["Women","/products?category=Women"],["Shoes","/products?category=Shoes"],["Accessories","/products?category=Accessories"]];

function Icon({name}:{name:"search"|"user"|"cart"|"menu"}) {
  const icons={
    search:<><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    user:<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    cart:<><path d="M3 4h2l2 11h11l2-7H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></>,
    menu:<><path d="M4 7h16M4 12h16M4 17h16"/></>,
  };
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>{icons[name]}</svg>;
}

export function Header() {
  const pathname=usePathname();
  const router=useRouter();
  const [menuOpen,setMenuOpen]=useState(false);
  const [search,setSearch]=useState("");

  function submitSearch(event:FormEvent) {
    event.preventDefault();
    router.push(`/products?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
  }

  return <header className="site-header storefront-header"><div className="container header-row"><Link className="logo" href="/"><span className="logo-mark">NOVA</span> STORE</Link><nav className="nav" aria-label="Main navigation">{navigation.map(([label,href])=><Link key={label} href={href} className={pathname===href||(label==="Products"&&pathname.startsWith("/products"))?"active":""}>{label}</Link>)}</nav><div className="header-actions"><form className="header-search" onSubmit={submitSearch}><Icon name="search"/><label className="sr-only" htmlFor="site-search">Search</label><input id="site-search" className="input" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search products"/></form><Link className="admin-link" href="/admin">Admin</Link><Link className="icon-btn" href="/profile" aria-label="Profile"><Icon name="user"/></Link><Link className="icon-btn cart-mobile" href="/cart" aria-label="Cart"><Icon name="cart"/><span className="cart-count">2</span></Link><button className="icon-btn mobile-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={()=>setMenuOpen(!menuOpen)}><Icon name="menu"/></button></div></div>{menuOpen&&<nav className="mobile-menu" aria-label="Mobile navigation">{navigation.map(([label,href])=><Link key={label} href={href} onClick={()=>setMenuOpen(false)}>{label}</Link>)}<Link href="/login" onClick={()=>setMenuOpen(false)}>Login</Link><Link href="/profile" onClick={()=>setMenuOpen(false)}>Profile</Link><Link href="/admin" onClick={()=>setMenuOpen(false)}>Admin Dashboard</Link><form onSubmit={submitSearch} className="row" style={{paddingTop:12}}><input className="input" value={search} onChange={event=>setSearch(event.target.value)} placeholder="Search products" aria-label="Search products"/><button className="btn btn-primary" type="submit">Search</button></form></nav>}</header>;
}
