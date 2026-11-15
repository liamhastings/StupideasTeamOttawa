import type { Compat, Match, Profile } from "@/lib/types";
import { FIXTURE_LIKES, FIXTURE_MATCHES } from "./fixtures";

export type MatchItem = { match: Match; other: Profile; compat: Compat };
export type LikeItem = { profile: Profile; compat: Compat };
export type ChatMessage = { id: string; matchId: string; fromId: string; text: string; createdAt: string };

async function getJson<T>(url: string, fallback: () => T): Promise<T> {
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(String(r.status));
    return (await r.json()) as T;
  } catch {
    return fallback();
  }
}

/** CONTRACT: GET /api/matches?userId= */
export const fetchMatches = (userId: string) =>
  getJson<MatchItem[]>(`/api/matches?userId=${encodeURIComponent(userId)}`, () => FIXTURE_MATCHES);

/** CONTRACT: GET /api/profiles/[id]. Used only for my own avatar in the match modal. */
export const fetchProfile = (id: string) => getJson<Profile | null>(`/api/profiles/${encodeURIComponent(id)}`, () => null);

/** PROPOSED (needs Kailen): GET /api/likes?userId= -> { profile, compat }[] of people who liked me that I haven't swiped on. */
export const fetchLikes = (userId: string) =>
  getJson<LikeItem[]>(`/api/likes?userId=${encodeURIComponent(userId)}`, () => FIXTURE_LIKES);

/** CONTRACT: POST /api/swipes. Accept = "like" (their like + mine = Match). Decline = "pass". */
export async function sendSwipe(fromId: string, toId: string, action: "like" | "pass"): Promise<{ matched: boolean; match?: Match }> {
  try {
    const r = await fetch("/api/swipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fromId, toId, action }),
    });
    if (!r.ok) throw new Error();
    return await r.json();
  } catch {
    return { matched: action === "like" };
  }
}

/* ---------- Chat ----------
 * PROPOSED (needs a teammate): GET /api/messages?matchId=  and  POST /api/messages { matchId, fromId, text }.
 * Until it exists, messages live in localStorage (one browser only) and the other hacker sends canned replies. */
const lsKey = (matchId: string) => `grinder_chat_${matchId}`;
const readLocal = (matchId: string): ChatMessage[] => {
  try { return JSON.parse(localStorage.getItem(lsKey(matchId)) || "[]"); } catch { return []; }
};

export const listMessages = (matchId: string) =>
  getJson<ChatMessage[]>(`/api/messages?matchId=${encodeURIComponent(matchId)}`, () => readLocal(matchId));

export function appendLocalMessage(matchId: string, fromId: string, text: string) {
  const msg: ChatMessage = { id: crypto.randomUUID(), matchId, fromId, text, createdAt: new Date().toISOString() };
  try { localStorage.setItem(lsKey(matchId), JSON.stringify([...readLocal(matchId), msg])); } catch {}
}

/** Returns which backend took the message, so the UI knows whether to fake a reply. */
export async function sendMessage(matchId: string, fromId: string, text: string): Promise<"api" | "local"> {
  try {
    const r = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId, fromId, text }),
    });
    if (!r.ok) throw new Error();
    return "api";
  } catch {
    appendLocalMessage(matchId, fromId, text);
    return "local";
  }
}
