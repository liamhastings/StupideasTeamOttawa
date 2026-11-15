// GET /api/likes?userId= -> { profile: Profile; compat: Compat }[]
// Who liked me that I haven't swiped on yet (Ian's "Likes you" tab). Best match first.
// Not in the original contract: Ian's matches/_lib/api.ts proposed it, this implements it.
import { NextResponse } from "next/server";
import { score } from "@/lib/scoring";
import { getProfiles, getSwipes } from "@/lib/store";
import { isRetired } from "../swipes/_bots";
import { withSwipeLock } from "../swipes/_lock";

export async function GET(req: Request) {
  const userId = new URL(req.url).searchParams.get("userId")?.trim();
  if (!userId) return NextResponse.json({ error: "Missing userId. Who's checking their admirers?" }, { status: 400 });

  return withSwipeLock(async () => {
    const [profiles, swipes] = await Promise.all([getProfiles(), getSwipes()]);
    const me = profiles.find((p) => p.id === userId);
    if (!me) return NextResponse.json({ error: "No hacker with that id. Go make a profile." }, { status: 404 });

    const iSwiped = new Set(swipes.filter((s) => s.fromId === userId).map((s) => s.toId));
    const admirers = new Set(swipes.filter((s) => s.toId === userId && s.action === "like").map((s) => s.fromId));

    const items = profiles
      .filter((p) => p.id !== userId && admirers.has(p.id) && !iSwiped.has(p.id) && !isRetired(p))
      .map((profile) => ({ profile, compat: score(me, profile) }))
      .sort((a, b) => b.compat.score - a.compat.score || a.profile.id.localeCompare(b.profile.id));
    return NextResponse.json(items);
  });
}
