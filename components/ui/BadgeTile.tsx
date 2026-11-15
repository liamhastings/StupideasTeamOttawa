import type { Profile } from "@/lib/types";

const BANDS = ["bg-hi", "bg-ship", "bg-ok", "bg-sky"];
export function bandFor(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BANDS[h % BANDS.length];
}

type Props = {
  profile: Pick<Profile, "id" | "name" | "avatarEmoji" | "tagline">;
  score?: number;
  tilt?: number;
  onClick?: () => void;
  className?: string;
};

/** A hackathon name badge: lanyard slot, "hello my name is" band, fit score as a laptop sticker. */
export default function BadgeTile({ profile, score, tilt, onClick, className = "" }: Props) {
  const cls = `relative block w-full overflow-hidden rounded-2xl bg-badge text-center text-ink shadow-lg shadow-black/40 ${className}`;
  const style = tilt ? { transform: `rotate(${tilt}deg)` } : undefined;
  const body = (
    <>
      <span aria-hidden className="absolute left-1/2 top-2 h-2.5 w-12 -translate-x-1/2 rounded-full bg-floor" />
      <span className={`block ${bandFor(profile.id)} px-3 pb-2 pt-6`}>
        <span className="block font-display text-lg font-black leading-none">hello</span>
        <span className="block text-[11px] font-semibold">my name is</span>
      </span>
      <span className="block px-3 pb-4 pt-3">
        <span className="block text-4xl" aria-hidden>{profile.avatarEmoji}</span>
        <span className="mt-1 line-clamp-2 block font-display text-sm font-bold leading-tight">{profile.name}</span>
        <span className="mt-1 line-clamp-2 block text-xs text-ink/70">{profile.tagline}</span>
      </span>
      {score !== undefined && (
        <span className="absolute right-2 top-9 rotate-6 rounded-md bg-ink px-1.5 py-0.5 text-xs font-bold text-hi">{score}% fit</span>
      )}
    </>
  );
  return onClick ? (
    <button type="button" onClick={onClick} style={style} className={`${cls} transition active:scale-[0.97]`}>{body}</button>
  ) : (
    <div style={style} className={cls}>{body}</div>
  );
}
