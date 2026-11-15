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
    <div role="status" aria-live="polite">
      {/* A card-shaped hole: same silhouette as the profile that is about to land */}
      <div className="space-y-3 rounded-3xl bg-floor p-3">
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-slab" />
        <div className="aspect-[4/5] animate-pulse rounded-2xl bg-slab" />
        <div className="h-28 animate-pulse rounded-2xl bg-slab" />
      </div>
      <p className="mt-5 text-center font-mono text-sm text-dim">
        <span className="font-bold text-hi">$</span> {LOADING_LINES[i]}
      </p>
    </div>
  );
}

function Sprout({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M32 58V30" />
      <path d="M32 36C32 24 22 18 10 20c0 12 8 18 22 16z" />
      <path d="M32 30c0-10 8-16 20-16 0 12-8 18-20 16z" />
      <path d="M12 58h40" />
    </svg>
  );
}

export function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="px-2 py-16 text-center">
      <Sprout className="mx-auto h-20 w-20 text-ok" />
      <h2 className="mt-6 text-lg font-semibold leading-snug text-dim">
        You&apos;ve swiped on every hacker in a 10 mile radius.
      </h2>
      <p className="mt-2 font-display text-4xl font-black">Touch grass.</p>
      <div className="mx-auto mt-8 flex max-w-xs flex-col gap-3">
        <Button href="/matches">See your matches</Button>
        <Button variant="ghost" onClick={onRefresh}>Check for new hackers</Button>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-2 py-16 text-center" role="alert">
      <p className="font-display text-6xl font-black text-ship" aria-hidden>x_x</p>
      <h2 className="mt-6 font-display text-xl font-extrabold leading-tight">Segmentation fault in the love department.</h2>
      <p className="mx-auto mt-3 max-w-xs break-words font-mono text-sm text-dim">{message}</p>
      <Button onClick={onRetry} className="mt-8">Turn it off and on again</Button>
    </div>
  );
}
