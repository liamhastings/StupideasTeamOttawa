// Compatibility scoring. Pure function, no I/O. Owned by Kailen.
//
// score(a, b): how good is b as a teammate FOR a? (Asymmetric on purpose.)
//   45%  b's skillTags cover a's lookingFor
//   20%  mutual: a's skillTags cover b's lookingFor
//   20%  shared styleTags
//   15%  hackathon experience mix (veteran + newbie = best, two newbies = worst)
import type { Compat, Profile } from "./types";

const W = { need: 0.45, mutual: 0.2, style: 0.2, exp: 0.15 } as const;

// Human-sounding nouns for SKILL_TAGS so reasons read "You need a designer"
// instead of "You need a can design in Figma". Unknown tags fall back to the raw tag.
const ROLE: Record<string, string> = {
  "great at public speaking": "a public speaker",
  "can design in Figma": "a designer",
  "frontend wizard": "a frontend wizard",
  "backend brain": "a backend brain",
  "full-stack goblin": "a full-stack goblin",
  "ML / AI": "an ML person",
  "data wrangler": "a data wrangler",
  "mobile dev": "a mobile dev",
  "hardware / IoT": "a hardware hacker",
  "devops / deploys": "a devops person",
  "pitch deck artist": "a pitch deck artist",
  "video / demo editor": "a video editor",
  "UX researcher": "a UX researcher",
  "project manager": "a project manager",
  "security / hacking": "a security nerd",
  "game dev": "a game dev",
  "blockchain (sorry)": "a blockchain person (sorry)",
  "API duct-taper": "an API duct-taper",
  "database whisperer": "a database whisperer",
  "CSS sorcerer": "a CSS sorcerer",
  "prompt engineer": "a prompt engineer",
  "copywriter / jokes": "a copywriter",
  "7 hackathons deep": "a hackathon veteran",
  "business / idea guy (with receipts)": "an idea guy (with receipts)",
  "AR / VR": "an AR/VR person",
  "embedded C": "an embedded C survivor",
  "Rust evangelist": "a Rust evangelist",
  "Python for everything": "a Python-for-everything person",
  "TypeScript purist": "a TypeScript purist",
  "can run on 2 hours of sleep": "a 2-hours-of-sleep machine",
};
const norm = (t: string) => t.trim().toLowerCase();
const ROLE_N = new Map(Object.entries(ROLE).map(([k, v]) => [norm(k), v]));
const role = (tag: string) => ROLE_N.get(norm(tag)) ?? `someone who's "${tag.trim()}"`;
const hn = (n: number) => `${n} hackathon${n === 1 ? "" : "s"}`;

function overlap(wanted: string[], offered: string[]) {
  const have = new Set(offered.map(norm));
  const uniq = [...new Map(wanted.map((w) => [norm(w), w] as const)).values()];
  const hits = uniq.filter((w) => have.has(norm(w)));
  return { hits, ratio: uniq.length ? hits.length / uniq.length : 0 };
}

// Bad form data (NaN, negative, Infinity) must not poison the score or the jokes.
const cleanCount = (n: number) => (Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0);

function experience(ha: number, hb: number) {
  const diff = Math.abs(ha - hb);
  let s = Math.min(diff, 6) / 6; // veteran + newbie => ~1
  if (Math.max(ha, hb) <= 1) s = 0.05; // two newbies => rough
  else if (Math.min(ha, hb) >= 3) s = Math.max(s, 0.5); // two vets => solid, not magical
  return s;
}

// Deterministic pick so reasons don't flicker between renders/requests.
function pick<T>(arr: readonly T[], seed: string): T {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return arr[h % arr.length];
}

const FALLBACKS = [
  "Statistically, you two have nothing in common. Statistically, so do most co-founders.",
  "Compatibility: 404. But chaos builds great demos.",
  "On paper this is a merge conflict. In practice, free pizza is free pizza.",
  "Zero overlap detected. Opposites attract, or at least don't fight over the same tickets.",
  "Your tech stacks don't match. Your desperation for a teammate probably does.",
] as const;

const FATE = [
  (t: string) => `You both said "${t}". This is fate.`,
  (t: string) => `Two "${t}" people in one team. Either soulmates or a bug report.`,
  (t: string) => `"${t}" on both profiles. The algorithm blushes.`,
] as const;

