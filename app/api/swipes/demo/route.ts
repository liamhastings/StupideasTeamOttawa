// DEMO HELPER: POST /api/swipes/demo  body: { userId: string; count?: number }
// Rigs the game: the top-scored profiles in your deck "already liked you", so the
// next like you send them is an instant match. Lives entirely in my folder and only
// uses the store's addSwipe (no seed edits). Disabled in production unless GRINDER_DEMO=1.
import { NextResponse } from "next/server";
import { addSwipe, getProfiles, getSwipes } from "@/lib/store";
import { score } from "@/lib/scoring";
import { ensureBots, isBot } from "../_bots";
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
    await ensureBots(); // the two demo characters exist from now on
    const [profiles, swipes] = await Promise.all([getProfiles(), getSwipes()]);
    const me = profiles.find((p) => p.id === userId);
    if (!me) return NextResponse.json({ error: "No hacker with that id. Go make a profile." }, { status: 404 });

    // Candidates still in your deck (you haven't swiped on them), best match first.
    // Only seed profiles do the rigging (real users' swipes are never forged), and
    // anyone who already passed on you keeps that pass.
    const swiped = new Set(swipes.filter((s) => s.fromId === userId).map((s) => s.toId));
    const passedOnMe = new Set(swipes.filter((s) => s.toId === userId && s.action === "pass").map((s) => s.fromId));
    const featuredCount = profiles.filter((p) => isBot(p) && p.id !== userId && !swiped.has(p.id) && !passedOnMe.has(p.id)).length;
    const picks = profiles
      .filter((p) => (p.id.startsWith("seed_") || isBot(p)) && p.id !== userId && !swiped.has(p.id) && !passedOnMe.has(p.id))
      .map((p) => ({ p, s: score(me, p).score }))
      // Demo characters first (they're the chat stars), then the best-scoring seeds.
      .sort((x, y) => Number(isBot(y.p)) - Number(isBot(x.p)) || y.s - x.s || x.p.id.localeCompare(y.p.id))
      // Featured characters (Agent Sleeper, Sam, Jensen, Jet) always make the cut, plus the best seeds up to `count`.
      .slice(0, Math.max(count, featuredCount))
      .map((x) => x.p);

    for (const p of picks) await addSwipe({ fromId: p.id, toId: userId, action: "like" });
    return NextResponse.json({
      rigged: picks.map((p) => ({ id: p.id, name: p.name })),
      message: picks.length
        ? `${picks.length} hacker${picks.length === 1 ? "" : "s"} already ${picks.length === 1 ? "likes" : "like"} you. Swipe right for instant chemistry.`
        : "Nobody left in your deck to rig. You've swiped on everyone. Touch grass.",
    });
  });
}
