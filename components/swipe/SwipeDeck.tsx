"use client";

import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { MergeIcon, XIcon } from "@/components/ui/Icons";
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

const GLYPHS = {
  like: ["✓", "+1", "✓", "<3", "✓", "+1", "✓", "LGTM"],
  pass: ["×", "rm", "×", "404", "×", "nah", "×", "null"],
};

// One-shot celebration (or funeral) when a swipe is committed, whether by drag, button or key.
function Burst({ dir }: { dir: 1 | -1 }) {
  const like = dir === 1;
  const [bits] = useState(() =>
    GLYPHS[like ? "like" : "pass"].map((g) => {
      const angle = ((Math.random() - 0.5) * 100 + (like ? 0 : 180)) * (Math.PI / 180);
      const dist = 140 + Math.random() * 180;
      return { g, x: Math.cos(angle) * dist, y: Math.sin(angle) * dist + (like ? -30 : 60), r: (Math.random() - 0.5) * 120, s: 0.9 + Math.random() * 0.9 };
    }),
  );
  const tone = like ? "text-ok" : "text-ship";
  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden" aria-hidden>
      {/* Screen-edge flash on the side the card left from */}
      <motion.div
        className={`absolute inset-y-0 w-2/3 ${like ? "right-0 bg-gradient-to-l from-ok/50" : "left-0 bg-gradient-to-r from-ship/50"} to-transparent`}
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      />
      {/* The verdict, stamped like a sticker on a laptop lid */}
      <motion.div
        className={`absolute left-1/2 top-[34%] -translate-x-1/2 rounded-2xl border-4 bg-floor/90 px-5 py-2 font-display text-3xl font-black ${like ? "border-ok" : "border-ship"} ${tone}`}
        initial={{ scale: 2.2, rotate: like ? -22 : 22, opacity: 0 }}
        animate={{ scale: 1, rotate: like ? -8 : 8, opacity: [0, 1, 1, 0], y: [0, 0, 0, -24] }}
        transition={{ duration: 0.8, times: [0, 0.18, 0.7, 1], ease: "easeOut" }}
      >
        {like ? "Merged!" : "Deleted."}
      </motion.div>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className={`absolute left-1/2 top-[44%] font-display font-black ${tone}`}
          style={{ fontSize: 18 * b.s }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: b.x, y: b.y, opacity: 0, rotate: b.r }}
          transition={{ duration: 0.7 + b.s * 0.2, ease: "easeOut" }}
        >
          {b.g}
        </motion.span>
      ))}
    </div>
  );
}

export default function SwipeDeck({ deck, onSwipe, disabled = false }: SwipeDeckProps) {
  const reduceMotion = useReducedMotion();
  const [exitDir, setExitDir] = useState(1);
  const [burst, setBurst] = useState<{ id: number; dir: 1 | -1 } | null>(null);
  const lastSwipeAt = useRef(0);

  // Live drag offset of the top card: the screen edges glow in proportion to it.
  const dragX = useMotionValue(0);
  const rightGlow = useTransform(dragX, [0, 160], [0, 1]);
  const leftGlow = useTransform(dragX, [-160, 0], [1, 0]);

  const swipe = useCallback(
    (action: SwipeAction) => {
      const top = deck[0];
      if (!top || disabled) return;
      const now = Date.now();
      if (now - lastSwipeAt.current < COOLDOWN_MS) return;
      lastSwipeAt.current = now;
      const dir = action === "like" ? 1 : -1;
      setExitDir(dir);
      if (!reduceMotion) {
        setBurst({ id: now, dir });
        try { navigator.vibrate?.(action === "like" ? [12, 40, 12] : 14); } catch {}
      }
      animate(dragX, 0, { duration: 0.3 });
      onSwipe(top, action);
    },
    [deck, disabled, onSwipe, reduceMotion, dragX],
  );

  // The burst clears itself.
  useEffect(() => {
    if (!burst) return;
    const t = setTimeout(() => setBurst(null), 1000);
    return () => clearTimeout(t);
  }, [burst]);

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
  const off = disabled || deck.length === 0;

  return (
    <div className="flex w-full flex-col items-center gap-6">
      {!reduceMotion && (
        <>
          <motion.div aria-hidden style={{ opacity: leftGlow }} className="pointer-events-none fixed inset-y-0 left-0 z-20 w-1/3 bg-gradient-to-r from-ship/40 to-transparent" />
          <motion.div aria-hidden style={{ opacity: rightGlow }} className="pointer-events-none fixed inset-y-0 right-0 z-20 w-1/3 bg-gradient-to-l from-ok/40 to-transparent" />
          {burst && <Burst key={burst.id} dir={burst.dir} />}
        </>
      )}

      {/* Every card sits in the same grid cell, so the stack is as tall as the tallest card. */}
      <div className="grid w-full grid-cols-1">
        <AnimatePresence custom={exitDir}>
          {visible.map((item, i) => (
            <SwipeCard key={item.profile.id} item={item} index={i} exitDir={exitDir} onSwipe={swipe} onDragX={(v) => dragX.set(v)} />
          ))}
        </AnimatePresence>
      </div>

      {/* Sticky just above the fixed TabBar (~4.25rem) so the buttons are never hidden on short phones. */}
      <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 -mb-6 flex w-[calc(100%+2rem)] items-end justify-center gap-8 bg-gradient-to-t from-floor via-floor/90 to-transparent px-4 pb-3 pt-10">
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => swipe("pass")}
            disabled={off}
            aria-label="Pass on this hacker (left arrow)"
            className="grid h-16 w-16 place-items-center rounded-full border-2 border-ship bg-floor text-ship shadow-lg shadow-black/50 transition hover:bg-ship/10 active:scale-90 disabled:pointer-events-none disabled:opacity-40"
          >
            <XIcon className="h-8 w-8" />
          </button>
          <span className="hidden text-xs text-dim sm:block" aria-hidden>← git rm</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => swipe("like")}
            disabled={off}
            aria-label="Like this hacker (right arrow)"
            className="grid h-20 w-20 place-items-center rounded-full bg-hi text-ink shadow-lg shadow-hi/20 transition hover:brightness-95 active:scale-90 disabled:pointer-events-none disabled:opacity-40"
          >
            <MergeIcon className="h-9 w-9" />
          </button>
          <span className="hidden text-xs text-dim sm:block" aria-hidden>git merge →</span>
        </div>
      </div>
    </div>
  );
}
