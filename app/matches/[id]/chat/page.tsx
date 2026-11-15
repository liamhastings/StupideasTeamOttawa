"use client";
import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { BackIcon, SendIcon } from "@/components/ui/Icons";
import { appendLocalMessage, fetchMatches, listMessages, sendMessage, type ChatMessage, type MatchItem } from "../../_lib/api";
import { useUserId } from "../../_lib/useUserId";

const OPENERS = ["Want to merge teams?", "What's your stack?", "Table by the outlets?", "Have you eaten?"];
const REPLIES = [
  "Sounds good. What's your stack?",
  "I have 3 energy drinks and no plan. Merge?",
  "Table 14, by the outlets. Bring snacks.",
  "Wait, can you actually design? Because I can't.",
  "Say less. Meet at the vending machine.",
];

const clock = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const userId = useUserId();
  const [item, setItem] = useState<MatchItem | null>(null);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userId) fetchMatches(userId).then((all) => setItem(all.find((m) => m.match.id === id) ?? null));
  }, [userId, id]);

  // Poll every 2s: works with a real API or the localStorage fallback.
  useEffect(() => {
    let alive = true;
    const tick = () => listMessages(id).then((m) => alive && setMsgs(m));
    tick();
    const t = setInterval(tick, 2000);
    return () => { alive = false; clearInterval(t); };
  }, [id]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  async function submit(raw: string) {
    const t = raw.trim();
    if (!t || !userId) return;
    setText("");
    const mode = await sendMessage(id, userId, t);
    setMsgs(await listMessages(id));
    if (mode === "local" && item) {
      // No chat API yet: the other hacker answers with canned lines so the demo feels alive.
      setTimeout(async () => {
        appendLocalMessage(id, item.other.id, REPLIES[Math.floor(Math.random() * REPLIES.length)]);
        setMsgs(await listMessages(id));
      }, 1200 + Math.random() * 1000);
    }
  }

  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center gap-3 border-b border-edge px-3 py-3">
        <Link href="/matches" aria-label="Back to matches" className="p-1 text-dim hover:text-snow"><BackIcon className="h-6 w-6" /></Link>
        <Link href={`/matches/${id}`} className="flex min-w-0 items-center gap-3">
          <Avatar profile={item?.other ?? { name: "Chat" }} size={40} />
          <span className="min-w-0">
            <b className="block truncate leading-tight">{item?.other.name ?? "Chat"}</b>
            <span className="block text-xs text-dim">Tap for profile and handle</span>
          </span>
        </Link>
      </header>

      <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4">
        {item && (
          <p className="mx-auto mb-4 max-w-xs text-center text-xs text-dim">
            You matched. {item.compat.reasons[0] ?? "The algorithm has spoken."}
          </p>
        )}
        {msgs.map((m, i) => {
          const mine = m.fromId === userId;
          const gap = i === 0 || Date.parse(m.createdAt) - Date.parse(msgs[i - 1].createdAt) > 10 * 60 * 1000;
          return (
            <div key={m.id}>
              {gap && <p className="my-3 text-center text-xs text-dim">{clock(m.createdAt)}</p>}
              <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <p className={`max-w-[80%] rounded-2xl px-4 py-2 ${mine ? "rounded-br-md bg-hi text-ink" : "rounded-bl-md bg-slab"}`}>{m.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottom} />
      </div>

      <div className="border-t border-edge px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
        {msgs.length === 0 && (
          <ul className="mb-2 flex gap-2 overflow-x-auto pb-1">
            {OPENERS.map((o) => (
              <li key={o} className="shrink-0">
                <button onClick={() => submit(o)} className="rounded-full border border-edge px-3 py-1.5 text-sm text-snow hover:bg-slab">{o}</button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={(e) => { e.preventDefault(); submit(text); }} className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Pitch your idea. Or just say hi."
            aria-label="Message"
            className="min-w-0 flex-1 rounded-full border border-edge bg-slab px-5 py-3 outline-none placeholder:text-dim focus:border-hi"
          />
          <button type="submit" disabled={!text.trim()} aria-label="Send" className="grid h-11 w-11 place-items-center rounded-full bg-hi text-ink disabled:opacity-40">
            <SendIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
