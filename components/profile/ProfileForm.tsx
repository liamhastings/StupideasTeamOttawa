"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { PROMPT_QUESTIONS, SKILL_TAGS, STYLE_TAGS } from "@/lib/tags";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export type ProfileDraft = Omit<Profile, "id" | "createdAt">;

export const EMPTY_DRAFT: ProfileDraft = {
  name: "",
  handle: "",
  avatarEmoji: "",
  tagline: "",
  bio: "",
  styleTags: [],
  skillTags: [],
  hackathonCount: 0,
  lookingFor: [],
  prompts: [],
};

const STEPS = [
  { title: "Who are you, hacker?", sub: "Add a photo. Pick a name. Pretend it's not a cry for help." },
  { title: "Your pitch", sub: "One line to hook them. One paragraph to ruin it." },
  { title: "Your vibe", sub: "How do you hack? Choose your fighter(s)." },
  { title: "Your skills", sub: "What can you actually do? We won't check. Probably." },
  { title: "Your dream teammate", sub: "Which skills would complete your sad, incomplete team?" },
  { title: "Prompts", sub: "Answer up to 3. Funny beats correct." },
  { title: "How do we reach you?", sub: "Only revealed after a mutual match. We're not animals." },
];

const inputCls =
  "w-full rounded-xl border border-edge bg-slab px-4 py-3 text-snow placeholder:text-dim/70 outline-none transition focus:border-hi";

const labelCls = "mb-1.5 block text-sm font-semibold text-dim";

