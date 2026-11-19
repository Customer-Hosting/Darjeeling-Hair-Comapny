import { Globe } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "./Brand";
import { SOCIAL_META } from "@/lib/settings";
import type { SocialLink, SocialPlatform } from "@/lib/types";

type P = { className?: string };

const YouTube = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </svg>
);
const LinkedIn = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4V9.5Z" />
  </svg>
);
const XLogo = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.8L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" />
  </svg>
);
const TikTok = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M16.6 3c.3 2.2 1.6 3.6 3.9 3.8v2.9a7 7 0 0 1-3.8-1.2v5.9c0 3.6-2.6 6.1-6 6.1a5.8 5.8 0 0 1-5.9-5.8c0-3.5 3-6.2 6.7-5.7v3a2.8 2.8 0 0 0-3.6 2.7 2.8 2.8 0 0 0 2.9 2.8c1.6 0 2.8-1.1 2.8-3.2V3h3Z" />
  </svg>
);
const Pinterest = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.5 1.8-2.5.9 0 1.3.7 1.3 1.5 0 .9-.6 2.2-.9 3.4-.2 1 .5 1.9 1.6 1.9 1.9 0 3.3-2 3.3-4.9 0-2.5-1.8-4.3-4.4-4.3a4.6 4.6 0 0 0-4.8 4.6c0 .9.3 1.9.8 2.4.1.1.1.2.1.3l-.3 1.2c0 .2-.2.3-.4.2-1.4-.7-2.2-2.7-2.2-4.3 0-3.5 2.5-6.7 7.3-6.7 3.8 0 6.8 2.7 6.8 6.4 0 3.8-2.4 6.9-5.8 6.9-1.1 0-2.2-.6-2.6-1.3l-.7 2.7c-.3 1-1 2.2-1.4 2.9A10 10 0 1 0 12 2Z" />
  </svg>
);
const Threads = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" className={className} aria-hidden>
    <path d="M16.5 11.2c-.6-2.6-2.5-3.7-4.6-3.7-2.4 0-4 1.6-4 1.6M16.7 11.3c-3.3-.9-7.7-.6-7.4 2.3.3 2.6 5.4 2.9 6.9-.6 1.6-3.6-1-8.5-5.8-8-4.6.5-6.4 4.5-6.4 7.6 0 4.6 3 8 7.6 8 4.1 0 6.7-2.3 6.7-5.3 0-1.9-1.1-3.3-1.6-4Z" />
  </svg>
);
const Google = ({ className }: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M21.6 10.2H12v3.9h5.5c-.5 2.4-2.6 4-5.5 4a6.1 6.1 0 1 1 3.9-10.8l2.8-2.7A10 10 0 1 0 12 22c5.8 0 9.8-4 9.8-9.8 0-.7-.1-1.3-.2-2Z" />
  </svg>
);
const Website = ({ className }: P) => <Globe className={className} strokeWidth={1.8} aria-hidden />;

const ICONS: Record<SocialPlatform, (p: P) => React.ReactNode> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  youtube: YouTube,
  linkedin: LinkedIn,
  x: XLogo,
  tiktok: TikTok,
  pinterest: Pinterest,
  threads: Threads,
  google: Google,
  website: Website,
};

export function SocialIcon({ platform, className }: { platform: SocialPlatform; className?: string }) {
  const Icon = ICONS[platform] ?? Website;
  return <Icon className={className} />;
}

/** Renders a row of linked social icons. `itemClassName` styles each circle/button. */
export function SocialLinks({
  socials,
  itemClassName,
  iconClassName = "size-[18px]",
}: {
  socials: SocialLink[];
  itemClassName: string;
  iconClassName?: string;
}) {
  return (
    <>
      {socials.map((s, i) => (
        <a
          key={`${s.platform}-${i}`}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          aria-label={SOCIAL_META[s.platform]?.label ?? "Social profile"}
          title={SOCIAL_META[s.platform]?.label}
          className={itemClassName}
        >
          <SocialIcon platform={s.platform} className={iconClassName} />
        </a>
      ))}
    </>
  );
}
