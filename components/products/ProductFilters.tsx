"use client";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export interface FilterState { search:string; category:string; min:string; max:string; inStock:boolean; }
interface ProductFiltersProps { value:FilterState; onChange:(value:FilterState)=>void; open:boolean; onReset:()=>void; }

export function ProductFilters({value,onChange,open,onReset}:ProductFiltersProps) {
  function updateFilter(key:keyof FilterState,nextValue:string|boolean) {
    onChange({...value,[key]:nextValue});
  }
  return <aside className={`panel filter-panel ${open?"open":""}`} aria-label="Product filters"><div className="filter-group"><Input label="Search" value={value.search} onChange={event=>updateFilter("search",event.target.value)} placeholder="Jacket, shoes..."/></div><div className="filter-group"><Select label="Category" value={value.category} onChange={event=>updateFilter("category",event.target.value)} options={[{label:"All categories",value:""},{label:"Men",value:"Men"},{label:"Women",value:"Women"},{label:"Shoes",value:"Shoes"},{label:"Accessories",value:"Accessories"}]}/></div><div className="filter-group"><h3>Price range</h3><div className="grid-2"><Input aria-label="Minimum price" type="number" min="0" value={value.min} onChange={event=>updateFilter("min",event.target.value)} placeholder="Min"/><Input aria-label="Maximum price" type="number" min="0" value={value.max} onChange={event=>updateFilter("max",event.target.value)} placeholder="Max"/></div></div><div className="filter-group"><label className="row"><input type="checkbox" checked={value.inStock} onChange={event=>updateFilter("inStock",event.target.checked)}/> In stock only</label></div><button type="button" className="btn btn-secondary" style={{width:"100%"}} onClick={onReset}>Reset filters</button></aside>;
}
