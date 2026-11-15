"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import SwipeCard from "./SwipeCard";
import type { DeckItem, SwipeAction } from "./types";

// Ignore swipes closer together than this. Stops a double-click (or a held arrow key)
// from skipping the next card nobody has even read yet.
const COOLDOWN_MS = 260;
const VISIBLE = 3;

interface SwipeDeckProps {
  deck: DeckItem[];
  /** Called with the top card. The parent removes it from `deck` and talks to the API. */
  onSwipe: (item: DeckItem, action: SwipeAction) => void;
  /** Pause input (e.g. while the match overlay is open). */
  disabled?: boolean;
}

export default function SwipeDeck({ deck, onSwipe, disabled = false }: SwipeDeckProps) {
  const [exitDir, setExitDir] = useState(1);
  const lastSwipeAt = useRef(0);

  const swipe = useCallback(
    (action: SwipeAction) => {
      const top = deck[0];
      if (!top || disabled) return;
      const now = Date.now();
      if (now - lastSwipeAt.current < COOLDOWN_MS) return;
      lastSwipeAt.current = now;
      setExitDir(action === "like" ? 1 : -1);
      onSwipe(top, action);
    },
    [deck, disabled, onSwipe],
  );

  // ArrowLeft = pass, ArrowRight = like.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        swipe("like");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        swipe("pass");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [swipe]);

  const visible = deck.slice(0, VISIBLE);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      {/* Every card sits in the same grid cell, so the stack is as tall as the tallest card. */}
      <div className="grid w-full">
        <AnimatePresence custom={exitDir}>
          {visible.map((item, i) => (
            <SwipeCard
              key={item.profile.id}
              item={item}
              index={i}
              exitDir={exitDir}
              onSwipe={swipe}
            />
          ))}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-8">
        <button
          type="button"
          onClick={() => swipe("pass")}
          disabled={disabled || deck.length === 0}
          aria-label="Pass on this hacker (left arrow)"
          className="group flex h-16 w-16 items-center justify-center rounded-full border-2 border-rose-500/60 bg-neutral-900 text-3xl shadow-lg transition hover:scale-110 hover:bg-rose-500/20 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <span aria-hidden>🗑️</span>
        </button>
        <button
          type="button"
          onClick={() => swipe("like")}
          disabled={disabled || deck.length === 0}
          aria-label="Like this hacker (right arrow)"
          className="group flex h-20 w-20 items-center justify-center rounded-full border-2 border-emerald-400/70 bg-neutral-900 text-4xl shadow-lg transition hover:scale-110 hover:bg-emerald-400/20 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          <span aria-hidden>🤝</span>
        </button>
      </div>
      <p className="font-mono text-xs text-neutral-500">
        <kbd className="rounded border border-white/20 px-1.5">←</kbd> git rm &nbsp;·&nbsp;{" "}
        <kbd className="rounded border border-white/20 px-1.5">→</kbd> git merge
      </p>
    </div>
  );
}
