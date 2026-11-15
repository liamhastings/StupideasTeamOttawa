"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import SwipeDeck from "@/components/swipe/SwipeDeck";
import { EmptyState, ErrorState, LoadingState } from "@/components/swipe/States";
import type { DeckItem, SwipeAction } from "@/components/swipe/types";
import { clearUserId, getUserId } from "@/lib/session";
import type { Match } from "@/lib/types";

type Phase = "loading" | "ready" | "error";

async function readJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
const errorText = (body: unknown, fallback: string) =>
  body && typeof body === "object" && "error" in body && typeof body.error === "string" ? body.error : fallback;

export default function DiscoverPage() {
  const router = useRouter();
  // Not state: it never changes after mount and must not trigger renders.
  const userIdRef = useRef<string | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [deck, setDeck] = useState<DeckItem[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  // Step 5 placeholder: step 6 swaps this banner for the full "IT'S A MATCH!" overlay.
  const [justMatched, setJustMatched] = useState<{ item: DeckItem; match: Match } | null>(null);

  const load = useCallback(
    async (uid: string, demo: boolean) => {
      try {
        if (demo) {
          // /discover?demo=1: rig the top of the deck so the first right-swipes match.
          const rig = await fetch("/api/swipes/demo", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ userId: uid, count: 3 }),
          });
          const rigBody = (await readJson(rig)) as { message?: string } | null;
          if (rig.ok && rigBody?.message) setNotice(`🎲 Demo mode: ${rigBody.message}`);
        }
        const res = await fetch(`/api/discover?userId=${encodeURIComponent(uid)}`, { cache: "no-store" });
        const body = await readJson(res);
        if (res.status === 404) {
          // Stale id in localStorage (db got wiped). Start over.
          clearUserId();
          router.replace("/onboarding");
          return;
        }
        if (!res.ok || !Array.isArray(body)) throw new Error(errorText(body, `HTTP ${res.status}`));
        setDeck(body as DeckItem[]);
        setPhase("ready");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error. The hamsters have unionized.");
        setPhase("error");
      }
    },
    [router],
  );

  useEffect(() => {
    const uid = getUserId();
    if (!uid) {
      router.replace("/onboarding");
      return;
    }
    userIdRef.current = uid;
    const demo = new URLSearchParams(window.location.search).get("demo") === "1";
    // Timer + cleanup: strict mode's double-mount cancels the first run, so we only fetch (and rig) once.
    const t = setTimeout(() => void load(uid, demo), 0);
    return () => clearTimeout(t);
  }, [load, router]);

  const retry = useCallback(() => {
    const uid = userIdRef.current;
    if (!uid) return;
    setPhase("loading");
    setError("");
    void load(uid, false);
  }, [load]);

  const handleSwipe = useCallback(
    async (item: DeckItem, action: SwipeAction) => {
      const userId = userIdRef.current;
      if (!userId) return;
      // Optimistic: the card flies away now, the server catches up.
      setDeck((d) => d.filter((x) => x.profile.id !== item.profile.id));
      setNotice(null);
      try {
        const res = await fetch("/api/swipes", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ fromId: userId, toId: item.profile.id, action }),
        });
        const body = await readJson(res);
        if (res.status === 404) {
          clearUserId();
          router.replace("/onboarding");
          return;
        }
        if (!res.ok) throw new Error(errorText(body, `HTTP ${res.status}`));
        const data = body as { matched?: boolean; match?: Match };
        if (data.matched && data.match) setJustMatched({ item, match: data.match });
      } catch (e) {
        // Put the card back so nobody gets silently ghosted.
        setDeck((d) => (d.some((x) => x.profile.id === item.profile.id) ? d : [item, ...d]));
        setNotice(`Swipe failed (${e instanceof Error ? e.message : "who knows"}). Your card is back. Try again.`);
      }
    },
    [router],
  );

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-4 py-6">
      <header className="mb-4 flex w-full items-baseline justify-between">
        <h1 className="text-2xl font-black tracking-tight">
          Discover <span className="font-mono text-sm font-normal text-neutral-500">{"// teammates.find()"}</span>
        </h1>
        {phase === "ready" && deck.length > 0 && (
          <span className="font-mono text-xs text-neutral-500" aria-live="polite">
            {deck.length} in queue
          </span>
        )}
      </header>

      {notice && (
        <p className="mb-3 w-full rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-center text-sm text-yellow-200" role="status">
          {notice}
        </p>
      )}

      {phase === "loading" && <LoadingState />}
      {phase === "error" && <ErrorState message={error} onRetry={retry} />}
      {phase === "ready" &&
        (deck.length === 0 ? (
          <EmptyState onRefresh={retry} />
        ) : (
          <SwipeDeck deck={deck} onSwipe={handleSwipe} />
        ))}

      {justMatched && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl border border-pink-500 bg-neutral-950 p-4 text-center shadow-2xl">
          <p className="font-black text-pink-400">
            IT&apos;S A MATCH with {justMatched.item.profile.name}! {justMatched.item.profile.avatarEmoji}
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <Link href="/matches" className="rounded-full bg-pink-600 px-4 py-1.5 text-sm font-semibold">
              Go to Matches
            </Link>
            <button type="button" onClick={() => setJustMatched(null)} className="rounded-full border border-white/20 px-4 py-1.5 text-sm">
              Keep swiping
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
