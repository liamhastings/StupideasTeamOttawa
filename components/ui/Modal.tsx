"use client";
import { useEffect } from "react";

/** Bottom sheet on phones, centered dialog on desktop. */
export default function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 sm:items-center sm:p-4" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-edge bg-slab p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-edge sm:hidden" aria-hidden />
        {children}
      </div>
    </div>
  );
}
