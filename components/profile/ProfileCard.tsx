// STUB (Liam's scaffold). Final design coming on liam/foundation-profiles.
import type { Compat, Profile } from "@/lib/types";

export interface ProfileCardProps {
  profile: Profile;
  compat?: Compat;
  compact?: boolean;
}

export default function ProfileCard({ profile, compat, compact }: ProfileCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-neutral-900 p-4 text-white">
      <div className="flex items-center gap-3">
        <span className="text-4xl">{profile.avatarEmoji}</span>
        <div>
          <div className="font-bold">{profile.name}</div>
          <div className="text-sm text-neutral-400">{profile.tagline}</div>
        </div>
        {compat && <span className="ml-auto font-mono">{compat.score}%</span>}
      </div>
      {!compact && (
        <>
          <p className="mt-3 text-sm">{profile.bio}</p>
          <div className="mt-2 flex flex-wrap gap-1 text-xs">
            {[...profile.styleTags, ...profile.skillTags].map((t) => (
              <span key={t} className="rounded-full bg-white/10 px-2 py-0.5">{t}</span>
            ))}
          </div>
          {compat?.reasons.map((r) => (
            <p key={r} className="mt-2 text-xs italic text-pink-300">{r}</p>
          ))}
        </>
      )}
    </div>
  );
}
