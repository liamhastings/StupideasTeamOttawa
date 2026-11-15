// GET /api/matches?userId= -> { match: Match; other: Profile; compat: Compat }[]  (newest first)
import { NextResponse } from "next/server";
import { getMatches, getProfiles } from "@/lib/store";
import { score } from "@/lib/scoring";
import { isRetired } from "../swipes/_bots";
import { withSwipeLock } from "../swipes/_lock";
import type { Compat, Match, Profile } from "@/lib/types";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId")?.trim();
  if (!userId) {
    return NextResponse.json(
      { error: "Missing ?userId=. We can't find your matches if we don't know who you are. Have you tried onboarding?" },
      { status: 400 },
    );
  }

  // Read under the swipe lock so we never read db.json mid-write (see _lock.ts).
  const [profiles, matches] = await withSwipeLock(() => Promise.all([getProfiles(), getMatches()]));
  const byId = new Map(profiles.map((p) => [p.id, p]));
  const me = byId.get(userId);
  if (!me) {
    return NextResponse.json(
      { error: "No hacker with that id. Did someone rm -rf the database? Go make a profile." },
      { status: 404 },
    );
  }

  const out: { match: Match; other: Profile; compat: Compat }[] = [];
  for (const match of matches) {
    if (match.userAId !== userId && match.userBId !== userId) continue;
    const other = byId.get(match.userAId === userId ? match.userBId : match.userAId);
    if (!other || isRetired(other)) continue; // match with a deleted or retired profile: ghosted
    out.push({ match, other, compat: score(me, other) });
  }
  out.sort((x, y) => Date.parse(y.match.createdAt) - Date.parse(x.match.createdAt));
  return NextResponse.json(out);
}
