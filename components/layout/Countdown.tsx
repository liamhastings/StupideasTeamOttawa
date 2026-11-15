"use client";
import { useEffect, useState } from "react";
import { getDeadline } from "./deadline";

const pad = (n: number) => String(n).padStart(2, "0");

export default function Countdown({ className = "" }: { className?: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const end = getDeadline();
    const tick = () => setLeft(Math.max(0, end - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return <span className={`font-mono tabular-nums ${className}`}>--:--:--</span>;
  const s = Math.floor(left / 1000);
  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {pad(Math.floor(s / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}
    </span>
  );
}
