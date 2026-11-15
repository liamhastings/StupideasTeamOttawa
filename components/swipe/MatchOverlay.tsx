"use client";

import { animate, motion, useIsPresent, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { initials } from "@/components/ui/Avatar";
import { sweatLevel } from "@/lib/scoring";
import type { Match } from "@/lib/types";
import type { DeckItem } from "./types";

export interface MatchOverlayProps {
  /** The card you just swiped right on (its compat is scored from your side). */
  item: DeckItem;
  /** The match record (for the chat link). */
  match: Match;
  /** Your own avatar/name for the left side of the collision. */
  me: { name: string; avatarUrl?: string };
  /** "Keep swiping". Also fired by Escape and by clicking the backdrop. */
  onClose: () => void;
}

const ART = [" __  __     _     _____   ____  _   _  _ ", "|  \\/  |   / \\   |_   _| / ___|| | | || |", "| |\\/| |  / _ \\    | |  | |    | |_| || |", "| |  | | / ___ \\   | |  | |___ |  _  ||_|", "|_|  |_|/_/   \\_\\  |_|   \\____||_| |_|(_)"];
// ASCII confetti: black and grey on white paper.
const CONFETTI = ["*", "+", "#", "@", "%", "~", "/", "\\", "<3", "0x0", "{}", "&&"];
const PIECES = 26;

// Built once per overlay mount (lazy state initializer), so renders stay pure.
function makeConfetti() {
  return Array.from({ length: PIECES }, (_, i) => ({
    glyph: CONFETTI[i % CONFETTI.length],
    left: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2.2 + Math.random() * 2,
    size: 14 + Math.random() * 14,
    drift: (Math.random() - 0.5) * 120,
    tone: ["text-hi", "text-ok", "text-ship", "text-sky"][i % 4],
  }));
}

// "Dr. Dan Moreau" is Dan, not Dr.
const firstName = (n: string) => n.trim().split(/\s+/).find((w) => !/^(dr|mr|mrs|ms|prof)\.?$/i.test(w)) ?? "";
const meter = (n: number) => "#".repeat(n) + "-".repeat(10 - n);

function Hacker({ name, avatarUrl, from }: { name: string; avatarUrl?: string; from: number }) {
  return (
    <motion.div
      initial={{ x: from, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.15 }}
      className="flex flex-col items-center gap-2"
    >
      <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-slab font-display text-2xl font-black text-hi ring-2 ring-hi ring-offset-2 ring-offset-floor">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          initials(name)
        )}
      </div>
      <span className="max-w-[7rem] truncate text-xs font-bold text-snow">{name}</span>
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
  const sweat = sweatLevel(profile);

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
    dialogRef.current?.querySelector<HTMLElement>('a[href="/matches"]')?.focus({ preventScroll: true }); // "Go to Matches"
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

  const first = firstName(profile.name) || "Your new teammate";

  return (
    <motion.div
      className={`fixed inset-0 z-50 flex justify-center overflow-y-auto overscroll-contain bg-floor/95 px-4 py-6 text-snow backdrop-blur ${isPresent ? "" : "pointer-events-none"}`}
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
              className={`absolute top-0 font-bold ${c.tone}`}
              style={{ left: `${c.left}%`, fontSize: c.size }}
              initial={{ y: -60, opacity: 1, rotate: 0 }}
              animate={{ y: "105vh", x: c.drift, opacity: [1, 1, 0.8], rotate: 360 }}
              transition={{ duration: c.duration, delay: c.delay, ease: "easeIn", repeat: Infinity, repeatDelay: 0.4 }}
            >
              {c.glyph}
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
        <h2 id="match-title" className="sr-only">It&apos;s a match!</h2>
        <motion.pre
          aria-hidden
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="max-w-full overflow-hidden font-mono text-hi text-[9px] font-bold leading-[1.1] sm:text-xs"
        >
          {ART.join("\n")}
        </motion.pre>

        <p className="max-w-full break-all font-mono text-sm">
          <span className="text-dim">$</span> git merge {firstName(profile.name).toLowerCase().replace(/[^a-z0-9]/g, "") || "teammate"}
          <span className="ml-1 animate-pulse">_</span>
        </p>

        <div className="flex items-center gap-3">
          <Hacker name={me.name} avatarUrl={me.avatarUrl} from={-160} />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.55, type: "spring", stiffness: 300, damping: 14 }}
            className="text-2xl font-black"
            aria-hidden
          >
            &lt;=&gt;
          </motion.span>
          <Hacker name={profile.name} avatarUrl={profile.avatarUrl} from={160} />
        </div>

        {/* One boxed readout: how well you fit, how cracked they are, why. */}
        <div className="w-full overflow-hidden rounded-2xl border border-edge bg-slab text-left">
          <div className="border-b border-edge bg-floor px-3 py-2 font-mono text-xs text-dim">
            +-- merge-request.log --+ <span className="text-ok">0 conflicts</span>
          </div>
          <div className="space-y-3 p-4">
            <div className="flex items-end justify-between gap-3">
              <span className="text-xs text-dim">compatibility</span>
              <div role="img" aria-label={`${compat.score} percent fit`} className="font-display text-5xl font-black leading-none text-hi">
                <span aria-hidden>{shownScore}%</span>
              </div>
            </div>
            <div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-dim">sweat level</span>
                <span className="font-bold">{sweat}/10 cracked</span>
              </div>
              <div role="img" aria-label={`Sweat level ${sweat} out of 10`} className="mt-1 font-mono text-lg font-bold tracking-[0.15em] text-hi">
                <span aria-hidden>[{meter(sweat)}]</span>
              </div>
            </div>
            <ul className="space-y-1.5 border-t border-dashed border-edge pt-3 text-sm">
              {compat.reasons.map((r, i) => (
                <motion.li
                  key={`${i}-${r}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + i * 0.25 }}
                  className="flex gap-2"
                >
                  <span className="font-bold text-ok" aria-hidden>&gt;</span>
                  <span>{r}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <p className="text-sm text-dim">
          Merge request approved. {first}&apos;s handle is unlocked.{" "}
          <Link href={`/matches/${match.id}/chat`} className="font-bold text-hi underline underline-offset-2">
            say_hi --chat
          </Link>
        </p>

        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Link
            href="/matches"
            className="flex-1 rounded-full bg-hi px-4 py-3 text-center text-sm font-bold text-ink transition hover:brightness-95"
          >
            Go to Matches
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-full border border-edge px-4 py-3 text-sm font-bold text-snow transition hover:bg-slab"
          >
            Keep swiping
          </button>
        </div>
      </div>
    </motion.div>
  );
}
