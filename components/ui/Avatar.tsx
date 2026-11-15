export default function Avatar({ emoji, size = 48, ring = false }: { emoji: string; size?: number; ring?: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid shrink-0 place-items-center rounded-full bg-slab ${ring ? "ring-2 ring-hi ring-offset-2 ring-offset-floor" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.52 }}
    >
      {emoji}
    </span>
  );
}
