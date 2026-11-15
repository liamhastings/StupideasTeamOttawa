// Client-side "auth": the user's profile id lives in localStorage.
const KEY = "grinder_user_id";

/** Who you are during the demo (profile lives in data/seed.ts). */
export const DEMO_USER_ID = "demo_jensen";

// Demo mode: with nobody signed in, you are Jensen (see data/seed.ts). Onboarding
// a new profile still works and takes over; clearing it drops you back to Jensen.
export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY) ?? DEMO_USER_ID;
  } catch {
    return DEMO_USER_ID;
  }
}

export function setUserId(id: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, id);
}

export function clearUserId(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
