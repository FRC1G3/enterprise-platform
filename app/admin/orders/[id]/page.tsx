"use client";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { orders, products } from "@/lib/mock-data";
import { Button } from "@/components/ui/Button";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export default function AdminOrderDetailsPage({params}:{params:Promise<{id:string}>}) {
  const {id}=use(params);
  const order=orders.find(item=>item.id===id)??orders[0];
  const [status,setStatus]=useState(order.status);
  const [done,setDone]=useState(false);
  return <><div className="page-head"><div><Link href="/admin/orders" className="muted">← Orders</Link><h1>Order {order.id}</h1><p className="muted">Received {order.date}</p></div><OrderStatusBadge status={status}/></div><div className="checkout-layout"><div className="stack"><section className="panel dashboard-card"><h2>Customer & shipping</h2><div className="grid-2"><div><small className="muted">Customer</small><p><strong>{order.customer}</strong><br/>emma@example.com<br/>+1 202 555 0142</p></div><div><small className="muted">Address</small><p>{order.address}</p></div></div></section><section className="panel dashboard-card"><h2>Products</h2>{products.slice(0,3).map(p=><div className="spread" style={{padding:"12px 0",borderBottom:"1px solid var(--line)"}} key={p.id}><div className="row"><Image src={p.image} alt={p.name} width={48} height={58} style={{objectFit:"cover",borderRadius:5}}/><div><strong>{p.name}</strong><div className="muted">Qty 1 · {p.sku}</div></div></div><strong>${p.price}</strong></div>)}</section><section className="panel dashboard-card"><h2>Timeline</h2><div className="timeline">{["Order received","Payment confirmed","Processing"].map(x=><div className="timeline-step" key={x}><strong>{x}</strong><div className="muted">Jul 15, 2026</div></div>)}</div></section></div><aside className="stack"><section className="panel dashboard-card"><h3>Update status</h3><select className="select" value={status} onChange={e=>{setStatus(e.target.value);setDone(false)}} aria-label="Order status">{["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"].map(x=><option key={x}>{x}</option>)}</select><label className="field" style={{marginTop:14}}><span>Internal notes</span><textarea className="textarea" placeholder="Visible to admins only"/></label>{done&&<div className="message" style={{marginTop:12}}>Order updated in mock state.</div>}<Button style={{width:"100%",marginTop:14}} onClick={()=>setDone(true)}>Update order</Button></section><section className="panel dashboard-card"><h3>Payment</h3><p>Mock card ···· 4242</p><OrderStatusBadge status={order.payment}/><div className="summary-line summary-total"><span>Total</span><span>${order.total}</span></div></section></aside></div></>;
}
