// Demo data used ONLY when an endpoint is missing or failing. Never a blank screen.
import type { Compat, Match, Profile } from "@/lib/types";

const mk = (p: Pick<Profile, "id" | "name" | "handle" | "avatarEmoji" | "tagline"> & Partial<Profile>): Profile => ({
  bio: "Will mass-refactor your code if provoked.",
  styleTags: ["matcha enjoyer", "sleeps under the desk"],
  skillTags: ["can design in Figma"],
  hackathonCount: 3,
  lookingFor: ["great at public speaking"],
  prompts: [{ question: "My hot take is…", answer: "Tabs. Obviously tabs." }],
  createdAt: "2026-11-15T09:00:00.000Z",
  ...p,
});

export const FIXTURE_PROFILES: Profile[] = [
  mk({ id: "fx1", name: "Priya", handle: "@priya_ships", avatarEmoji: "🧋", tagline: "Figma sorceress, 7 hackathons deep" }),
  mk({ id: "fx2", name: "Dmitri", handle: "dmitri#0420", avatarEmoji: "🐧", tagline: "I use Arch, btw", hackathonCount: 9 }),
  mk({ id: "fx3", name: "Sam", handle: "@sam_pitches", avatarEmoji: "🎤", tagline: "Can sell a to-do app to a monk" }),
  mk({ id: "fx4", name: "Aiko", handle: "@aiko_ml", avatarEmoji: "🤖", tagline: "My model works on my machine" }),
  mk({ id: "fx5", name: "Marcus", handle: "marcus#1337", avatarEmoji: "🥤", tagline: "Energy drink IV drip, frontend wizard" }),
  mk({ id: "fx6", name: "Noor", handle: "@noor_devops", avatarEmoji: "🛠️", tagline: "I deploy on Fridays. Fear me." }),
];

const c = (score: number, reasons: string[]): Compat => ({ score, reasons });

export const FIXTURE_LIKES: { profile: Profile; compat: Compat }[] = [
  { profile: FIXTURE_PROFILES[0], compat: c(91, ["You need a designer. She IS a designer.", "You both said matcha. This is fate."]) },
  { profile: FIXTURE_PROFILES[1], compat: c(74, ["He has 9 hackathons. You have trauma. Balanced."]) },
  { profile: FIXTURE_PROFILES[3], compat: c(82, ["You need ML. Her model works on her machine, which is a start."]) },
  { profile: FIXTURE_PROFILES[4], compat: c(68, ["Frontend wizard meets backend goblin. Classic."]) },
];

export const FIXTURE_MATCHES: { match: Match; other: Profile; compat: Compat }[] = [
  { match: { id: "fm1", userAId: "me", userBId: "fx3", score: 83, createdAt: "2026-11-15T10:00:00.000Z" }, other: FIXTURE_PROFILES[2], compat: c(83, ["You need a pitcher. They pitch in their sleep."]) },
  { match: { id: "fm2", userAId: "me", userBId: "fx6", score: 77, createdAt: "2026-11-15T10:30:00.000Z" }, other: FIXTURE_PROFILES[5], compat: c(77, ["You need devops. They deploy on Fridays. Brave."]) },
];
