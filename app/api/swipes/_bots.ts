// A fictional demo character (Agent Sleeper) for the chat demo. Created on demand (idempotent, by
// handle) through the store's own createProfile, so there is nothing to seed by hand and
// it works on every machine. Their canned replies live here and are used by /api/messages.
import { createProfile, getProfiles } from "@/lib/store";
import type { Profile } from "@/lib/types";

interface Bot {
  profile: Omit<Profile, "id" | "createdAt">;
  replies: string[];
}

const BOTS: Bot[] = [
  {
    profile: {
      name: "Agent Sleeper",
      handle: "@agent_sleeper",
      avatarEmoji: "",
      tagline: "Definitely just here for the free pizza.",
      bio: "Wears a trench coat indoors. Asks very normal questions about your repo. Totally normal.",
      styleTags: ["pizza-fueled", "headphones permanently on", "works best at 3am"],
      skillTags: ["security / hacking", "backend brain", "devops / deploys", "can run on 2 hours of sleep"],
      hackathonCount: 5,
      lookingFor: ["frontend wizard", "UX researcher"],
      prompts: [
        { question: "My most cursed commit message is…", answer: "fix: nothing to see here" },
        { question: "At 3am you'll find me…", answer: "Reading your source code. For fun." },
      ],
    },
    replies: [
      "Interesting. And who else knows about your project?",
      "Meet me by the vending machine. Come alone. Bring pizza.",
      "I am simply a normal hacker. Do not look at my notes.",
      "Table 14. The password is 'tabs'.",
      "Don't mention this chat to the judges.",
    ],
  },
];

/** Create the demo characters if they don't exist yet. Call inside withSwipeLock. */
export async function ensureBots(): Promise<Profile[]> {
  const all = await getProfiles();
  const out: Profile[] = [];
  for (const b of BOTS) {
    const found = all.find((p) => p.handle === b.profile.handle);
    out.push(found ?? (await createProfile(b.profile)));
  }
  return out;
}

// Lines for every featured demo character (the one created above plus Sam and Jensen, who are
// hardcoded in data/seed.ts). Keyed by handle. `openers` is how they start the chat after you
// match; `replies` is how they answer you.
const LINES: Record<string, { openers: string[]; replies: string[] }> = {
  "@agent_sleeper": {
    openers: ["Hello, fellow hacker. I am also a hacker. Normal.", "Nice to meet you. Do not ask what is in the trench coat."],
    replies: BOTS[0].replies,
  },
  "@sam_ships_it": {
    openers: ["Great to match. I have a 12-slide deck and no code. Merge?", "I'll do the pitch, you do the part where it works."],
    replies: [
      "Love it. Let's call it a platform.",
      "I can have the demo story ready in ten minutes. The demo itself, less so.",
      "Disrupting. Whatever it is, we're disrupting it.",
      "Deal. I'll bring the energy drinks and the slides.",
      "Say less. Pre-revenue, post-snacks.",
    ],
  },
  "@jensen_more_gpus": {
    openers: ["Thanks for the match. Quick question: how many GPUs can you spare?", "I brought a leather jacket and an entire rack of GPUs. Merge?"],
    replies: [
      "The more you merge, the more you train.",
      "We'll ship a model by morning. And a keynote by 3am.",
      "One more thing: I need a frontend. And snacks.",
      "My laptop has 47 stickers and zero RAM left. Let's merge.",
      "Your idea needs more GPUs. Everything does.",
    ],
  },
};

const lines = (p: Pick<Profile, "handle"> | undefined) => (p ? LINES[p.handle] : undefined);

/** Canned replies if this profile is a demo character, else undefined. */
export const botReplies = (p: Pick<Profile, "handle"> | undefined) => lines(p)?.replies;
/** How a demo character opens the chat after a match, else undefined. */
export const botOpeners = (p: Pick<Profile, "handle"> | undefined) => lines(p)?.openers;
/** True for every featured demo character (rigged to like you in demo mode). */
export const isBot = (p: Pick<Profile, "handle"> | undefined) => !!lines(p);

/** Characters we removed. They may still sit in someone's local db.json, so hide them everywhere. */
const RETIRED = new Set(["@leather_jacket_larry"]);
export const isRetired = (p: Pick<Profile, "handle"> | undefined) => !!p && RETIRED.has(p.handle);
