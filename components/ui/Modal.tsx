"use client";

import { useEffect } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const close = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();

    document.addEventListener("keydown", close);

    return () => document.removeEventListener("keydown", close);
  }, [onClose]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-slate-900/60 p-5"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className="w-full max-w-[480px] rounded-xl bg-white p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 id="modal-title">{title}</h2>
          <Button variant="ghost" aria-label="Close modal" onClick={onClose}>
            ×
          </Button>
        </div>
        {children}
      </section>
    </div>
  );
}
