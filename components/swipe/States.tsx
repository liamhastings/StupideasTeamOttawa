"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

const LOADING_LINES = [
  "Compiling your soulmates…",
  "npm install teammate…",
  "Resolving merge conflicts of the heart…",
  "Fetching hackers who definitely sleep…",
  "Training a neural net to judge your tabs vs spaces…",
  "Spinning up the vibe check microservice…",
];

export function LoadingState() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % LOADING_LINES.length), 1400);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="mt-2" role="status" aria-live="polite">
      <div className="h-80 animate-pulse rounded-2xl border border-edge bg-slab" />
      <p className="mt-5 text-center font-mono text-sm text-dim">
        <span className="text-hi">$</span> {LOADING_LINES[i]}
      </p>
    </div>
  );
}

export function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="px-2 py-16 text-center">
      <div className="text-6xl" aria-hidden>🌱</div>
      <h2 className="mt-6 font-display text-xl font-extrabold leading-tight">
        You&apos;ve swiped on every hacker in a 10 mile radius.
      </h2>
      <p className="mt-3 font-display text-2xl font-black text-ok">Touch grass.</p>
      <div className="mt-8 flex flex-col gap-2">
        <Button href="/matches">See your matches</Button>
        <Button variant="ghost" onClick={onRefresh}>Check for new hackers</Button>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-2 py-16 text-center" role="alert">
      <div className="text-6xl" aria-hidden>💥</div>
      <h2 className="mt-6 font-display text-xl font-extrabold leading-tight">
        Segmentation fault in the love department.
      </h2>
      <p className="mx-auto mt-3 max-w-xs break-words font-mono text-sm text-ship">{message}</p>
      <Button onClick={onRetry} className="mt-8">Turn it off and on again</Button>
    </div>
  );
}
