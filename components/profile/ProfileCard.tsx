import type { Compat, Profile } from "@/lib/types";
import { bandFor } from "@/components/ui/BadgeTile";
import UiAvatar, { initials } from "@/components/ui/Avatar";

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
        <UiAvatar profile={profile} size={48} className="bg-floor" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm font-bold">{profile.name}</div>
          <div className="truncate text-sm text-dim">{profile.tagline}</div>
        </div>
        {compat && <ScoreSticker score={compat.score} className="rotate-3" />}
      </div>
    );
  }

  const photos = profile.photos?.length ? profile.photos : profile.avatarUrl ? [profile.avatarUrl] : [];
  const prompts = profile.prompts.slice(0, 3);
  // Hinge rhythm: photo, prompt, (about block), photo, prompt, photo, prompt...
  const rounds = Math.max(photos.length, prompts.length, 1);

  const about = (
    <section key="about" className="space-y-5 rounded-2xl bg-slab p-5">
      {compat && compat.reasons.length > 0 && (
        <ul className="space-y-1.5 rounded-xl border border-ok/30 bg-ok/5 p-4 text-sm">
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
    </section>
  );

  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < rounds; i++) {
    if (photos[i]) blocks.push(<Photo key={`ph${i}`} src={photos[i]} alt={`${profile.name}, photo ${i + 1}`} />);
    else if (i === 0) blocks.push(<NoPhoto key="nophoto" profile={profile} />);
    if (prompts[i]) blocks.push(<PromptBlock key={`pr${i}`} question={prompts[i].question} answer={prompts[i].answer} />);
    if (i === 0) blocks.push(about);
  }

  return (
    <article className="space-y-3 rounded-3xl bg-floor p-3 text-snow">
      <header className="flex items-start justify-between gap-3 px-2 pt-2">
        <div className="min-w-0">
          <h2 className="font-display text-3xl font-black leading-tight">{profile.name}</h2>
          {profile.tagline && <p className="mt-1 leading-snug text-dim">{profile.tagline}</p>}
          <span className="mt-2 inline-block rounded-full border border-edge px-2.5 py-0.5 font-mono text-[11px] font-semibold text-snow">
            {hackathonLabel(profile.hackathonCount)}
          </span>
        </div>
        {compat && <ScoreSticker score={compat.score} className="mt-1 shrink-0 rotate-6 text-base" />}
      </header>
      {blocks}
    </article>
  );
}

/** Full-width 4:5 photo, like Hinge. */
function Photo({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-slab">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} draggable={false} className="aspect-[4/5] w-full object-cover" />
    </div>
  );
}

/** No photos yet: a big name badge instead of an empty hole. */
function NoPhoto({ profile }: { profile: Profile }) {
  return (
    <div className={`${bandFor(profile.id)} grid aspect-[4/3] place-items-center rounded-2xl text-ink`}>
      <div className="text-center">
        <span className="block font-display text-7xl font-black leading-none">{initials(profile.name)}</span>
        <span className="mt-3 block text-sm font-semibold">No photo. Very mysterious. Very hackerman.</span>
      </div>
    </div>
  );
}

/** Hinge's big prompt card, on name-badge paper. */
function PromptBlock({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-2xl bg-badge px-6 pb-8 pt-7 text-ink">
      <div className="text-sm font-semibold text-ink/70">{question}</div>
      <div className="mt-3 font-display text-2xl font-black leading-[1.15] sm:text-3xl">{answer}</div>
    </div>
  );
}
