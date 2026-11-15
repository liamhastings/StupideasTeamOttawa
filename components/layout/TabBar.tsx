"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchLikes } from "@/app/matches/_lib/api";
import { useUserId } from "@/app/matches/_lib/useUserId";
import { ChatIcon, FlameIcon, HeartIcon, UserIcon } from "@/components/ui/Icons";

const tabs = [
  { href: "/discover", label: "Discover", Icon: FlameIcon, on: (p: string) => p.startsWith("/discover") },
  { href: "/matches/requests", label: "Likes", Icon: HeartIcon, on: (p: string) => p.startsWith("/matches/requests") },
  { href: "/matches", label: "Matches", Icon: ChatIcon, on: (p: string) => p.startsWith("/matches") && !p.startsWith("/matches/requests") },
  { href: "/profile", label: "Profile", Icon: UserIcon, on: (p: string) => p.startsWith("/profile") },
];

export default function TabBar() {
  const path = usePathname();
  const userId = useUserId();
  const [pending, setPending] = useState(0);

  useEffect(() => {
    if (userId) fetchLikes(userId).then((l) => setPending(l.length));
  }, [userId, path]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-edge bg-floor/95 backdrop-blur" aria-label="Main">
      <ul className="mx-auto grid max-w-xl grid-cols-4 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ href, label, Icon, on }) => {
          const active = on(path);
          return (
            <li key={href}>
              <Link href={href} className={`relative flex flex-col items-center gap-1 py-2.5 text-xs font-semibold ${active ? "text-hi" : "text-dim"}`}>
                <Icon className="h-6 w-6" />
                {label}
                {label === "Likes" && pending > 0 && (
                  <span className="absolute right-[28%] top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-ship px-1 text-[10px] font-bold text-ink">{pending}</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
