import Image from "next/image";
import Link from "next/link";
import logo from "@/public/Grinder-logo.png";

export default function Logo({ size = "md" }: { size?: "md" | "lg" }) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2"
      aria-label="Grinder home"
    >
      <Image
        src={logo}
        alt="Grinder"
        priority
        className={size === "lg" ? "h-10 w-auto" : "h-[30px] w-auto"}
      />
    </Link>
  );
}
