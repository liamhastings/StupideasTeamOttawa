# Grinder — shared context (read before doing anything)

PROJECT: Grinder — a parody "dating" app for hackathons. It's a stupid-ideas hackathon, so humor is a feature. It is NOT about romance or attraction. Hackers swipe on each other to find potential TEAMMATES, based on style (e.g. "Linux god", "matcha enjoyer", "sleeps under the desk") and skills (e.g. "great at public speaking", "7 hackathons deep", "can design in Figma"). Hinge-style: profiles have short prompts and personality. We only handle MATCHING. Once matched, teammates merge teams on their own (we just reveal a contact handle).

STACK: Next.js (App Router) + TypeScript + Tailwind. No auth service: a user "signs in" by creating a profile; their id is stored in localStorage under "grinder_user_id". Persistence lives behind lib/store.ts (JSON file at data/db.json locally; keep it swappable). Keep everything simple and demo-ready. Prioritize a working, funny demo over polish or edge cases.

TEAM: Liam, Kailen, Ian. Three people, three Claude Code terminals, three branches, working simultaneously. ZERO FILE OVERLAP is the top rule.

BRANCHES:
- liam/foundation-profiles
- kailen/discover-matching
- ian/landing-matches-polish
Never commit directly to main except Liam's Step 0 scaffold. Commit small, push often, open PRs to main, and rebase on main before opening a PR.

## STRICT RULES FOR CLAUDE CODE
1. Only create or edit files in YOUR owned paths (listed in your role block). If you need a change in someone else's file, STOP and tell the user so they can ask that teammate. Don't edit it yourself.
2. Do not install new dependencies, reformat the repo, rename shared files, or touch package.json/tailwind config unless it's your owned file. If you need a dep, tell the user first.
3. Code against the CONTRACT below exactly. If the contract looks wrong, tell the user instead of changing it.
4. Until a teammate's piece lands, use the stubs/fixtures from Step 0 so you're never blocked.
5. Keep the humor: copy should be funny and hacker-flavored (loading text, empty states, buttons, errors).

## CONTRACT (owned by Liam, lives in lib/types.ts; do not edit)

    Profile {
      id: string
      name: string
      handle: string            // Discord/Telegram etc., only revealed after match
      avatarEmoji: string
      avatarUrl?: string        // small round avatar (usually photos[0]). Render via components/ui/Avatar, which falls back to initials.
      photos?: string[]         // up to 3 big Hinge-style pictures; ProfileCard shows them full-width between prompts.
      tagline: string
      bio: string
      styleTags: string[]       // from lib/tags.ts STYLE_TAGS
      skillTags: string[]       // from lib/tags.ts SKILL_TAGS
      hackathonCount: number
      lookingFor: string[]      // skill tags they want in a teammate
      prompts: { question: string; answer: string }[]   // Hinge-style, max 3
      createdAt: string
    }
    Swipe { fromId: string; toId: string; action: "like" | "pass" }
    Match { id: string; userAId: string; userBId: string; score: number; createdAt: string }
    Compat { score: number /*0-100*/; reasons: string[] }   // e.g. "You need a designer. They ARE a designer."

API ROUTES (JSON):
    GET  /api/profiles                 -> Profile[]                          [Liam]
    POST /api/profiles                 -> Profile (create)                   [Liam]
    GET  /api/profiles/[id]            -> Profile                            [Liam]
    PUT  /api/profiles/[id]            -> Profile (edit own profile)         [Liam, extra]
    GET  /api/discover?userId=         -> { profile: Profile; compat: Compat }[]   unswiped, best match first   [Kailen]
    POST /api/swipes   body: Swipe     -> { matched: boolean; match?: Match }      mutual like creates a Match   [Kailen]
    GET  /api/matches?userId=          -> { match: Match; other: Profile; compat: Compat }[]   [Kailen]

SHARED UI CONTRACT:
`components/profile/ProfileCard.tsx` (Liam) — props: `{ profile: Profile; compat?: Compat; compact?: boolean }`. Kailen's swipe deck and Ian's matches list both render it. Don't rebuild it.

STORE HELPERS (lib/store.ts, server-side only, Liam): getProfiles, getProfile, createProfile, updateProfile, getSwipes, addSwipe, getMatches, addMatch. Need more? Ask Liam. Client session helpers in lib/session.ts: getUserId, setUserId, clearUserId. Tags/prompt questions/avatar emojis: lib/tags.ts. data/db.json is gitignored and auto-seeded from data/seed.ts.

## FILE OWNERSHIP
    app/page.tsx, app/layout.tsx, app/globals.css            -> Ian
    app/onboarding/, app/profile/                             -> Liam
    app/discover/                                             -> Kailen
    app/matches/                                              -> Ian
    app/api/profiles/**                                       -> Liam
    app/api/discover/, app/api/swipes/, app/api/matches/      -> Kailen
    components/profile/**                                     -> Liam
    components/swipe/**                                       -> Kailen
    components/ui/**, components/layout/**                    -> Ian
    lib/types.ts, tags.ts, store.ts, session.ts, validate.ts, data/**  -> Liam
    lib/scoring.ts                                            -> Kailen
    README.md, deployment config                              -> Ian

## ROLES
- LIAM (liam/foundation-profiles): profiles API, onboarding (multi-step Hinge-style form -> POST profile -> setUserId -> /discover), /profile view+edit, ProfileCard polish, funny seed data. Does not touch discover, swipes, matches, landing, layout.
- KAILEN (kailen/discover-matching): lib/scoring.ts score(a,b): Compat (weighted: b's skills cover a's lookingFor, mutual bonus, shared style tags, hackathon-experience mix; 1-3 funny reasons), real /api/discover, /api/swipes, /api/matches, /discover swipe deck (framer-motion drag, buttons, arrow keys, empty state "Touch grass."), "IT'S A MATCH!" overlay. Does not touch profiles, onboarding, landing, layout, matches pages.
- IAN (ian/landing-matches-polish): brand/theme/dark hacker-dating vibe, components/ui (Button, Chip, Modal, Navbar, Toast), landing page, navbar, /matches list + /matches/[id] with contact reveal + copy + "Go merge your teams!", extras (Grinder Gold joke paywall, 404, skeletons, README, deploy). Does not touch profiles, discover, swipes, scoring, api.

MERGE ORDER: Liam's scaffold -> everyone branches. PRs to main as pieces finish; rebase before PRs. Final 30 minutes: all merge, run the full flow (onboard -> swipe -> match -> contact reveal), fix bugs, record the demo.
