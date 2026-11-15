"use client";
import { usePathname } from "next/navigation";
import TabBar from "./TabBar";
import TopBar from "./TopBar";

/** Landing is full-width. Everything else is a phone-shaped column, like the apps we're parodying.
 *  Chat hides both bars (own header, full height). Onboarding hides the tab bar. */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path === "/") return <>{children}</>;
  const chat = /^\/matches\/[^/]+\/chat$/.test(path);
  const tabs = !chat && path !== "/onboarding";
  return (
    <div className="mx-auto min-h-dvh w-full max-w-xl bg-floor sm:border-x sm:border-edge">
      {!chat && <TopBar />}
      <main className={tabs ? "pb-24" : ""}>{children}</main>
      {tabs && <TabBar />}
    </div>
  );
}
