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
      <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-20 -mb-6 flex w-[calc(100%+2rem)] items-center justify-center gap-5 border-t-2 border-[#111] bg-white px-4 py-2 font-mono">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => swipe("pass")}
            disabled={disabled || deck.length === 0}
            aria-label="Pass on this hacker (left arrow)"
            className="border-2 border-[#111] bg-white px-4 py-2 text-base font-black text-[#111] shadow-[3px_3px_0_#111] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-40"
          >
            [ X ]
          </button>
          <span className="hidden text-xs text-neutral-500 sm:inline" aria-hidden>
            <kbd className="border border-neutral-400 px-1">&lt;-</kbd> git rm
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => swipe("like")}
            disabled={disabled || deck.length === 0}
            aria-label="Like this hacker (right arrow)"
            className="border-2 border-[#111] bg-[#111] px-5 py-2 text-base font-black text-white shadow-[3px_3px_0_#888] transition active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-40"
          >
            [ &lt;3 ]
          </button>
          <span className="hidden text-xs text-neutral-500 sm:inline" aria-hidden>
            git merge <kbd className="border border-neutral-400 px-1">-&gt;</kbd>
          </span>
        </div>
      </div>
    </div>
  );
}
