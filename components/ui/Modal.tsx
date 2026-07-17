"use client";
import { useEffect } from "react";
import { Button } from "./Button";
export function Modal({ open, title, children, onClose }: { open:boolean; title:string; children:React.ReactNode; onClose:()=>void }) {
  useEffect(()=>{ const close=(e:KeyboardEvent)=>e.key==="Escape"&&onClose(); document.addEventListener("keydown",close); return()=>document.removeEventListener("keydown",close); },[onClose]);
  if(!open)return null;
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={e=>e.stopPropagation()}><div className="modal-head"><h2 id="modal-title">{title}</h2><Button variant="ghost" aria-label="Close modal" onClick={onClose}>×</Button></div>{children}</section></div>;
}
