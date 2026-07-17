import Link from "next/link";
export function EmptyState({ title, message, href, action }: { title:string; message:string; href?:string; action?:string }) {
  return <div className="panel" style={{padding:48,textAlign:"center"}}><div style={{fontSize:42}}>◇</div><h2>{title}</h2><p className="muted">{message}</p>{href&&action&&<Link className="btn btn-primary" href={href}>{action}</Link>}</div>;
}
