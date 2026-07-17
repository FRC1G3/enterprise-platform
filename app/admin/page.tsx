import Link from "next/link";
import { dashboardStats, orders } from "@/lib/mock-data";
import { StatCard } from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { LowStockList } from "@/components/dashboard/LowStockList";
import { SalesSummary } from "@/components/dashboard/SalesSummary";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

export default function AdminDashboardPage() {
  return <><div className="page-head"><div><span className="eyebrow">Overview</span><h1>Dashboard</h1><p className="muted">Welcome back, Ava. Here is what is happening today.</p></div><button className="btn btn-primary" type="button">Download report</button></div>
    <div className="stats-grid">{dashboardStats.map(s=><StatCard key={s.label} {...s}/>)}</div>
    <div className="dashboard-grid"><section className="panel dashboard-card"><div className="spread"><h2>Sales summary</h2><span className="badge">Last 7 days</span></div><SalesSummary/></section><section className="panel dashboard-card"><h2>Order distribution</h2>{[["Delivered",68],["Processing",18],["Shipped",10],["Cancelled",4]].map(([x,n])=><div style={{margin:"16px 0"}} key={x}><div className="spread"><span>{x}</span><strong>{n}%</strong></div><div className="progress"><span style={{width:`${n}%`}}/></div></div>)}</section></div>
    <div className="dashboard-grid"><section className="panel dashboard-card"><div className="spread"><h2>Recent orders</h2><Link href="/admin/orders">View all</Link></div><div className="table-wrap" style={{border:0}}><table className="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead><tbody>{orders.slice(0,4).map(o=><tr key={o.id}><td>{o.id}</td><td>{o.customer}</td><td>${o.total}</td><td><OrderStatusBadge status={o.status}/></td></tr>)}</tbody></table></div></section><section className="stack"><div className="panel dashboard-card"><h2>Low stock</h2><LowStockList/></div><div className="panel dashboard-card"><h2>Recent activity</h2><RecentActivity/></div></section></div></>;
}
