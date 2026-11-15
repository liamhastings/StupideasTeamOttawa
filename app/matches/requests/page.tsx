"use client";
import { useEffect, useState } from "react";
import ProfileCard from "@/components/profile/ProfileCard";
import BadgeTile from "@/components/ui/BadgeTile";
import Button from "@/components/ui/Button";
import MatchModal from "@/components/ui/MatchModal";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { fetchLikes, fetchProfile, sendSwipe, type LikeItem } from "../_lib/api";
import { useUserId } from "../_lib/useUserId";

export default function LikesPage() {
  const userId = useUserId();
  const { push } = useToast();
  const [items, setItems] = useState<LikeItem[] | null>(null);
  const [open, setOpen] = useState<LikeItem | null>(null);
  const [matched, setMatched] = useState<{ item: LikeItem; matchId?: string } | null>(null);
  const [meEmoji, setMeEmoji] = useState("🫵");

  useEffect(() => {
    if (!userId) return;
    fetchLikes(userId).then(setItems);
    fetchProfile(userId).then((p) => p && setMeEmoji(p.avatarEmoji));
  }, [userId]);

  async function respond(item: LikeItem, action: "like" | "pass") {
    if (!userId) return;
    setOpen(null);
    setItems((s) => s?.filter((i) => i.profile.id !== item.profile.id) ?? null);
    const res = await sendSwipe(userId, item.profile.id, action);
    if (action === "pass") push("Declined. Their perfect teammate is out there. Not here.");
    else setMatched({ item, matchId: res.match?.id }); // they already liked you, so accepting always matches
  }

  if (userId === null)
    return <div className="px-6 py-24 text-center"><p className="text-dim">Make a badge first. That&apos;s the whole login.</p><Button href="/onboarding" className="mt-6">Create profile</Button></div>;

  return (
    <div className="px-4 pt-5">
      <h1 className="font-display text-2xl font-extrabold">Likes you</h1>
      <p className="mt-1 text-sm text-dim">Accept to match and unlock chat. Decline to move on with your life.</p>

      {!items ? (
        <div className="mt-6 grid grid-cols-2 gap-3" aria-label="Counting your admirers">
          {[0, 1, 2, 3].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-slab" />)}
        </div>
      ) : items.length === 0 ? (
        <p className="py-24 text-center text-dim">Nobody yet. Your skills are loading. Please do not refresh your personality.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-3">
          {items.map((it) => (
            <li key={it.profile.id}>
              <BadgeTile profile={it.profile} score={it.compat.score} onClick={() => setOpen(it)} />
            </li>
          ))}
        </ul>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)}>
        {open && (
          <div className="space-y-4">
            <ProfileCard profile={open.profile} compat={open.compat} />
            <div className="grid grid-cols-2 gap-3">
              <Button variant="danger" onClick={() => respond(open, "pass")}>Decline</Button>
              <Button onClick={() => respond(open, "like")}>Accept</Button>
            </div>
          </div>
        )}
      </Modal>

      <MatchModal
        open={!!matched}
        onClose={() => setMatched(null)}
        meEmoji={meEmoji}
        otherEmoji={matched?.item.profile.avatarEmoji ?? "🤝"}
        otherName={matched?.item.profile.name ?? ""}
        chatHref={matched?.matchId ? `/matches/${matched.matchId}/chat` : "/matches"}
      />
    </div>
  );
}
