import type { Compat, Profile } from "@/lib/types";

export interface ProfileCardProps {
  profile: Profile;
  compat?: Compat;
  compact?: boolean;
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-300 border-emerald-400/60 bg-emerald-400/10";
  if (score >= 50) return "text-amber-300 border-amber-400/60 bg-amber-400/10";
  return "text-rose-300 border-rose-400/60 bg-rose-400/10";
}

function hackathonBadge(n: number) {
  if (n === 0) return "🌱 Hackathon virgin";
  if (n === 1) return "🐣 1 hackathon";
  if (n < 5) return `⚡ ${n} hackathons`;
  if (n < 10) return `🔥 ${n} hackathons deep`;
  return `🧓 ${n} hackathons. Send help.`;
}

function ScoreBadge({ compat }: { compat: Compat }) {
  return (
    <div
      className={`flex shrink-0 flex-col items-center rounded-xl border px-2.5 py-1 font-mono ${scoreColor(compat.score)}`}
      title="Teammate compatibility"
    >
      <span className="text-lg font-bold leading-tight">{compat.score}%</span>
      <span className="text-[9px] uppercase tracking-wider opacity-80">compat</span>
    </div>
  );
}

// Uploaded photo if there is one, otherwise the emoji.
export function Avatar({ profile, className }: { profile: Pick<Profile, "avatarEmoji" | "avatarUrl" | "name">; className: string }) {
  if (profile.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profile.avatarUrl} alt={profile.name} className={`${className} object-cover`} />
    );
  }
  return <span className={`${className} flex items-center justify-center`}>{profile.avatarEmoji}</span>;
}

export default function ProfileCard({ profile, compat, compact }: ProfileCardProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-neutral-900 p-3 text-white">
        <Avatar
          profile={profile}
          className="h-12 w-12 shrink-0 rounded-full bg-gradient-to-br from-fuchsia-600/40 to-orange-500/40 text-2xl"
        />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{profile.name}</div>
          <div className="truncate text-sm text-neutral-400">{profile.tagline}</div>
        </div>
        {compat && <ScoreBadge compat={compat} />}
      </div>
    );
  }

  return (
    <article className="w-full overflow-hidden rounded-3xl border border-white/10 bg-neutral-900 text-white shadow-xl">
      <header className="flex items-center gap-4 bg-gradient-to-br from-fuchsia-600/30 via-neutral-900 to-orange-500/20 p-5">
        <Avatar
          profile={profile}
          className="h-20 w-20 shrink-0 rounded-full border border-white/20 bg-black/30 text-5xl"
        />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-2xl font-extrabold tracking-tight">{profile.name}</h2>
          <p className="text-sm text-neutral-300">{profile.tagline}</p>
          <span className="mt-2 inline-block rounded-full border border-white/15 bg-black/30 px-2.5 py-0.5 text-xs font-medium">
            {hackathonBadge(profile.hackathonCount)}
          </span>
        </div>
        {compat && <ScoreBadge compat={compat} />}
      </header>

      <div className="space-y-4 p-5">
        {profile.bio && <p className="text-sm leading-relaxed text-neutral-200">{profile.bio}</p>}

        {compat && compat.reasons.length > 0 && (
          <ul className="space-y-1 rounded-xl border border-pink-400/30 bg-pink-400/5 p-3 text-sm text-pink-200">
            {compat.reasons.map((r) => (
              <li key={r}>💘 {r}</li>
            ))}
          </ul>
        )}

        {profile.styleTags.length > 0 && (
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Vibe</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.styleTags.map((t) => (
                <span key={t} className="rounded-full bg-fuchsia-500/15 px-2.5 py-1 text-xs text-fuchsia-200">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.skillTags.length > 0 && (
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">Skills</h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.skillTags.map((t) => (
                <span key={t} className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-200">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.lookingFor.length > 0 && (
          <section>
            <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-500">
              Looking for a teammate who is
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.lookingFor.map((t) => (
                <span key={t} className="rounded-full border border-orange-400/40 px-2.5 py-1 text-xs text-orange-200">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {profile.prompts.length > 0 && (
          <section className="space-y-2">
            {profile.prompts.map((p) => (
              <div key={p.question} className="rounded-xl bg-white/5 p-3">
                <div className="text-xs font-semibold text-neutral-400">{p.question}</div>
                <div className="mt-0.5 text-base font-medium text-white">{p.answer}</div>
              </div>
            ))}
          </section>
        )}
      </div>
    </article>
  );
}
