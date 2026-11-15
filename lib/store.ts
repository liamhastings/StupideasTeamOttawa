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
import { DRAWN_PROFILES, SEED_MATCHES, SEED_PROFILES, SEED_SWIPES } from "../data/seed";

// The real/featured cast plus the drawn demo hackers, so Discover has everyone.
const ALL_SEEDS = [...SEED_PROFILES, ...DRAWN_PROFILES.filter((d) => !SEED_PROFILES.some((p) => p.id === d.id))];

const DB_PATH = process.env.VERCEL
  ? path.join(os.tmpdir(), "grinder-db.json")
  : path.join(process.cwd(), "data", "db.json");

// Cache lives on globalThis: Next can load this module once per route bundle, and
// every route must see the same data (same trick as app/api/swipes/_lock.ts).
const KEY = "__grinder_db__";
type G = typeof globalThis & { [KEY]?: DB };
const g = globalThis as G;

const isSeed = (id: string) => id.startsWith("seed_") || id.startsWith("demo_");

// Seed profiles come from data/seed.ts (unless edited in the app, then the edit
// wins). Seed swipes/matches are added if missing, so the demo always starts with
// them in place.
function withFreshSeeds(db: DB): DB {
  const edited = new Set(db.editedSeeds ?? []);
  const kept = db.profiles.filter((p) => !isSeed(p.id) || edited.has(p.id));
  const keptIds = new Set(kept.map((p) => p.id));
  const swipes = [...db.swipes];
  for (const s of SEED_SWIPES)
    if (!swipes.some((x) => x.fromId === s.fromId && x.toId === s.toId)) swipes.push(s);
  const matches = [...db.matches];
  for (const m of SEED_MATCHES) if (!matches.some((x) => x.id === m.id)) matches.push(m);
  return {
    ...db,
    profiles: [...ALL_SEEDS.filter((p) => !keptIds.has(p.id)), ...kept],
    swipes,
    matches,
  };
}

async function readDB(): Promise<DB> {
  if (!g[KEY]) {
    let db: DB;
    try {
      db = JSON.parse(await fs.readFile(DB_PATH, "utf8")) as DB;
    } catch {
      db = { profiles: [], swipes: [], matches: [] };
    }
    g[KEY] ??= db; // another request may have loaded it while we awaited
  }
  // Re-apply data/seed.ts on every read so seed edits show up after a save, even
  // though the cache outlives hot reloads. 10 profiles, so this is free.
  g[KEY] = withFreshSeeds(g[KEY]);
  return g[KEY];
}

async function writeDB(db: DB): Promise<void> {
  g[KEY] = db;
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
  if (isSeed(id) && !db.editedSeeds?.includes(id)) db.editedSeeds = [...(db.editedSeeds ?? []), id];
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
