// When the hackathon ends. Set NEXT_PUBLIC_DEADLINE (ISO string) for the real demo.
// Otherwise each browser gets 36 hours from its first visit.
export function getDeadline(): number {
  const env = process.env.NEXT_PUBLIC_DEADLINE;
  if (env && !Number.isNaN(Date.parse(env))) return Date.parse(env);
  const fallback = Date.now() + 36 * 3600 * 1000;
  try {
    const saved = Number(localStorage.getItem("grinder_deadline"));
    if (saved) return saved;
    localStorage.setItem("grinder_deadline", String(fallback));
  } catch {}
  return fallback;
}
