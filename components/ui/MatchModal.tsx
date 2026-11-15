"use client";
import Avatar from "./Avatar";
import Button from "./Button";
import Modal from "./Modal";

type Who = { name?: string; avatarUrl?: string };
type Props = { open: boolean; onClose: () => void; me: Who; other: Who; otherName: string; chatHref: string };

export default function MatchModal({ open, onClose, me, other, otherName, chatHref }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="py-4 text-center">
        <div className="flex justify-center">
          <span className="merge-left"><Avatar profile={me} size={88} ring /></span>
          <span className="merge-right"><Avatar profile={other} size={88} ring /></span>
        </div>
        <h2 className="mt-8 font-display text-3xl font-black leading-tight">It&apos;s a match.</h2>
        <p className="mx-auto mt-3 max-w-xs text-dim">
          You and {otherName} are now a potential team. Merge request approved, 0 conflicts. Say hi before the deadline does.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button href={chatHref}>Open chat</Button>
          <Button variant="ghost" onClick={onClose}>Keep browsing</Button>
        </div>
      </div>
    </Modal>
  );
}
