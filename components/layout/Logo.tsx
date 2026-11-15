import Link from "next/link";

/** A yellow name badge with a lanyard slot. Same motif as the profile tiles. */
export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-9 w-9 text-xl" : "h-7 w-7 text-base";
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Grinder home">
      <span className={`relative grid ${box} place-items-center rounded-lg bg-hi pt-1 font-display font-black text-ink`}>
        <span aria-hidden className="absolute left-1/2 top-1 h-[3px] w-3 -translate-x-1/2 rounded-full bg-floor" />
        g
      </span>
      <span className="font-display text-lg font-extrabold tracking-tight">grinder</span>
    </Link>
  );
}
