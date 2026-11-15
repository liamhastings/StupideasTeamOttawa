// CONTRACT — owned by Liam. Do not edit without asking.

export interface Profile {
  id: string;
  name: string;
  handle: string; // Discord/Telegram etc., only revealed after match
  avatarEmoji: string;
  avatarUrl?: string; // optional picture: uploaded JPEG data URL, or SVG data URL for seed profiles; falls back to avatarEmoji
  tagline: string;
  bio: string;
  styleTags: string[]; // from lib/tags.ts STYLE_TAGS
  skillTags: string[]; // from lib/tags.ts SKILL_TAGS
  hackathonCount: number;
  lookingFor: string[]; // skill tags they want in a teammate
  prompts: { question: string; answer: string }[]; // Hinge-style, max 3
  createdAt: string;
}

export interface Swipe {
  fromId: string;
  toId: string;
  action: "like" | "pass";
}

export interface Match {
  id: string;
  userAId: string;
  userBId: string;
  score: number;
  createdAt: string;
}

export interface Compat {
  score: number; // 0-100
  reasons: string[]; // e.g. "You need a designer. They ARE a designer."
}

export interface DB {
  profiles: Profile[];
  swipes: Swipe[];
  matches: Match[];
}
