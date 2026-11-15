"use client";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import Button from "@/components/ui/Button";
import { BackIcon, CopyIcon } from "@/components/ui/Icons";
import { useToast } from "@/components/ui/Toast";
import { fetchMatches, type MatchItem } from "../_lib/api";
import { useUserId } from "../_lib/useUserId";

export default function MatchDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = useUserId();
  const { push } = useToast();
  const [item, setItem] = useState<MatchItem | null | undefined>(undefined);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (userId) fetchMatches(userId).then((all) => setItem(all.find((m) => m.match.id === id) ?? null));
  }, [userId, id]);

  if (item === undefined) return <div className="m-4 h-96 animate-pulse rounded-2xl bg-slab" aria-label="Loading their red flags" />;
  if (item === null)
    return (
      <div className="px-6 py-24 text-center">
        <p className="text-dim">No such match. Maybe they unmatched. Maybe they never existed.</p>
        <Button href="/matches" className="mt-6">Back to matches</Button>
      </div>
    );

  const { other, compat } = item;
  const copy = async () => {
    try { await navigator.clipboard.writeText(other.handle); } catch {}
    push("Handle copied. Go forth and merge.");
  };

  return (
    <div className="space-y-5 px-4 pt-4">
      <Link href="/matches" className="inline-flex items-center gap-1 text-sm text-dim hover:text-snow">
        <BackIcon className="h-4 w-4" /> Matches
      </Link>

      <ProfileCard profile={other} compat={compat} />

      <section className="rounded-2xl border border-edge bg-slab p-5">
        <h2 className="font-display text-lg font-extrabold">Contact</h2>
        {revealed ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-floor px-4 py-3">
            <code className="truncate text-lg text-hi">{other.handle}</code>
            <button onClick={copy} className="flex items-center gap-1.5 text-sm font-semibold text-snow" aria-label="Copy handle">
              <CopyIcon className="h-4 w-4" /> Copy
            </button>
          </div>
        ) : (
          <Button variant="ghost" className="mt-3 w-full" onClick={() => setRevealed(true)}>Reveal their handle</Button>
        )}
        <Button
          className="mt-3 w-full"
          onClick={() => { setRevealed(true); copy(); }}
        >
          Go merge your teams!
        </Button>
        <p className="mt-3 text-xs text-dim">We only do the matching. Team names, git history and snacks are on you.</p>
      </section>

      <Button href={`/matches/${id}/chat`} variant="ghost" className="w-full">Chat with {other.name.split(" ")[0]} first</Button>
    </div>
  );
}
