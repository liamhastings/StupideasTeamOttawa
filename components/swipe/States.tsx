"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
    <div className="flex flex-col items-center gap-4 py-24 text-center" role="status" aria-live="polite">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      <p className="font-mono text-sm text-neutral-300">{LOADING_LINES[i]}</p>
    </div>
  );
}

export function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <div className="text-6xl" aria-hidden>🌱</div>
      <h2 className="text-xl font-bold">You&apos;ve swiped on every hacker in a 10 mile radius.</h2>
      <p className="font-mono text-lg text-emerald-400">Touch grass.</p>
      <div className="mt-2 flex gap-3">
        <Link href="/matches" className="rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold hover:bg-pink-500">
          See your matches
        </Link>
        <button
          type="button"
          onClick={onRefresh}
          className="rounded-full border border-white/20 px-5 py-2 text-sm hover:bg-white/10"
        >
          Check for new hackers
        </button>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center" role="alert">
      <div className="text-6xl" aria-hidden>💥</div>
      <h2 className="text-xl font-bold">Segmentation fault in the love department.</h2>
      <p className="max-w-xs font-mono text-sm text-rose-300">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-full bg-pink-600 px-5 py-2 text-sm font-semibold hover:bg-pink-500"
      >
        Turn it off and on again
      </button>
    </div>
  );
}
