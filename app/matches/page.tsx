"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { fetchMatches, listMessages, type ChatMessage, type MatchItem } from "./_lib/api";
import { useUserId } from "./_lib/useUserId";

type Row = MatchItem & { last?: ChatMessage };

export default function MatchesPage() {
  const userId = useUserId();
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchMatches(userId).then(async (items) => {
      const withLast = await Promise.all(
        items.map(async (it) => ({ ...it, last: (await listMessages(it.match.id)).at(-1) })),
      );
      setRows(withLast);
    });
  }, [userId]);

  if (userId === null)
    return <div className="px-6 py-24 text-center"><p className="text-dim">Make a badge first. That&apos;s the whole login.</p><Button href="/onboarding" className="mt-6">Create profile</Button></div>;

  if (!rows)
    return (
      <div className="space-y-4 px-4 pt-6" aria-label="Checking who still replies to texts">
        {[0, 1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-slab" />)}
      </div>
    );

  if (rows.length === 0)
    return (
      <div className="px-6 py-24 text-center">
        <p className="text-lg text-dim">No matches yet. Have you tried adding more skills? Or a personality?</p>
        <Button href="/discover" className="mt-6">Keep swiping</Button>
      </div>
    );

  const fresh = rows.filter((r) => !r.last);
  const sorted = [...rows].sort((a, b) => (b.last?.createdAt ?? b.match.createdAt).localeCompare(a.last?.createdAt ?? a.match.createdAt));

  return (
    <div className="pt-5">
      {fresh.length > 0 && (
        <section className="px-4">
          <h2 className="font-display text-lg font-extrabold">New matches</h2>
          <ul className="mt-3 flex gap-4 overflow-x-auto pb-2">
            {fresh.map(({ match, other }) => (
              <li key={match.id} className="shrink-0">
                <Link href={`/matches/${match.id}/chat`} className="flex w-16 flex-col items-center gap-1.5">
                  <Avatar profile={other} size={60} ring />
                  <span className="w-full truncate text-center text-xs">{other.name.split(" ")[0]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h2 className="px-4 font-display text-lg font-extrabold">Messages</h2>
        <ul className="mt-2 divide-y divide-edge">
          {sorted.map(({ match, other, compat, last }) => (
            <li key={match.id}>
              <Link href={`/matches/${match.id}/chat`} className="flex items-center gap-3 px-4 py-3 hover:bg-slab">
                <Avatar profile={other} size={52} />
                <div className="min-w-0 flex-1">
                  <p className="flex items-baseline justify-between gap-2">
                    <b className="truncate">{other.name}</b>
                    <span className="shrink-0 text-xs text-hi">{compat.score}% fit</span>
                  </p>
                  <p className={`truncate text-sm ${last ? "text-dim" : "italic text-dim"}`}>
                    {last ? last.text : "Say hi. Be normal about it."}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
