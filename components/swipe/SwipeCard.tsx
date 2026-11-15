"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import ProfileCard from "@/components/profile/ProfileCard";
import type { DeckItem, SwipeAction } from "./types";

const FLING_DISTANCE = 110; // px dragged before a release counts as a swipe
const MIN_FLICK_OFFSET = 30; // px
const FLING_VELOCITY = 600; // px/s flick that counts even if the drag was short

interface SwipeCardProps {
  item: DeckItem;
  /** 0 = top of the deck (draggable), 1+ = peeking underneath. */
  index: number;
  /** +1 = exits to the right (like), -1 = to the left (pass). */
  exitDir: number;
  onSwipe: (action: SwipeAction) => void;
  /** Reports the live drag offset so the deck can glow the screen edges. */
  onDragX?: (x: number) => void;
}

// Like: the card is launched up and away. Pass: it gets dropped in the bin.
// `custom` carries the direction so a card removed by a button or arrow key still exits correctly.
const variants = {
  exit: (dir: number) => ({
    x: dir * 720,
    y: dir > 0 ? -70 : 200,
    rotate: dir * (dir > 0 ? 22 : 34),
    scale: dir > 0 ? 1.04 : 0.9,
    opacity: 0,
    transition: { duration: dir > 0 ? 0.38 : 0.42, ease: "easeIn" as const },
  }),
};

export default function SwipeCard({ item, index, exitDir, onSwipe, onDragX }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [20, 130], [0, 1]);
  const passOpacity = useTransform(x, [-130, -20], [1, 0]);
  const likeScale = useTransform(x, [20, 130], [0.6, 1.1]);
  const passScale = useTransform(x, [-130, -20], [1.1, 0.6]);
  const isTop = index === 0;

  return (
    <motion.div
      className={`relative col-start-1 row-start-1 select-none text-snow ${isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
      style={isTop ? { x, rotate, zIndex: 10 } : { zIndex: 10 - index }}
      drag={isTop ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.85}
      onDrag={(_, info) => onDragX?.(info.offset.x)}
      onDragEnd={(_, info) => {
        // A flick counts only if it also moved a little (a twitchy 3px nudge isn't a decision).
        const flick = Math.abs(info.offset.x) > MIN_FLICK_OFFSET;
        if (info.offset.x > FLING_DISTANCE || (flick && info.velocity.x > FLING_VELOCITY)) onSwipe("like");
        else if (info.offset.x < -FLING_DISTANCE || (flick && info.velocity.x < -FLING_VELOCITY)) onSwipe("pass");
        else onDragX?.(0);
      }}
      initial={{ scale: 1 - index * 0.05, y: index * 14, opacity: 0 }}
      animate={{ scale: 1 - index * 0.05, y: index * 14, opacity: 1 }}
      exit="exit"
      variants={variants}
      custom={exitDir}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      aria-hidden={!isTop}
    >
      {isTop ? (
        <ProfileCard profile={item.profile} compat={item.compat} />
      ) : (
        // Cards underneath are just a peeking edge: no content, so no text bleeding through.
        <div className="h-full min-h-24 rounded-3xl border border-edge bg-slab" />
      )}
      {isTop && (
        <>
          {/* The whole card lights up in the color of your decision as you drag. */}
          <motion.div
            aria-hidden
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute inset-0 rounded-3xl ring-4 ring-ok shadow-[0_0_48px_rgba(61,220,151,0.35)]"
          />
          <motion.div
            aria-hidden
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute inset-0 rounded-3xl ring-4 ring-ship shadow-[0_0_48px_rgba(255,90,60,0.35)]"
          />
          <motion.div
            aria-hidden
            style={{ opacity: likeOpacity, scale: likeScale }}
            className="pointer-events-none absolute left-5 top-5 -rotate-12 rounded-xl border-4 border-ok bg-floor/85 px-3 py-1 font-display text-2xl font-black text-ok"
          >
            LGTM
          </motion.div>
          <motion.div
            aria-hidden
            style={{ opacity: passOpacity, scale: passScale }}
            className="pointer-events-none absolute right-5 top-5 rotate-12 rounded-xl border-4 border-ship bg-floor/85 px-3 py-1 font-display text-2xl font-black text-ship"
          >
            WONTFIX
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
