"use client";
import Countdown from "@/components/layout/Countdown";
import Logo from "@/components/layout/Logo";
import Avatar from "@/components/ui/Avatar";
import BadgeTile from "@/components/ui/BadgeTile";
import Button from "@/components/ui/Button";
import { useUserId } from "./matches/_lib/useUserId";

const sample = [
  {
    id: "l1",
    name: "Dev 'sudo' Patel",
    tagline: "I use Arch btw. Please don't ask.",
  },
  {
    id: "l2",
    name: "Priya",
    tagline: "Figma sorceress. 7 hackathons deep.",
  },
  {
    id: "l3",
    name: "Sam",
    tagline: "Can pitch a to-do app to a monk.",
  },
];

const log = [
  { ok: true, t: "4,213 swipes today" },
  { ok: false, t: "NOT a dating app" },
  { ok: true, t: "guaranteed no larpers" },
  { ok: true, t: "looking for someone to commit to" },
  { ok: true, t: "hot grinders within your area" },
  { ok: true, t: "local developers looking for commitment" },
];

const reviews = [
  {
    who: "Maya",
    verdict: "Approved",
    good: true,
    q: "Found my soulmate designer in 4 swipes.",
  },
  {
    who: "Dev",
    verdict: "Approved",
    good: true,
    q: "I finally made a friend.",
  },
  {
    who: "Jo",
    verdict: "Changes requested",
    good: false,
    q: "No one wanted to pair me with. Chat, am I chopped?",
  },
];

export default function Landing() {
  const userId = useUserId();
  const cta = userId ? "/discover" : "/onboarding";

  return (
    <div className="overflow-x-hidden">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo size="lg" />
        <Button href={cta} variant="ghost" className="px-5 py-2 text-sm">
          {userId ? "Open app" : "Sign up"}
        </Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:pt-16">
        <div>
          <h1 className="font-display text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
            Find your perfect teammate. 0 miles away.
          </h1>
          <p className="mt-6 flex flex-wrap items-baseline gap-x-3 text-xl text-dim">
            <Countdown className="text-3xl font-bold text-hi sm:text-4xl" />
            until demos. Swipe fast.
          </p>
          <p className="mt-4 max-w-md text-dim">
            Swipe on like-minded hustlers by vibe and skill. Like, match, chat,
            and merge teams. No romance. Only hustling. Remember: horse don't
            stop.
          </p>
          <div className="mt-8">
            <Button href={cta} className="px-8 py-4 text-lg">
              {userId ? "Back to the grind" : "Create your badge"}
            </Button>
          </div>
        </div>

        <div className="relative mx-auto h-[27rem] w-full max-w-sm" aria-hidden>
          <BadgeTile
            profile={sample[0]}
            score={78}
            tilt={-8}
            className="absolute left-0 top-12 w-44"
          />
          <BadgeTile
            profile={sample[2]}
            score={83}
            tilt={9}
            className="absolute right-0 top-28 w-44"
          />
          <BadgeTile
            profile={sample[1]}
            score={91}
            tilt={2}
            className="absolute left-16 top-0 z-10 w-48"
          />
        </div>
      </section>

      <div
        className="overflow-hidden border-y border-edge bg-slab py-3"
        aria-label="Fake live stats"
      >
        <div className="ticker-track flex w-max gap-12 whitespace-nowrap text-sm">
          {[...log, ...log].map((l, i) => (
            <span key={i}>
              <span className={l.ok ? "text-ok" : "text-ship"}>
                {l.ok ? "✓" : "✗"}
              </span>{" "}
              {l.t}
            </span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-2xl px-5 py-20">
        <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
          Reviewed by people who have not showered
        </h2>
        <ul className="mt-8 divide-y divide-edge border-y border-edge">
          {reviews.map((r) => (
            <li key={r.who} className="flex gap-4 py-5">
              <Avatar profile={{ name: r.who }} size={40} />
              <div>
                <p className="flex flex-wrap items-center gap-x-3 text-sm">
                  <b>{r.who}</b>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${r.good ? "border-ok/50 text-ok" : "border-ship/50 text-ship"}`}
                  >
                    {r.verdict}
                  </span>
                </p>
                <p className="mt-1">{r.q}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10 text-center">
          <Button href={cta} className="px-8 py-4 text-lg">
            {userId ? "Back to the grind" : "Create your badge"}
          </Button>
        </div>
      </section>

      <footer className="border-t border-edge py-8 text-center text-sm text-dim">
        Grinder is a parody. Please do not actually date your Kubernetes
        cluster.
      </footer>
    </div>
  );
}
