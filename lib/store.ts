// Persistence layer. Server-side only. JSON file at data/db.json for now;
// swap the readDB/writeDB pair to move to a real database.
import { promises as fs } from "fs";
import path from "path";
import type { DB, Match, Profile, Swipe } from "./types";
import { SEED_PROFILES } from "../data/seed";

const DB_PATH = path.join(process.cwd(), "data", "db.json");

async function readDB(): Promise<DB> {
  try {
    const raw = await fs.readFile(DB_PATH, "utf8");
    return JSON.parse(raw) as DB;
  } catch {
    const fresh: DB = { profiles: SEED_PROFILES, swipes: [], matches: [] };
    await writeDB(fresh);
    return fresh;
  }
}

async function writeDB(db: DB): Promise<void> {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
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

export async function createProfile(
  input: Omit<Profile, "id" | "createdAt">,
): Promise<Profile> {
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
