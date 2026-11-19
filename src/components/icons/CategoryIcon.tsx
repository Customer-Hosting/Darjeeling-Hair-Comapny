import {
  Crown,
  Droplets,
  Flower2,
  Gem,
  Heart,
  Paintbrush,
  Palette,
  Scissors,
  Sparkles,
  UserRound,
  Waves,
  Wind,
  type LucideIcon,
} from "lucide-react";
import type { CategoryIcon as IconKey } from "@/lib/types";

export const CATEGORY_ICON_MAP: Record<IconKey, LucideIcon> = {
  scissors: Scissors,
  palette: Palette,
  droplets: Droplets,
  waves: Waves,
  sparkles: Sparkles,
  wind: Wind,
  flower: Flower2,
  crown: Crown,
  gem: Gem,
  heart: Heart,
  brush: Paintbrush,
  user: UserRound,
};

export const CATEGORY_ICON_LABELS: Record<IconKey, string> = {
  scissors: "Scissors",
  palette: "Palette",
  droplets: "Droplets",
  waves: "Waves",
  sparkles: "Sparkles",
  wind: "Blow-dry",
  flower: "Flower",
  crown: "Crown",
  gem: "Gem",
  heart: "Heart",
  brush: "Brush",
  user: "Person",
};

export function CategoryIcon({ icon, className, strokeWidth }: { icon: IconKey; className?: string; strokeWidth?: number }) {
  const Icon = CATEGORY_ICON_MAP[icon] ?? Scissors;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}
