import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";
const styles: Record<Variant, string> = {
  primary: "bg-hi text-ink hover:brightness-95",
  ghost: "border border-edge text-snow hover:bg-slab",
  danger: "border border-ship/50 text-ship hover:bg-ship/10",
};
const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-bold transition active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; href?: string };

export default function Button({ variant = "primary", href, className = "", children, ...rest }: Props) {
  const cls = `${base} ${styles[variant]} ${className}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls} {...rest}>{children}</button>;
}
