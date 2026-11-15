// GET /api/discover?userId= -> { profile: Profile; compat: Compat }[]
// Everyone except you and people you've already swiped on, best match first.
import { NextResponse } from "next/server";
import { getProfiles, getSwipes } from "@/lib/store";
import { score } from "@/lib/scoring";
import { isRetired } from "../swipes/_bots";
import { withSwipeLock } from "../swipes/_lock";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId")?.trim();
  if (!userId) {
    return NextResponse.json(
      { error: "Missing ?userId=. We can't find your soulmates anonymously. Go make a profile, ghost." },
      { status: 400 },
    );
  }

  // Read under the swipe lock so we never read db.json mid-write (see _lock.ts).
  const [profiles, swipes] = await withSwipeLock(() => Promise.all([getProfiles(), getSwipes()]));
  const me = profiles.find((p) => p.id === userId);
  if (!me) {
    return NextResponse.json(
      { error: "No hacker with that id. Did someone rm -rf the database? Go make a profile." },
      { status: 404 },
    );
  }

  const swiped = new Set(swipes.filter((s) => s.fromId === userId).map((s) => s.toId));
  const deck = profiles
    .filter((p) => p.id !== userId && !swiped.has(p.id) && !isRetired(p))
    .map((profile) => ({ profile, compat: score(me, profile) }))
    // Stable tiebreak on id so the deck order doesn't shuffle between refreshes.
    .sort((x, y) => y.compat.score - x.compat.score || x.profile.id.localeCompare(y.profile.id));
  return NextResponse.json(deck);
}
