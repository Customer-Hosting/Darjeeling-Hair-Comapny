import Image from "next/image";
import logo from "../../../public/images/brand/logo.png";
import { cn } from "@/lib/cn";

const SIZES = {
  sm: "w-[64px] md:w-[72px]",
  md: "w-[110px]",
  lg: "w-[170px]",
  xl: "w-[240px] md:w-[300px]",
} as const;

/** The salon's official neon logo. */
export function BrandLogo({
  size = "md",
  className,
  glow = false,
  priority = false,
}: {
  size?: keyof typeof SIZES;
  className?: string;
  glow?: boolean;
  priority?: boolean;
}) {
  return (
    <Image
      src={logo}
      alt="The Darjeeling Hair Company — Unisex Salon"
      preload={priority}
      sizes="(min-width:768px) 300px, 240px"
      className={cn("h-auto select-none", SIZES[size], glow && "animate-glow", className)}
    />
  );
}