// Style tags that are famously at war.
const CLASHES: [string, string, string][] = [
  ["tabs over spaces", "spaces over tabs", "Tabs vs spaces. This will end in a war crime, but a productive one."],
  ["dark mode only", "light mode psychopath", "Dark mode vs light mode. One of you will need sunglasses."],
];

function clash(a: Profile, b: Profile): string | undefined {
  const as = new Set(a.styleTags.map(norm));
  const bs = new Set(b.styleTags.map(norm));
  for (const [x, y, line] of CLASHES) {
    if ((as.has(x) && bs.has(y)) || (as.has(y) && bs.has(x))) return line;
  }
}

export function score(a: Profile, b: Profile): Compat {
  const need = overlap(a.lookingFor, b.skillTags); // b covers a's needs
  const mutual = overlap(b.lookingFor, a.skillTags); // a covers b's needs
  const shared = overlap(a.styleTags, b.styleTags).hits;
  const styleRatio = Math.min(
    1,
    shared.length / Math.max(1, Math.min(a.styleTags.length, b.styleTags.length)),
  );
  const ha = cleanCount(a.hackathonCount);
  const hb = cleanCount(b.hackathonCount);
  const exp = experience(ha, hb);

  const raw =
    W.need * need.ratio + W.mutual * mutual.ratio + W.style * styleRatio + W.exp * exp;
  // Raw sums rarely top ~0.75 because tags must match exactly, so stretch with a
  // gentle monotonic curve (ranking unchanged) to use more of the 0-100 range.
  const curved = Math.round(100 * Math.pow(raw / 0.85, 0.7));
  const total = Number.isFinite(curved) ? Math.max(0, Math.min(100, curved)) : 0;

  const reasons: string[] = [];
  if (need.hits.length) {
    const r = role(need.hits[0]);
    reasons.push(
      need.hits.length > 1
        ? `You need ${r} (and ${need.hits.length - 1} more). They have the whole shopping list.`
        : `You need ${r}. They ARE ${r}.`,
    );
  }
  if (mutual.hits.length) {
    reasons.push(`They need ${role(mutual.hits[0])}. You literally are one. Mutual codependency!`);
  }
  if (shared.length) {
    reasons.push(pick(FATE, a.id + b.id)(shared[0]));
  }
  // Tag-specific jokes outrank the numeric experience line when slots run out.
  const war = clash(a, b);
  if (war) reasons.push(war);
  const lo = Math.min(ha, hb);
  const hi = Math.max(ha, hb);
  if (hi - lo >= 4) {
    reasons.push(`${hn(hi)} + ${hn(lo)} = mentorship arc.`);
  } else if (hi <= 1) {
    reasons.push(`${hn(hi)} + ${hn(lo)} = two rookies, zero fear.`);
  }

  if (reasons.length === 0) reasons.push(pick(FALLBACKS, a.id + b.id));
  return { score: total, reasons: reasons.slice(0, 3) };
}

// Sweaty level: how cracked is this hacker, 1-10. Pure, derived from existing profile data
// (no contract change). Experience sets the base; sweaty tags push it up, grass pulls it down.
const SWEATY = new Set(
  [
    "sleeps under the desk",
    "energy drink IV drip",
    "no sleep, only deploy",
    "commits at 4am",
    "works best at 3am",
    "can run on 2 hours of sleep",
    "7 hackathons deep",
    "Linux god",
    "Arch btw",
    "vim exit-code survivor",
    "mechanical keyboard cultist",
    "git push --force enjoyer",
    "cold-brew dependent",
    "headphones permanently on",
  ].map(norm),
);
const GRASSY = new Set(["touches grass (allegedly)", "plans everything, builds nothing", "reads the docs (rare)"].map(norm));

export function sweatLevel(p: Profile): number {
  const tags = [...(p.styleTags ?? []), ...(p.skillTags ?? [])].map(norm);
  const sweaty = new Set(tags.filter((t) => SWEATY.has(t))).size;
  const grassy = new Set(tags.filter((t) => GRASSY.has(t))).size;
  const base = 1 + Math.min(4, Math.log2(1 + cleanCount(p.hackathonCount)) * 1.4); // 0 events = 1, 10+ = ~5
  return Math.max(1, Math.min(10, Math.round(base + sweaty * 1.2 - grassy)));
}
