import Image from "next/image";
import logo from "../../../public/images/brand/logo.png";
import { cn } from "@/lib/cn";

/** The neon logo sits on a dark circular badge so it reads well on light backgrounds. */
export function LogoBadge({ className, priority }: { className?: string; priority?: boolean }) {
  return (
    <span className={cn("inline-grid aspect-square place-items-center rounded-full bg-espresso p-[7%] shadow-[0_6px_18px_-8px_rgba(42,29,23,.6)]", className)}>
      <Image src={logo} alt="The Darjeeling Hair Company — Unisex Salon" priority={priority} sizes="120px" className="h-auto w-full" />
    </span>
  );
}
