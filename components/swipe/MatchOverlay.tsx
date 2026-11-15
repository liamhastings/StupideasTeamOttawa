"use client";

import { animate, motion, useIsPresent, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { DeckItem } from "./types";

export interface MatchOverlayProps {
  /** The card you just swiped right on (its compat is scored from your side). */
  item: DeckItem;
  /** Your own avatar/name for the left side of the collision. */
  me: { avatarEmoji: string; name: string };
  /** "Keep swiping". Also fired by Escape and by clicking the backdrop. */
  onClose: () => void;
}

const CONFETTI = ["🎉", "🤝", "💻", "☕", "🔥", "🦆", "🍕", "✨", "👾", "🚀", "🧋", "💾"];
const PIECES = 28;

// Built once per overlay mount (lazy state initializer), so renders stay pure.
function makeConfetti() {
  return Array.from({ length: PIECES }, (_, i) => ({
    emoji: CONFETTI[i % CONFETTI.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2.2 + Math.random() * 2,
    size: 18 + Math.random() * 22,
    drift: (Math.random() - 0.5) * 120,
  }));
}

function Avatar({ emoji, label, from }: { emoji: string; label: string; from: number }) {
  return (
    <motion.div
      initial={{ x: from, opacity: 0, rotate: from > 0 ? 25 : -25 }}
      animate={{ x: 0, opacity: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 12, delay: 0.15 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-pink-400 bg-neutral-900 text-5xl shadow-[0_0_40px_rgba(236,72,153,0.6)] sm:h-28 sm:w-28 sm:text-6xl">
        <span aria-hidden>{emoji}</span>
      </div>
      <span className="max-w-[7rem] truncate text-xs font-semibold text-neutral-200">{label}</span>
    </motion.div>
  );
}

export default function MatchOverlay({ item, me, onClose }: MatchOverlayProps) {
  const reduceMotion = useReducedMotion();
  // While the exit animation plays the overlay is still mounted: ignore input so a double-click
  // or held Escape can't close the NEXT queued match too.
  const isPresent = useIsPresent();
  const presentRef = useRef(true);
  const [confetti] = useState(makeConfetti);
  const [shownScore, setShownScore] = useState(0);
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const { profile, compat } = item;

  useEffect(() => {
    onCloseRef.current = onClose;
    presentRef.current = isPresent;
  });

  // Score counts up from 0, because suspense is a feature.
  useEffect(() => {
    const controls = animate(0, compat.score, {
      duration: reduceMotion ? 0 : 1.1,
      delay: 0.5,
      ease: "easeOut",
      onUpdate: (v) => setShownScore(Math.round(v)),
    });
    return () => controls.stop();
  }, [compat.score, reduceMotion]);

  // Focus the primary action, close on Escape, and keep Tab inside the dialog.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null; // read BEFORE we steal focus
    primaryRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (!presentRef.current) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusables = dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])");
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!dialogRef.current.contains(document.activeElement)) {
        // Focus drifted to <body> (clicked plain text): pull it back in.
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previouslyFocused?.isConnected && !(previouslyFocused as HTMLButtonElement).disabled) previouslyFocused.focus();
    };
  }, []);

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex justify-center overflow-y-auto overscroll-contain bg-black/85 px-4 py-6 backdrop-blur-sm ${isPresent ? "" : "pointer-events-none"}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {!reduceMotion && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
          {confetti.map((c, i) => (
            <motion.span
              key={i}
              className="absolute top-0"
              style={{ left: `${c.left}%`, fontSize: c.size }}
              initial={{ y: -60, opacity: 1, rotate: 0 }}
              animate={{ y: "105vh", x: c.drift, opacity: [1, 1, 0.8], rotate: 540 }}
              transition={{ duration: c.duration, delay: c.delay, ease: "easeIn", repeat: Infinity, repeatDelay: 0.4 }}
            >
              {c.emoji}
            </motion.span>
          ))}
        </div>
      )}

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-title"
        className="relative z-10 my-auto flex w-full max-w-md flex-col items-center gap-5 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.h2
          id="match-title"
          initial={{ scale: 0.2, rotate: -12, opacity: 0 }}
          animate={reduceMotion ? { scale: 1, rotate: -3, opacity: 1 } : { scale: [0.2, 1.25, 1], rotate: [-12, 4, -3], opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-gradient-to-r from-pink-500 via-yellow-300 to-emerald-400 bg-clip-text text-5xl font-black uppercase leading-none tracking-tight text-transparent drop-shadow sm:text-6xl"
        >
          It&apos;s a match!
        </motion.h2>

        <p className="max-w-full break-all font-mono text-sm text-emerald-300">
          <span className="text-neutral-500">$</span> git merge {profile.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "teammate"}
          <span className="ml-1 animate-pulse">▍</span>
        </p>

        <div className="flex items-center gap-3">
          <Avatar emoji={me.avatarEmoji} label={me.name} from={-160} />
          <motion.span
            initial={{ scale: 0 }}
            animate={reduceMotion ? { scale: 1 } : { scale: [0, 1.6, 1], rotate: [0, 20, -10, 0] }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="text-4xl"
            aria-hidden
          >
            🤝
          </motion.span>
          <Avatar emoji={profile.avatarEmoji} label={profile.name} from={160} />
        </div>

        <div>
          <div className="font-mono text-6xl font-black text-white" role="img" aria-label={`${compat.score} percent compatible`}>
            <span aria-hidden>{shownScore}%</span>
          </div>
          <div className="text-xs uppercase tracking-widest text-neutral-400">compatibility</div>
        </div>

        <ul className="w-full space-y-2">
          {compat.reasons.map((r, i) => (
            <motion.li
              key={`${i}-${r}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.25 }}
              className="rounded-xl border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-sm italic text-pink-200"
            >
              {r}
            </motion.li>
          ))}
        </ul>

        <p className="text-xs text-neutral-400">
          {profile.name.trim().split(" ")[0] || "Your new teammate"}&apos;s contact handle is unlocked. Go merge your teams!
        </p>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            ref={primaryRef}
            href="/matches"
            className="flex-1 rounded-full bg-gradient-to-r from-pink-600 to-fuchsia-500 px-6 py-3 text-center text-base font-black uppercase tracking-wide text-white shadow-lg shadow-pink-600/40 transition hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Go to Matches
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border-2 border-white/30 px-6 py-3 text-base font-bold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Keep swiping
          </button>
        </div>
      </div>
    </motion.div>
  );
}
