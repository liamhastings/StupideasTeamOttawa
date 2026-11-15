"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
      <div className="h-80 animate-pulse border-2 border-dashed border-neutral-300 bg-neutral-100" />
      <p className="mt-5 text-center font-mono text-sm text-neutral-500">
        <span className="font-bold text-[#111]">$</span> {LOADING_LINES[i]}
      </p>
    </div>
  );
}

export function EmptyState({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="px-2 py-16 text-center">
      <pre className="text-sm font-bold leading-tight" aria-hidden>{"  \\|/\n  \\|/\n ,_|_,\n  ~~~"}</pre>
      <h2 className="mt-6 font-mono text-lg font-black leading-tight">
        You&apos;ve swiped on every hacker in a 10 mile radius.
      </h2>
      <p className="mt-3 font-mono text-2xl font-black">Touch grass.</p>
      <div className="mt-8 flex flex-col gap-2">
        <Link href="/matches" className="border-2 border-[#111] px-4 py-3 text-center font-mono text-sm font-bold uppercase bg-[#111] text-white">[ See your matches ]</Link>
        <button type="button" onClick={onRefresh} className="border-2 border-[#111] px-4 py-3 text-center font-mono text-sm font-bold uppercase bg-white text-[#111]">[ Check for new hackers ]</button>
      </div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="px-2 py-16 text-center" role="alert">
      <pre className="text-sm font-bold leading-tight" aria-hidden>{"  ___\n |x_x|\n |___|"}</pre>
      <h2 className="mt-6 font-mono text-lg font-black leading-tight">
        Segmentation fault in the love department.
      </h2>
      <p className="mx-auto mt-3 max-w-xs break-words font-mono text-sm font-bold">{message}</p>
      <button type="button" onClick={onRetry} className="mt-8 border-2 border-[#111] px-4 py-3 text-center font-mono text-sm font-bold uppercase bg-[#111] text-white">[ Turn it off and on again ]</button>
    </div>
  );
}
