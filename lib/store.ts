// Persistence layer. Server-side only.
//
// Locally: JSON file at data/db.json (gitignored).
// On Vercel: the project folder is read-only, so we keep the DB in memory and
// mirror it to /tmp (writable, but per-instance and wiped on cold start).
// Good enough for a demo; swap readDB/writeDB for a real database later.
//
// Seed profiles always come from data/seed.ts (ids start with "seed_"), so
// editing the seed file shows up without deleting db.json.
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import type { DB, Match, Profile, Swipe } from "./types";
import { SEED_PROFILES } from "../data/seed";

const DB_PATH = process.env.VERCEL
  ? path.join(os.tmpdir(), "grinder-db.json")
  : path.join(process.cwd(), "data", "db.json");

let memory: DB | null = null;

function withFreshSeeds(db: DB): DB {
  return {
    ...db,
    profiles: [...SEED_PROFILES, ...db.profiles.filter((p) => !p.id.startsWith("seed_"))],
  };
}

async function readDB(): Promise<DB> {
  if (memory) return memory;
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    memory = withFreshSeeds(JSON.parse(raw) as DB);
  } catch {
    memory = { profiles: [...SEED_PROFILES], swipes: [], matches: [] };
  }
  return memory;
}

async function writeDB(db: DB): Promise<void> {
  memory = db;
  try {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (err) {
    // Read-only disk: keep going from memory rather than 500ing the demo.
    console.warn("[store] could not persist db, using memory only:", (err as Error).message);
  }
}

function newId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

// ---- profiles ----
export async function getProfiles(): Promise<Profile[]> {
  return (await readDB()).profiles;
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  return (await readDB()).profiles.find((p) => p.id === id);
}

export async function createProfile(input: Omit<Profile, "id" | "createdAt">): Promise<Profile> {
  const db = await readDB();
  const profile: Profile = { ...input, id: newId("u"), createdAt: new Date().toISOString() };
  db.profiles.push(profile);
  await writeDB(db);
  return profile;
}

export async function updateProfile(
  id: string,
  patch: Partial<Omit<Profile, "id" | "createdAt">>,
): Promise<Profile | undefined> {
  const db = await readDB();
  const i = db.profiles.findIndex((p) => p.id === id);
  if (i === -1) return undefined;
  db.profiles[i] = { ...db.profiles[i], ...patch };
  await writeDB(db);
  return db.profiles[i];
}

// ---- swipes ----
export async function getSwipes(): Promise<Swipe[]> {
  return (await readDB()).swipes;
}

export async function addSwipe(swipe: Swipe): Promise<void> {
  const db = await readDB();
  db.swipes = db.swipes.filter((s) => !(s.fromId === swipe.fromId && s.toId === swipe.toId));
  db.swipes.push(swipe);
  await writeDB(db);
}

// ---- matches ----
export async function getMatches(): Promise<Match[]> {
  return (await readDB()).matches;
}

export async function addMatch(input: Omit<Match, "id" | "createdAt">): Promise<Match> {
  const db = await readDB();
  const existing = db.matches.find(
    (m) =>
      (m.userAId === input.userAId && m.userBId === input.userBId) ||
      (m.userAId === input.userBId && m.userBId === input.userAId),
  );
  if (existing) return existing;
  const match: Match = { ...input, id: newId("m"), createdAt: new Date().toISOString() };
  db.matches.push(match);
  await writeDB(db);
  return match;
}
