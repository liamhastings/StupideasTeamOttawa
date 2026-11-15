import type { Profile } from "@/lib/types";

/** "Dev 'sudo' Patel" -> "DP". Always something to draw, never an emoji. */
export function initials(name: string | undefined): string {
  const words = (name ?? "").replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = Array.from(words[0])[0] ?? "";
  const last = words.length > 1 ? (Array.from(words[words.length - 1])[0] ?? "") : "";
  return (first + last).toUpperCase();
}

type Props = {
  /** Only the name and the uploaded photo matter; a Profile or any subset works. */
  profile: Partial<Pick<Profile, "name" | "avatarUrl">>;
  size?: number;
  ring?: boolean;
  className?: string;
};

/** The uploaded photo if there is one, otherwise a clean initials badge. */
export default function Avatar({ profile, size = 48, ring = false, className = "" }: Props) {
  const cls = `shrink-0 rounded-full ${ring ? "ring-2 ring-hi ring-offset-2 ring-offset-floor" : ""} ${className}`;
  if (profile.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={profile.avatarUrl} alt={profile.name ?? ""} width={size} height={size} style={{ width: size, height: size }} className={`${cls} object-cover`} />
    );
  }
  return (
    <span
      aria-hidden
      className={`grid place-items-center bg-slab font-display font-black text-hi ${cls}`}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials(profile.name)}
    </span>
  );
}
