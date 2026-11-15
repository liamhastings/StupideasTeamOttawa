"use client";

import { AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeartIcon } from "@/components/ui/Icons";
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
      if (e.repeat) return; // a held key must not plow through unread cards
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
    <div className="flex w-full flex-col items-center gap-6">
      {/* Every card sits in the same grid cell, so the stack is as tall as the tallest card. */}
      <div className="grid w-full grid-cols-1">
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

      {/* Sticky just above Ian's fixed TabBar (~4.25rem) so the buttons are never hidden on short phones. */}
      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 flex w-full items-end justify-center gap-10 bg-gradient-to-t from-floor via-floor/90 to-transparent pb-1 pt-4">
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => swipe("pass")}
            disabled={disabled || deck.length === 0}
            aria-label="Pass on this hacker (left arrow)"
            className="grid h-16 w-16 place-items-center rounded-full border-2 border-ship/60 bg-slab text-ship transition hover:bg-ship/10 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="h-7 w-7" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <span className="font-mono text-xs text-dim" aria-hidden>
            <kbd className="rounded border border-edge px-1">←</kbd> git rm
          </span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => swipe("like")}
            disabled={disabled || deck.length === 0}
            aria-label="Like this hacker (right arrow)"
            className="grid h-20 w-20 place-items-center rounded-full bg-hi text-ink shadow-lg shadow-hi/20 transition hover:brightness-95 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            <HeartIcon className="h-9 w-9" />
          </button>
          <span className="font-mono text-xs text-dim" aria-hidden>
            git merge <kbd className="rounded border border-edge px-1">→</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
