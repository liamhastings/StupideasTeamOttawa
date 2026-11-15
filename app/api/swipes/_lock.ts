// Tiny in-process mutex. lib/store.ts is read-modify-write on a JSON file, so two
// concurrent swipes (double-click!) could both miss each other and create two matches.
// Keyed on globalThis so every route bundle shares the same queue.
const KEY = "__grinder_swipe_lock__";
type G = typeof globalThis & { [KEY]?: Promise<unknown> };

export function withSwipeLock<T>(fn: () => Promise<T>): Promise<T> {
  const g = globalThis as G;
  const prev = g[KEY] ?? Promise.resolve();
  const run = prev.then(fn, fn);
  g[KEY] = run.catch(() => undefined); // a failure must not wedge the queue
  return run;
}
