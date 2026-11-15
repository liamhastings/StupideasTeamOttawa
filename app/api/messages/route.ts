// Match chat. Not in the original contract, so this is a new route nobody else owns.
//   GET  /api/messages?matchId=  -> ChatMessage[]  (oldest first)
//   POST /api/messages {matchId, fromId, text} -> ChatMessage
// Real messages between two real hackers just work. If the other side is a seed
// profile (id "seed_..."), they answer with a canned line a moment later, so the
// demo never has an awkwardly silent chat. Storage is its own JSON file in the OS
// temp dir: not db.json, not store.ts, never committed.
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import { getMatches } from "@/lib/store";
import { withSwipeLock } from "../swipes/_lock";

interface ChatMessage {
  id: string;
  matchId: string;
  fromId: string;
  text: string;
  createdAt: string;
}

const FILE = path.join(os.tmpdir(), "grinder-messages.json");
const MAX_LEN = 500;
const REPLIES = [
  "Sounds good. What's your stack?",
  "I have 3 energy drinks and no plan. Merge?",
  "Table 14, by the outlets. Bring snacks.",
  "Wait, can you actually design? Because I can't.",
  "Say less. Meet at the vending machine.",
  "I'm in. I haven't slept since Thursday, so my judgment is excellent.",
];

async function readAll(): Promise<ChatMessage[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return []; // no file yet (or a torn write): start empty, it's only chat
  }
}

async function writeAll(all: ChatMessage[]) {
  const tmp = `${FILE}.${process.pid}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(all), "utf8");
  await fs.rename(tmp, FILE); // atomic swap so a reader never sees half a file
}

const err = (message: string, status: number) => NextResponse.json({ error: message }, { status });

export async function GET(req: Request) {
  const matchId = new URL(req.url).searchParams.get("matchId");
  if (!matchId) return err("matchId is required. Who are you even talking to?", 400);
  const now = Date.now();
  const all = await withSwipeLock(readAll);
  // Canned replies are stamped slightly in the future so they "arrive" after a typing delay.
  return NextResponse.json(all.filter((m) => m.matchId === matchId && Date.parse(m.createdAt) <= now).slice(-200));
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("That wasn't JSON. Try typing in the box.", 400);
  }
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const { matchId, fromId } = b;
  const text = typeof b.text === "string" ? b.text.trim().slice(0, MAX_LEN) : "";
  if (typeof matchId !== "string" || typeof fromId !== "string" || !matchId || !fromId) {
    return err("matchId and fromId are required.", 400);
  }
  if (!text) return err("Empty messages are for ghosts.", 400);

  const match = (await getMatches()).find((m) => m.id === matchId);
  if (!match) return err("No such match. Did you two break up already?", 404);
  if (fromId !== match.userAId && fromId !== match.userBId) {
    return err("You are not in this match. Nice try.", 403);
  }

  const now = Date.now();
  const msg: ChatMessage = {
    id: crypto.randomUUID(),
    matchId,
    fromId,
    text,
    createdAt: new Date(now).toISOString(),
  };
  const otherId = fromId === match.userAId ? match.userBId : match.userAId;

  try {
    await withSwipeLock(async () => {
      const all = await readAll();
      all.push(msg);
      // Seed hackers answer humans (never each other, never themselves).
      if (otherId.startsWith("seed_") && !fromId.startsWith("seed_")) {
        all.push({
          id: crypto.randomUUID(),
          matchId,
          fromId: otherId,
          text: REPLIES[Math.floor(Math.random() * REPLIES.length)],
          createdAt: new Date(now + 1200 + Math.random() * 1000).toISOString(),
        });
      }
      await writeAll(all.slice(-2000));
    });
  } catch {
    return err("The message got lost in the mail. Try again.", 500);
  }
  return NextResponse.json(msg);
}
