"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";
import { AVATAR_EMOJIS, PROMPT_QUESTIONS, SKILL_TAGS, STYLE_TAGS } from "@/lib/tags";

export type ProfileDraft = Omit<Profile, "id" | "createdAt">;

export const EMPTY_DRAFT: ProfileDraft = {
  name: "",
  handle: "",
  avatarEmoji: "🧑‍💻",
  tagline: "",
  bio: "",
  styleTags: [],
  skillTags: [],
  hackathonCount: 0,
  lookingFor: [],
  prompts: [],
};

const STEPS = [
  { title: "Who are you, hacker?", sub: "Pick a face. Pick a name. Pretend it's not a cry for help." },
  { title: "Your pitch", sub: "One line to hook them. One paragraph to ruin it." },
  { title: "Your vibe", sub: "How do you hack? Choose your fighter(s)." },
  { title: "Your skills", sub: "What can you actually do? (We won't check. Probably.)" },
  { title: "Your dream teammate", sub: "Who completes your sad, incomplete team?" },
  { title: "Prompts", sub: "Answer up to 3. Funny > correct." },
  { title: "How do we reach you?", sub: "Only revealed after a mutual match. We're not animals." },
];

const inputCls =
  "w-full rounded-xl border border-white/15 bg-neutral-800 px-3 py-2.5 text-white placeholder-neutral-500 outline-none focus:border-fuchsia-400";

function TagPicker({
  options,
  selected,
  onChange,
  tone,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (v: string[]) => void;
  tone: "fuchsia" | "emerald" | "orange";
}) {
  const on = {
    fuchsia: "border-fuchsia-400 bg-fuchsia-500/30 text-white",
    emerald: "border-emerald-400 bg-emerald-500/30 text-white",
    orange: "border-orange-400 bg-orange-500/30 text-white",
  }[tone];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((t) => {
        const active = selected.includes(t);
        return (
          <button
            type="button"
            key={t}
            onClick={() => onChange(active ? selected.filter((x) => x !== t) : [...selected, t])}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              active ? on : "border-white/15 bg-neutral-800 text-neutral-300 hover:border-white/40"
            }`}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileForm({
  initial,
  mode,
  submitLabel,
  onSubmit,
}: {
  initial?: ProfileDraft;
  mode: "wizard" | "edit";
  submitLabel: string;
  onSubmit: (draft: ProfileDraft) => Promise<string | void>;
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
    <div key="0" className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {AVATAR_EMOJIS.map((e) => (
          <button
            type="button"
            key={e}
            onClick={() => set("avatarEmoji", e)}
            className={`h-12 w-12 rounded-full border text-2xl ${
              d.avatarEmoji === e ? "border-fuchsia-400 bg-fuchsia-500/30" : "border-white/15 bg-neutral-800"
            }`}
          >
            {e}
          </button>
        ))}
      </div>
      <input className={inputCls} placeholder="Your name (or hacker alias)" maxLength={60} value={d.name} onChange={(e) => set("name", e.target.value)} />
    </div>,
    <div key="1" className="space-y-4">
      <input className={inputCls} placeholder='Tagline, e.g. "I use Arch btw"' maxLength={120} value={d.tagline} onChange={(e) => set("tagline", e.target.value)} />
      <textarea className={inputCls} rows={4} placeholder="Bio. Be honest. Or don't." maxLength={400} value={d.bio} onChange={(e) => set("bio", e.target.value)} />
    </div>,
    <TagPicker key="2" tone="fuchsia" options={STYLE_TAGS} selected={d.styleTags} onChange={(v) => set("styleTags", v)} />,
    <div key="3" className="space-y-5">
      <TagPicker tone="emerald" options={SKILL_TAGS} selected={d.skillTags} onChange={(v) => set("skillTags", v)} />
      <label className="block">
        <span className="mb-1 block text-sm text-neutral-300">How many hackathons have you survived?</span>
        <input
          type="number"
          min={0}
          max={999}
          className={`${inputCls} w-28`}
          value={d.hackathonCount}
          onChange={(e) => set("hackathonCount", Math.max(0, Number(e.target.value) || 0))}
        />
      </label>
    </div>,
    <TagPicker key="4" tone="orange" options={SKILL_TAGS} selected={d.lookingFor} onChange={(v) => set("lookingFor", v)} />,
    <div key="5" className="space-y-4">
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-2 rounded-xl bg-white/5 p-3">
          <select
            className={inputCls}
            value={d.prompts[i]?.question ?? PROMPT_QUESTIONS[i]}
            onChange={(e) => setPrompt(i, { question: e.target.value })}
          >
            {PROMPT_QUESTIONS.map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <textarea
            className={inputCls}
            rows={2}
            maxLength={280}
            placeholder="Your answer (leave blank to skip)"
            value={d.prompts[i]?.answer ?? ""}
            onChange={(e) => setPrompt(i, { answer: e.target.value })}
          />
        </div>
      ))}
    </div>,
    <div key="6" className="space-y-2">
      <input className={inputCls} placeholder="@discord_or_telegram" maxLength={60} value={d.handle} onChange={(e) => set("handle", e.target.value)} />
      <p className="text-xs text-neutral-500">Hidden until you both swipe right. Slide into DMs responsibly.</p>
    </div>,
  ];

  const isWizard = mode === "wizard";
  const last = step === STEPS.length - 1;

  const next = () => {
    const err = stepError(step);
    if (err) return setError(err);
    setError("");
    setStep(step + 1);
  };

  return (
    <div className="mx-auto w-full max-w-xl text-white">
      {isWizard ? (
        <>
          <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full bg-gradient-to-r from-fuchsia-500 to-orange-400 transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
          </div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">Step {step + 1} of {STEPS.length}</p>
          <h1 className="mt-1 text-3xl font-extrabold">{STEPS[step].title}</h1>
          <p className="mb-5 mt-1 text-neutral-400">{STEPS[step].sub}</p>
          {sections[step]}
        </>
      ) : (
        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold">{STEPS[i].title}</h2>
              <p className="mb-3 text-sm text-neutral-400">{STEPS[i].sub}</p>
              {s}
            </section>
          ))}
        </div>
      )}

      {error && <p className="mt-4 rounded-lg bg-rose-500/15 p-3 text-sm text-rose-300">🚨 {error}</p>}

      <div className="mt-8 flex gap-3">
        {isWizard && step > 0 && (
          <button type="button" onClick={() => { setError(""); setStep(step - 1); }} className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">
            Back
          </button>
        )}
        {isWizard && !last ? (
          <button type="button" onClick={next} className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-5 py-3 font-bold">
            Next →
          </button>
        ) : (
          <button type="button" disabled={busy} onClick={submit} className="flex-1 rounded-xl bg-gradient-to-r from-fuchsia-600 to-orange-500 px-5 py-3 font-bold disabled:opacity-50">
            {busy ? "Compiling your personality…" : submitLabel}
          </button>
        )}
      </div>
    </div>
  );
}
