"use client";

import { animate, motion, useIsPresent, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import UiAvatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import type { Match } from "@/lib/types";
import type { DeckItem } from "./types";

export interface MatchOverlayProps {
  /** The card you just swiped right on (its compat is scored from your side). */
  item: DeckItem;
  /** The match record (for the chat link). */
  match: Match;
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
      <UiAvatar emoji={emoji} size={96} ring />
      <span className="max-w-[7rem] truncate text-xs font-semibold text-snow">{label}</span>
    </motion.div>
  );
}

export default function MatchOverlay({ item, match, me, onClose }: MatchOverlayProps) {
  const reduceMotion = useReducedMotion();
  // While the exit animation plays the overlay is still mounted: ignore input so a double-click
  // or held Escape can't close the NEXT queued match too.
  const isPresent = useIsPresent();
  const presentRef = useRef(true);
  const [confetti] = useState(makeConfetti);
  const [shownScore, setShownScore] = useState(0);
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
    dialogRef.current?.querySelector<HTMLElement>('a[href="/matches"]')?.focus({ preventScroll: true }); // keep the title in view // "Go to Matches"
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
      className={`fixed inset-0 z-50 flex justify-center overflow-y-auto overscroll-contain bg-floor/90 px-4 py-6 backdrop-blur-sm ${isPresent ? "" : "pointer-events-none"}`}
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
          className="rounded-xl bg-hi px-5 py-2 font-display text-4xl font-black uppercase leading-none tracking-tight text-ink shadow-[0_0_60px_rgba(255,225,77,0.35)] sm:text-5xl"
        >
          It&apos;s a match!
        </motion.h2>

        <p className="max-w-full break-all font-mono text-sm text-ok">
          <span className="text-dim">$</span> git merge {profile.name.split(" ")[0].toLowerCase().replace(/[^a-z0-9]/g, "") || "teammate"}
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
          {/* Same "laptop sticker" as Ian's BadgeTile fit score, just enormous. */}
          <div
            className="rotate-3 rounded-xl border-2 border-hi bg-ink px-5 py-2 font-display text-5xl font-black text-hi"
            role="img"
            aria-label={`${compat.score} percent fit`}
          >
            <span aria-hidden>{shownScore}% fit</span>
          </div>
        </div>

        <ul className="w-full space-y-2">
          {compat.reasons.map((r, i) => (
            <motion.li
              key={`${i}-${r}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.25 }}
              className="flex gap-2 rounded-xl border border-edge bg-slab px-3 py-2 text-left text-sm text-snow"
            >
              <span className="font-mono text-ok" aria-hidden>✓</span>
              <span>{r}</span>
            </motion.li>
          ))}
        </ul>

        <p className="text-sm text-dim">
          Merge request approved, 0 conflicts. {profile.name.trim().split(" ")[0] || "Your new teammate"}&apos;s handle is unlocked.{" "}
          <Link href={`/matches/${match.id}/chat`} className="font-semibold text-hi underline-offset-2 hover:underline">
            Say hi in chat →
          </Link>
        </p>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button href="/matches" className="flex-1 text-base uppercase">
            Go to Matches
          </Button>
          <Button variant="ghost" onClick={onClose} className="flex-1 text-base">
            Keep swiping
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
