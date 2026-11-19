import { SocialIcon } from "@/components/icons/Social";
import { SOCIAL_META } from "@/lib/settings";
import type { SiteSettings } from "@/lib/types";
import { cn } from "@/lib/cn";

/**
 * "Follow us" button. Prefers Instagram, falls back to the first configured
 * social profile, and renders nothing if the salon has no social links.
 */
export function FollowButton({ s, prefix = "Follow on", className }: { s: SiteSettings; prefix?: string; className?: string }) {
  const link = s.socials.find((x) => x.platform === "instagram") ?? s.socials[0];
  if (!link) return null;
  const label = link.platform === "website" ? "our website" : SOCIAL_META[link.platform].label;
  return (
    <a href={link.url} target="_blank" rel="noreferrer" className={cn("s-btn-outline", className)}>
      <SocialIcon platform={link.platform} className="size-4" /> {prefix} {label}
    </a>
  );
}
