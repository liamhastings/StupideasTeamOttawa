// Profile input validation (owned by Liam, used by /api/profiles routes).
import type { Profile } from "./types";

export type ProfileInput = Omit<Profile, "id" | "createdAt">;

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const strArr = (v: unknown, maxItems: number, maxLen = 60) =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === "string").map((x) => x.trim().slice(0, maxLen)).filter(Boolean).slice(0, maxItems)
    : [];

export function validateProfileInput(
  body: unknown,
): { ok: true; value: ProfileInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Send a profile, not vibes." };
  const b = body as Record<string, unknown>;
  const name = str(b.name, 60);
  const handle = str(b.handle, 60);
  if (!name) return { ok: false, error: "You need a name. Even 'xX_h4ck3r_Xx' counts." };
  if (!handle) return { ok: false, error: "No contact handle? How will we spam you?" };
  const prompts = (Array.isArray(b.prompts) ? b.prompts : [])
    .map((p) => ({
      question: str((p as Record<string, unknown>)?.question, 120),
      answer: str((p as Record<string, unknown>)?.answer, 280),
    }))
    .filter((p) => p.question && p.answer)
    .slice(0, 3);
  const count = Number(b.hackathonCount);
  return {
    ok: true,
    value: {
      name,
      handle,
      avatarEmoji: str(b.avatarEmoji, 8) || "🧑‍💻",
      tagline: str(b.tagline, 120),
      bio: str(b.bio, 400),
      styleTags: strArr(b.styleTags, 12),
      skillTags: strArr(b.skillTags, 12),
      hackathonCount: Number.isFinite(count) ? Math.max(0, Math.min(999, Math.floor(count))) : 0,
      lookingFor: strArr(b.lookingFor, 12),
      prompts,
    },
  };
}
