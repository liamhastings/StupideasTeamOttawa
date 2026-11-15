"use client";
import { createContext, useCallback, useContext, useState } from "react";

type T = { id: number; text: string };
const Ctx = createContext<{ push: (text: string) => void }>({ push: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<T[]>([]);
  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setItems((s) => [...s, { id, text }]);
    setTimeout(() => setItems((s) => s.filter((t) => t.id !== id)), 2600);
  }, []);
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="rounded-full bg-snow px-5 py-2.5 text-sm font-semibold text-ink shadow-lg">{t.text}</div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
