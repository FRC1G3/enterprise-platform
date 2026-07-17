"use client";
import { useMemo,useState } from "react";
import { products } from "@/lib/mock-data";
import { ProductFilters,FilterState } from "./ProductFilters";
import { ProductList } from "./ProductList";
import { Select } from "@/components/ui/Select";

interface ProductCatalogProps { initialSearch?:string; initialCategory?:string; initialSort?:string; }

export function ProductCatalog({initialSearch="",initialCategory="",initialSort="featured"}:ProductCatalogProps) {
  const [filters,setFilters]=useState<FilterState>({search:initialSearch,category:initialCategory,min:"",max:"",inStock:false});
  const [sort,setSort]=useState(initialSort);
  const [view,setView]=useState<"grid"|"list">("grid");
  const [filtersOpen,setFiltersOpen]=useState(false);

  const filteredProducts=useMemo(()=>{
    const result=products.filter(product=>{
      const searchMatches=!filters.search||product.name.toLowerCase().includes(filters.search.toLowerCase());
      const categoryMatches=!filters.category||product.category.toLowerCase()===filters.category.toLowerCase();
      const minimumMatches=!filters.min||product.price>=Number(filters.min);
      const maximumMatches=!filters.max||product.price<=Number(filters.max);
      const stockMatches=!filters.inStock||product.stock>0;
      return searchMatches&&categoryMatches&&minimumMatches&&maximumMatches&&stockMatches;
    });
    if(sort==="price-low") return [...result].sort((a,b)=>a.price-b.price);
    if(sort==="price-high") return [...result].sort((a,b)=>b.price-a.price);
    if(sort==="rating") return [...result].sort((a,b)=>b.rating-a.rating);
    return [...result].sort((a,b)=>Number(b.isFeatured)-Number(a.isFeatured));
  },[filters,sort]);

  function resetFilters() {
    setFilters({search:"",category:"",min:"",max:"",inStock:false});
  }

  return <><div className="catalog-toolbar"><div><strong>{filteredProducts.length} products</strong><p className="muted" style={{margin:3}}>Curated pieces for an intentional wardrobe.</p></div><div className="toolbar-actions"><button className="btn btn-secondary filter-mobile-btn" type="button" onClick={()=>setFiltersOpen(!filtersOpen)}>Filters</button><Select aria-label="Sort products" value={sort} onChange={event=>setSort(event.target.value)} options={[{label:"Featured",value:"featured"},{label:"Price: Low to high",value:"price-low"},{label:"Price: High to low",value:"price-high"},{label:"Top rated",value:"rating"}]}/><button className={`icon-btn ${view==="grid"?"active":""}`} type="button" onClick={()=>setView("grid")} aria-label="Grid view">▦</button><button className={`icon-btn ${view==="list"?"active":""}`} type="button" onClick={()=>setView("list")} aria-label="List view">☷</button></div></div><div className="catalog-layout"><ProductFilters value={filters} onChange={setFilters} open={filtersOpen} onReset={resetFilters}/><div><ProductList products={filteredProducts} view={view}/>{filteredProducts.length>0&&<nav className="pagination" aria-label="Pagination"><button type="button">‹</button><button type="button" className="active">1</button><button type="button">2</button><button type="button">3</button><button type="button">›</button></nav>}</div></div></>;
}
