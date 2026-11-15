"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import ProfileCard from "@/components/profile/ProfileCard";
import type { DeckItem, SwipeAction } from "./types";

const FLING_DISTANCE = 110; // px dragged before a release counts as a swipe
const FLING_VELOCITY = 600; // px/s flick that counts even if the drag was short

interface SwipeCardProps {
  item: DeckItem;
  /** 0 = top of the deck (draggable), 1+ = peeking underneath. */
  index: number;
  /** +1 = exits to the right (like), -1 = to the left (pass). */
  exitDir: number;
  onSwipe: (action: SwipeAction) => void;
}

// Exit variant: the card flies off with a spin. `custom` carries the direction so a
// card removed by a button or arrow key still flies the right way.
const variants = {
  exit: (dir: number) => ({
    x: dir * 700,
    rotate: dir * 28,
    opacity: 0,
    transition: { duration: 0.35, ease: "easeIn" as const },
  }),
};

export default function SwipeCard({ item, index, exitDir, onSwipe }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 0, 250], [-18, 0, 18]);
  const likeOpacity = useTransform(x, [30, 130], [0, 1]);
  const passOpacity = useTransform(x, [-130, -30], [1, 0]);
  const isTop = index === 0;

  return (
    <motion.div
      className={`relative col-start-1 row-start-1 select-none ${isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"}`}
      style={isTop ? { x, rotate, zIndex: 10 } : { zIndex: 10 - index }}
      drag={isTop ? "x" : false}
      dragSnapToOrigin
      dragElastic={0.85}
      onDragEnd={(_, info) => {
        if (info.offset.x > FLING_DISTANCE || info.velocity.x > FLING_VELOCITY) onSwipe("like");
        else if (info.offset.x < -FLING_DISTANCE || info.velocity.x < -FLING_VELOCITY) onSwipe("pass");
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
        // Cards underneath are just a peeking edge. No content, so no text bleeding through,
        // and h-full makes them as tall as the top card (the grid cell is sized by it).
        <div className="h-full min-h-24 rounded-2xl border border-white/10 bg-neutral-800" />
      )}
      {isTop && (
        <>
          <motion.div
            aria-hidden
            style={{ opacity: likeOpacity }}
            className="pointer-events-none absolute left-4 top-4 -rotate-12 rounded-lg border-4 border-emerald-400 bg-black/40 px-3 py-1 font-mono text-2xl font-black tracking-widest text-emerald-400"
          >
            LGTM ✅
          </motion.div>
          <motion.div
            aria-hidden
            style={{ opacity: passOpacity }}
            className="pointer-events-none absolute right-4 top-4 rotate-12 rounded-lg border-4 border-rose-500 bg-black/40 px-3 py-1 font-mono text-2xl font-black tracking-widest text-rose-500"
          >
            WONTFIX ❌
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
