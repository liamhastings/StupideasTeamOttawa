"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileForm, { type ProfileDraft } from "@/components/profile/ProfileForm";
import { clearUserId, getUserId } from "@/lib/session";
import type { Profile } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    const id = getUserId();
    if (!id) {
      router.replace("/onboarding");
      return;
    }
    fetch(`/api/profiles/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setProfile)
      .catch(() => setMissing(true));
  }, [router]);

  async function save(draft: ProfileDraft): Promise<string | void> {
    if (!profile) return;
    const res = await fetch(`/api/profiles/${profile.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    if (!res.ok) return data.error ?? "Save failed. Blame the intern.";
    setProfile(data);
    setEditing(false);
    setSaved(true);
  }

  if (missing)
    return (
      <main className="min-h-screen bg-neutral-950 p-8 text-center text-white">
        <p className="text-5xl">👻</p>
        <p className="mt-3">Your profile ghosted you (the database was reset).</p>
        <button
          className="mt-4 rounded-xl bg-fuchsia-600 px-5 py-2 font-bold"
          onClick={() => { clearUserId(); router.push("/onboarding"); }}
        >
          Make a new one
        </button>
      </main>
    );

  if (!profile)
    return <main className="min-h-screen bg-neutral-950 p-8 text-center text-neutral-400">Loading your personality…</main>;

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10">
      <div className="mx-auto max-w-xl">
        {editing ? (
          <>
            <h1 className="mb-6 text-3xl font-extrabold text-white">Edit your personality</h1>
            <ProfileForm
              mode="edit"
              submitLabel="Save changes 💾"
              initial={{
                name: profile.name, handle: profile.handle, avatarEmoji: profile.avatarEmoji,
                avatarUrl: profile.avatarUrl, tagline: profile.tagline, bio: profile.bio, styleTags: profile.styleTags,
                skillTags: profile.skillTags, hackathonCount: profile.hackathonCount,
                lookingFor: profile.lookingFor, prompts: profile.prompts,
              }}
              onSubmit={save}
            />
            <button onClick={() => setEditing(false)} className="mt-3 w-full text-sm text-neutral-400 underline">
              Cancel
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-4 text-3xl font-extrabold text-white">This is you. Yikes.</h1>
            {saved && <p className="mb-3 rounded-lg bg-emerald-500/15 p-3 text-sm text-emerald-300">✅ Saved. You&apos;re now 3% more hireable.</p>}
            <ProfileCard profile={profile} />
            <p className="mt-3 text-sm text-neutral-400">
              Contact handle (only shown after a match): <span className="font-mono text-white">{profile.handle}</span>
            </p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setEditing(true)} className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-5 py-3 font-bold text-white">
                Edit profile
              </button>
              <button
                onClick={() => { clearUserId(); router.push("/onboarding"); }}
                className="rounded-xl border border-white/20 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                New identity
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
