// POST /api/swipes  body: Swipe -> { matched: boolean; match?: Match }
// Persists the swipe. A "like" that's already liked back creates a Match.
// Idempotent: addSwipe upserts per (from,to) and addMatch dedupes pairs; the lock
// stops a double-click race from slipping two matches in.
import { NextResponse } from "next/server";
import { addMatch, addSwipe, getMatches, getProfiles, getSwipes } from "@/lib/store";
import { score } from "@/lib/scoring";
import type { Swipe } from "@/lib/types";
import { withSwipeLock } from "./_lock";

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return bad("That body isn't JSON. Did you pipe /dev/urandom into fetch?");
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return bad("Send a swipe object, not vibes. Expected { fromId, toId, action }.");
  }
  const b = body as Record<string, unknown>;
  const fromId = typeof b.fromId === "string" ? b.fromId.trim() : "";
  const toId = typeof b.toId === "string" ? b.toId.trim() : "";
  if (!fromId) return bad("Missing fromId. Who is swiping? Ghosts can't swipe.");
  if (!toId) return bad("Missing toId. You swiped on nobody. Bold, but no.");
  if (b.action !== "like" && b.action !== "pass") {
    return bad('action must be "like" or "pass". There is no "it\'s complicated".');
  }
  if (fromId === toId) return bad("You can't swipe on yourself. Narcissism is not a teammate skill.");
  const swipe: Swipe = { fromId, toId, action: b.action };

  return withSwipeLock(async () => {
    try {
      const profiles = await getProfiles();
      const me = profiles.find((p) => p.id === fromId);
      const them = profiles.find((p) => p.id === toId);
      if (!me) return bad("No hacker with that fromId. Did someone rm -rf the database? Go make a profile.", 404);
      if (!them) return bad("That hacker doesn't exist. They've been garbage collected.", 404);

      await addSwipe(swipe);
      if (swipe.action !== "like") return NextResponse.json({ matched: false });

      // A match that already exists wins (e.g. someone passed after matching): keep the
      // swipe response consistent with what /api/matches shows.
      const existing = (await getMatches()).find(
        (m) => (m.userAId === fromId && m.userBId === toId) || (m.userAId === toId && m.userBId === fromId),
      );
      if (existing) return NextResponse.json({ matched: true, match: existing });

      const swipes = await getSwipes();
      const likedBack = swipes.some((s) => s.fromId === toId && s.toId === fromId && s.action === "like");
      if (!likedBack) return NextResponse.json({ matched: false });

      // Symmetric score for the match record: average of both viewpoints.
      const matchScore = Math.round((score(me, them).score + score(them, me).score) / 2);
      const match = await addMatch({ userAId: fromId, userBId: toId, score: matchScore });
      return NextResponse.json({ matched: true, match });
    } catch {
      return bad("The swipe server tripped over its own shoelaces. Try again in a sec.", 500);
    }
  });
}
