"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProfileCard from "@/components/profile/ProfileCard";
import ProfileForm, { type ProfileDraft } from "@/components/profile/ProfileForm";
import Button from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { clearUserId, getUserId } from "@/lib/session";
import type { Profile } from "@/lib/types";

function toDraft(p: Profile): ProfileDraft {
  const draft: Partial<Profile> = { ...p };
  delete draft.id;
  delete draft.createdAt;
  return draft as ProfileDraft;
}

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
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

  function startOver() {
    clearUserId();
    router.push("/onboarding");
  }

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
    window.scrollTo({ top: 0 });
    toast.push("Saved. You're now 3% more hireable.");
  }

  if (missing)
    return (
      <div className="px-5 py-16 text-center">
        <h1 className="mt-4 font-display text-2xl font-black">404: personality not found</h1>
        <p className="mx-auto mt-2 max-w-xs text-dim">Your profile ghosted you. Someone probably reset the database.</p>
        <Button className="mt-6" onClick={startOver}>Make a new one</Button>
      </div>
    );

  if (!profile)
    return (
      <div className="px-5 py-6" aria-busy>
        <div className="h-72 animate-pulse rounded-3xl bg-slab" />
        <p className="mt-4 text-center font-mono text-sm text-dim">Loading your personality…</p>
      </div>
    );

  if (editing)
    return (
      <div className="px-5 py-6">
        <h1 className="mb-6 font-display text-2xl font-black">Edit your badge</h1>
        <ProfileForm mode="edit" submitLabel="Save changes" initial={toDraft(profile)} onSubmit={save} onCancel={() => setEditing(false)} />
      </div>
    );

  return (
    <div className="space-y-5 px-5 py-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-dim">your badge</p>
          <h1 className="font-display text-2xl font-black">This is you. Yikes.</h1>
        </div>
        <Button variant="ghost" className="px-5 py-2 text-sm" onClick={() => setEditing(true)}>Edit</Button>
      </div>

      <ProfileCard profile={profile} />

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-edge bg-slab px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-dim">Contact handle, shown only after a match</p>
          <p className="truncate font-mono text-snow">{profile.handle}</p>
        </div>
        <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-dim"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
      </div>

      <div className="pt-4 text-center">
        <Button variant="danger" className="px-5 py-2 text-sm" onClick={startOver}>Burn it down, start a new identity</Button>
      </div>
    </div>
  );
}
