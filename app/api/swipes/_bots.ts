// Two fictional demo characters for the chat demo. Created on demand (idempotent, by
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
      name: "Leather Jacket Larry",
      handle: "@leather_jacket_larry",
      avatarEmoji: "🧥",
      tagline: "The more you merge, the more you save.",
      bio: "Keynote veteran. Will announce your teammate in 4K at 120fps. Owns more GPUs than friends.",
      styleTags: ["demo-day gambler", "ships on vibes", "stickers on laptop: 47"],
      skillTags: ["great at public speaking", "hardware / IoT", "ML / AI", "pitch deck artist"],
      hackathonCount: 12,
      lookingFor: ["can design in Figma", "project manager"],
      prompts: [
        { question: "My hot take is…", answer: "Every problem is a GPU problem." },
        { question: "My biggest red flag is…", answer: "I will say 'one more thing' at 3am." },
      ],
    },
    replies: [
      "The more you merge, the more you save.",
      "Our team has 12,000 cores and zero design skills. Merge?",
      "One more thing... I need snacks.",
      "Impressive stack. But is it 4K at 120fps?",
      "I'd merge teams, but only if we pitch it like a keynote.",
    ],
  },
  {
    profile: {
      name: "Agent Sleeper",
      handle: "@agent_sleeper",
      avatarEmoji: "🕵️",
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

/** Canned replies if this profile is a demo character, else undefined. */
export function botReplies(p: Pick<Profile, "handle"> | undefined): string[] | undefined {
  return p ? BOTS.find((b) => b.profile.handle === p.handle)?.replies : undefined;
}

export const isBot = (p: Pick<Profile, "handle"> | undefined) => !!botReplies(p);
