"use client";

import { useRouter } from "next/navigation";
import ProfileForm, { type ProfileDraft } from "@/components/profile/ProfileForm";
import { setUserId } from "@/lib/session";

export default function OnboardingPage() {
  const router = useRouter();

  async function create(draft: ProfileDraft): Promise<string | void> {
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) return data.error ?? "Server said no. Rude.";
      setUserId(data.id);
      router.push("/discover");
    } catch {
      return "Network error. Have you tried turning the wifi off and on again?";
    }
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10">
      <ProfileForm mode="wizard" submitLabel="Start Grinding 🚀" onSubmit={create} />
    </main>
  );
}
