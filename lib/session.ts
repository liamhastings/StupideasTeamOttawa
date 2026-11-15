// Client-side "auth": the user's profile id lives in localStorage.
const KEY = "grinder_user_id";

export function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
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
