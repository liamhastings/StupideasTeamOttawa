"use client";
import Avatar from "./Avatar";
import Button from "./Button";
import Modal from "./Modal";

type Props = { open: boolean; onClose: () => void; meEmoji: string; otherEmoji: string; otherName: string; chatHref: string };

export default function MatchModal({ open, onClose, meEmoji, otherEmoji, otherName, chatHref }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="py-4 text-center">
        <div className="flex justify-center">
          <span className="merge-left"><Avatar emoji={meEmoji} size={88} ring /></span>
          <span className="merge-right"><Avatar emoji={otherEmoji} size={88} ring /></span>
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
