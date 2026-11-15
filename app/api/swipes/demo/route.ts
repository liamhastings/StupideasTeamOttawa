// DEMO HELPER: POST /api/swipes/demo  body: { userId: string; count?: number }
// Rigs the game: the top-scored profiles in your deck "already liked you", so the
// next like you send them is an instant match. Lives entirely in my folder and only
// uses the store's addSwipe (no seed edits). Disabled in production unless GRINDER_DEMO=1.
import { NextResponse } from "next/server";
import { addSwipe, getProfiles, getSwipes } from "@/lib/store";
import { score } from "@/lib/scoring";
import { withSwipeLock } from "../_lock";

export async function POST(req: Request) {
  if (process.env.NODE_ENV === "production" && process.env.GRINDER_DEMO !== "1") {
    return NextResponse.json({ error: "Rigging elections is illegal in production. Set GRINDER_DEMO=1 if you must." }, { status: 403 });
  }
  let b: Record<string, unknown> = {};
  try {
    const parsed = await req.json();
    if (parsed && typeof parsed === "object") b = parsed as Record<string, unknown>;
  } catch {
    /* empty body is fine, we'll complain about userId below */
  }
  const userId = typeof b.userId === "string" ? b.userId.trim() : "";
  if (!userId) return NextResponse.json({ error: "Missing userId. Who are we rigging this for?" }, { status: 400 });
  const n = Number(b.count);
  const count = Number.isFinite(n) ? Math.max(1, Math.min(10, Math.floor(n))) : 3;

  return withSwipeLock(async () => {
    const [profiles, swipes] = await Promise.all([getProfiles(), getSwipes()]);
    const me = profiles.find((p) => p.id === userId);
    if (!me) return NextResponse.json({ error: "No hacker with that id. Go make a profile." }, { status: 404 });

    // Candidates still in your deck (you haven't swiped on them), best match first.
    const swiped = new Set(swipes.filter((s) => s.fromId === userId).map((s) => s.toId));
    const picks = profiles
      .filter((p) => p.id !== userId && !swiped.has(p.id))
      .map((p) => ({ p, s: score(me, p).score }))
      .sort((x, y) => y.s - x.s || x.p.id.localeCompare(y.p.id))
      .slice(0, count)
      .map((x) => x.p);

    for (const p of picks) await addSwipe({ fromId: p.id, toId: userId, action: "like" });
    return NextResponse.json({
      rigged: picks.map((p) => ({ id: p.id, name: p.name })),
      message: picks.length
        ? `${picks.length} hackers already like you. Swipe right on them for instant chemistry.`
        : "Nobody left in your deck to rig. You've swiped on everyone. Touch grass.",
    });
  });
}
