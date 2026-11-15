import type { Compat, Profile } from "@/lib/types";
import { bandFor } from "@/components/ui/BadgeTile";

export interface ProfileCardProps {
  profile: Profile;
  compat?: Compat;
  compact?: boolean;
}

function hackathonLabel(n: number) {
  if (n === 0) return "First hackathon";
  if (n === 1) return "1 hackathon";
  if (n < 10) return `${n} hackathons`;
  return `${n} hackathons. Send help.`;
}

/** Uploaded photo if there is one, otherwise the emoji. Exported for teammates. */
export function Avatar({
  profile,
  className = "",
}: {
  profile: Pick<Profile, "avatarEmoji" | "avatarUrl" | "name">;
  className?: string;
}) {
  if (profile.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profile.avatarUrl} alt={profile.name} className={`shrink-0 rounded-full object-cover ${className}`} />
    );
  }
  return (
    <span aria-hidden className={`grid shrink-0 place-items-center rounded-full ${className}`}>
      {profile.avatarEmoji}
    </span>
  );
}

/** Fit score as a laptop sticker, same as Ian's BadgeTile. */
function ScoreSticker({ score, className = "" }: { score: number; className?: string }) {
  return (
    <span className={`rounded-md bg-ink px-2 py-1 font-mono text-sm font-bold text-hi shadow-md ${className}`}>
      {score}% fit
    </span>
  );
}

function Chips({ label, tags, tone }: { label: string; tags: string[]; tone: "hi" | "sky" | "ghost" }) {
  if (!tags.length) return null;
  const cls = {
    hi: "bg-hi/10 text-hi border-hi/30",
    sky: "bg-sky/10 text-sky border-sky/30",
    ghost: "border-dashed border-edge text-dim",
  }[tone];
  return (
    <section>
      <h3 className="mb-2 font-mono text-[11px] uppercase tracking-widest text-dim">{label}</h3>
      <ul className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <li key={t} className={`rounded-full border px-3 py-1 text-[13px] font-medium ${cls}`}>{t}</li>
        ))}
      </ul>
    </section>
  );
}

export default function ProfileCard({ profile, compat, compact }: ProfileCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-edge bg-slab p-3 text-snow">
        <Avatar profile={profile} className="h-12 w-12 bg-floor text-2xl" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold">{profile.name}</div>
          <div className="truncate text-sm text-dim">{profile.tagline}</div>
        </div>
        {compat && <ScoreSticker score={compat.score} className="rotate-3" />}
      </div>
    );
  }

  return (
    <article className="overflow-hidden rounded-3xl border border-edge bg-slab text-snow">
      {/* Name badge */}
      <header className="relative bg-badge text-ink">
        <span aria-hidden className="absolute left-1/2 top-2.5 h-2.5 w-14 -translate-x-1/2 rounded-full bg-floor" />
        <div className={`${bandFor(profile.id)} px-5 pb-2.5 pt-7`}>
          <span className="block font-display text-xl font-black leading-none">hello</span>
          <span className="block text-xs font-semibold">my name is</span>
        </div>
        <div className="flex items-center gap-4 px-5 py-5">
          <Avatar profile={profile} className="h-20 w-20 border-2 border-ink/10 bg-white text-5xl" />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl font-black leading-tight">{profile.name}</h2>
            {profile.tagline && <p className="mt-1 text-sm leading-snug text-ink/70">{profile.tagline}</p>}
            <span className="mt-2 inline-block rounded-full bg-ink px-2.5 py-0.5 font-mono text-[11px] font-semibold text-badge">
              {hackathonLabel(profile.hackathonCount)}
            </span>
          </div>
        </div>
        {compat && <ScoreSticker score={compat.score} className="absolute right-4 top-10 rotate-6 text-base" />}
      </header>

      <div className="space-y-5 p-5">
        {compat && compat.reasons.length > 0 && (
          <ul className="space-y-1.5 rounded-2xl border border-ok/30 bg-ok/5 p-4 text-sm">
            {compat.reasons.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-ok" aria-hidden>✓</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        )}

        {profile.bio && <p className="leading-relaxed text-snow/90">{profile.bio}</p>}

        <Chips label="Skills" tags={profile.skillTags} tone="hi" />
        <Chips label="Vibe" tags={profile.styleTags} tone="sky" />
        <Chips label="Looking for" tags={profile.lookingFor} tone="ghost" />

        {profile.prompts.length > 0 && (
          <div className="space-y-3">
            {profile.prompts.map((p) => (
              <div key={p.question} className="rounded-2xl border border-edge bg-floor p-4">
                <div className="text-sm text-dim">{p.question}</div>
                <div className="mt-1.5 font-display text-lg font-bold leading-snug">{p.answer}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