// Center-crop + shrink an uploaded image to a small square JPEG data URL,
// so it fits comfortably in the JSON store.
async function fileToAvatar(file: File, size = 320): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function TagPicker({
  options,
  selected,
  onChange,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  return (
    <div>
      <p className="mb-3 font-mono text-xs text-dim">{selected.length} selected</p>
      <div className="flex flex-wrap gap-2">
        {options.map((t) => {
          const active = selected.includes(t);
          return (
            <button
              type="button"
              key={t}
              aria-pressed={active}
              onClick={() => onChange(active ? selected.filter((x) => x !== t) : [...selected, t])}
              className={`rounded-full border px-3.5 py-2 text-sm font-medium transition active:scale-[0.97] ${
                active ? "border-hi bg-hi text-ink" : "border-edge bg-slab text-snow hover:border-dim"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfileForm({
  initial,
  mode,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: ProfileDraft;
  mode: "wizard" | "edit";
  submitLabel: string;
  onSubmit: (draft: ProfileDraft) => Promise<string | void>;
  onCancel?: () => void;
}) {
  const [d, setD] = useState<ProfileDraft>(initial ?? EMPTY_DRAFT);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = <K extends keyof ProfileDraft>(k: K, v: ProfileDraft[K]) => setD((p) => ({ ...p, [k]: v }));

  const setPrompt = (i: number, patch: Partial<{ question: string; answer: string }>) => {
    const prompts = [...d.prompts];
    while (prompts.length <= i) prompts.push({ question: PROMPT_QUESTIONS[prompts.length], answer: "" });
    prompts[i] = { ...prompts[i], ...patch };
    set("prompts", prompts);
  };

  const stepError = (s: number): string => {
    if (s === 0 && !d.name.trim()) return "You need a name. Even 'xX_h4ck3r_Xx' counts.";
    if (s === 6 && !d.handle.trim()) return "No handle? How will your future teammates ping you at 4am?";
    return "";
  };

  const submit = async () => {
    const err = [0, 6].map(stepError).find(Boolean);
    if (err) return setError(err);
    setBusy(true);
    setError("");
    const cleaned: ProfileDraft = { ...d, prompts: d.prompts.filter((p) => p.answer.trim()).slice(0, 3) };
    const res = await onSubmit(cleaned);
    if (res) setError(res);
    setBusy(false);
  };

  const sections: React.ReactNode[] = [
    <div key="0" className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar profile={{ name: d.name, avatarUrl: d.avatarUrl }} size={80} ring />
        <div className="flex flex-col items-start gap-1">
          <label className="cursor-pointer rounded-full border border-edge px-4 py-2 text-sm font-bold transition hover:bg-slab">
            {d.avatarUrl ? "Change photo" : "Upload a photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (!file) return;
                try {
                  set("avatarUrl", await fileToAvatar(file));
                  setError("");
                } catch {
                  setError("Couldn't read that image. Is it a photo or a cursed .heic?");
                }
              }}
            />
          </label>
          {d.avatarUrl ? (
            <button type="button" onClick={() => set("avatarUrl", undefined)} className="px-1 text-xs text-dim underline-offset-2 hover:text-snow hover:underline">
              Remove photo
            </button>
          ) : (
            <span className="px-1 text-xs text-dim">Photos only. No photo, no problem: you get initials.</span>
          )}
        </div>
      </div>
      <label className="block">
        <span className={labelCls}>Name</span>
        <input className={inputCls} placeholder="Your name or hacker alias" maxLength={60} value={d.name} onChange={(e) => set("name", e.target.value)} />
      </label>
    </div>,
    <div key="1" className="space-y-5">
      <label className="block">
        <span className={labelCls}>Tagline</span>
        <input className={inputCls} placeholder="I use Arch btw" maxLength={120} value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
      </label>
      <label className="block">
        <span className={labelCls}>Bio</span>
        <textarea className={`${inputCls} resize-none`} rows={4} placeholder="Be honest. Or don't." maxLength={400} value={d.bio} onChange={(e) => set("bio", e.target.value)} />
        <span className="mt-1 block text-right font-mono text-xs text-dim">{d.bio.length}/400</span>
      </label>
    </div>,
    <TagPicker key="2" options={STYLE_TAGS} selected={d.styleTags} onChange={(v) => set("styleTags", v)} />,
    <div key="3" className="space-y-6">
      <TagPicker options={SKILL_TAGS} selected={d.skillTags} onChange={(v) => set("skillTags", v)} />
      <div>
        <span className={labelCls}>Hackathons survived</span>
        <div className="flex items-center gap-3">
          <button type="button" aria-label="Fewer" onClick={() => set("hackathonCount", Math.max(0, d.hackathonCount - 1))} className="grid h-11 w-11 place-items-center rounded-full border border-edge text-xl font-bold hover:bg-slab">−</button>
          <span className="min-w-12 text-center font-display text-3xl font-black">{d.hackathonCount}</span>
          <button type="button" aria-label="More" onClick={() => set("hackathonCount", Math.min(999, d.hackathonCount + 1))} className="grid h-11 w-11 place-items-center rounded-full border border-edge text-xl font-bold hover:bg-slab">+</button>
        </div>
      </div>
    </div>,
    <TagPicker key="4" options={SKILL_TAGS} selected={d.lookingFor} onChange={(v) => set("lookingFor", v)} />,
    <div key="5" className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="rounded-2xl border border-edge bg-slab p-4">
          <select
            aria-label={`Prompt ${i + 1}`}
            className="w-full cursor-pointer bg-transparent text-sm font-semibold text-dim outline-none"
            value={d.prompts[i]?.question ?? PROMPT_QUESTIONS[i]}
            onChange={(e) => setPrompt(i, { question: e.target.value })}
          >
            {PROMPT_QUESTIONS.map((q) => (
              <option key={q} value={q} className="bg-slab">{q}</option>
            ))}
          </select>
          <textarea
            className="mt-2 w-full resize-none bg-transparent font-display text-lg font-bold text-snow outline-none placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-dim/60"
            rows={2}
            maxLength={280}
            placeholder="Your answer. Leave blank to skip."
            value={d.prompts[i]?.answer ?? ""}
            onChange={(e) => setPrompt(i, { answer: e.target.value })}
          />
        </div>
      ))}
    </div>,
    <label key="6" className="block">
      <span className={labelCls}>Discord, Telegram, carrier pigeon</span>
      <input className={`${inputCls} font-mono`} placeholder="@your_handle" maxLength={60} value={d.handle} onChange={(e) => set("handle", e.target.value)} />
      <span className="mt-2 block text-xs text-dim">Hidden until you both swipe right.</span>
    </label>,
  ];

  const isWizard = mode === "wizard";
  const last = step === STEPS.length - 1;

  const next = () => {
    const err = stepError(step);
    if (err) return setError(err);
    setError("");
    setStep(step + 1);
  };

  const errorBox = error && (
    <p role="alert" className="mt-5 rounded-xl border border-ship/40 bg-ship/10 px-4 py-3 text-sm text-ship">{error}</p>
  );

  if (!isWizard) {
    return (
      <div>
        <div className="divide-y divide-edge">
          {sections.map((s, i) => (
            <section key={i} className="py-7 first:pt-0">
              <h2 className="font-display text-lg font-bold">{STEPS[i].title}</h2>
              <p className="mb-4 mt-1 text-sm text-dim">{STEPS[i].sub}</p>
              {s}
            </section>
          ))}
        </div>
        {errorBox}
        <div className="sticky bottom-24 mt-4 flex gap-2 rounded-full bg-floor/90 py-2 backdrop-blur">
          {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>}
          <Button type="button" className="flex-1" disabled={busy} onClick={submit}>
            {busy ? "Compiling your personality…" : submitLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      <div className="flex-1 px-5 pt-6">
        <div className="flex gap-1" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? "bg-hi" : "bg-edge"}`} />
          ))}
        </div>
        <p className="mt-5 font-mono text-xs text-dim">
          {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")}
        </p>
        <h1 className="mt-1 font-display text-3xl font-black leading-tight">{STEPS[step].title}</h1>
        <p className="mb-7 mt-2 text-dim">{STEPS[step].sub}</p>
        {sections[step]}
        {errorBox}
      </div>

      <div className="sticky bottom-0 mt-8 flex gap-2 border-t border-edge bg-floor/95 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur">
        {step > 0 && (
          <Button type="button" variant="ghost" onClick={() => { setError(""); setStep(step - 1); }}>
            Back
          </Button>
        )}
        {last ? (
          <Button type="button" className="flex-1" disabled={busy} onClick={submit}>
            {busy ? "Compiling your personality…" : submitLabel}
          </Button>
        ) : (
          <Button type="button" className="flex-1" onClick={next}>
            {step === 2 || step === 4 ? "Next, I guess" : "Next"}
          </Button>
        )}
      </div>
    </div>
  );
}
