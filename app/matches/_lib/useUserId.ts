"use client";
import { useSyncExternalStore } from "react";
import { getUserId } from "@/lib/session";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

/** undefined = still reading (server render), null = not signed in, string = user id. */
export function useUserId(): string | null | undefined {
  return useSyncExternalStore<string | null | undefined>(subscribe, getUserId, () => undefined);
}
