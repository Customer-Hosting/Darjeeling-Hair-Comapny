import { DEFAULT_SETTINGS } from "./defaults";
import {
  SOCIAL_PLATFORMS,
  type ContactEntry,
  type HeroSliderSettings,
  type SiteSettings,
  type SocialLink,
  type SocialPlatform,
} from "./types";

/** Display metadata for each supported social platform. */
export const SOCIAL_META: Record<SocialPlatform, { label: string; placeholder: string }> = {
  instagram: { label: "Instagram", placeholder: "https://www.instagram.com/yourprofile" },
  facebook: { label: "Facebook", placeholder: "https://www.facebook.com/yourpage" },
  youtube: { label: "YouTube", placeholder: "https://www.youtube.com/@yourchannel" },
  linkedin: { label: "LinkedIn", placeholder: "https://www.linkedin.com/in/yourprofile" },
  x: { label: "X (Twitter)", placeholder: "https://x.com/yourhandle" },
  tiktok: { label: "TikTok", placeholder: "https://www.tiktok.com/@yourhandle" },
  pinterest: { label: "Pinterest", placeholder: "https://www.pinterest.com/yourprofile" },
  threads: { label: "Threads", placeholder: "https://www.threads.net/@yourhandle" },
  google: { label: "Google reviews", placeholder: "https://g.page/r/your-business/review" },
  website: { label: "Website / other", placeholder: "https://…" },
};

const isPlatform = (v: unknown): v is SocialPlatform =>
  typeof v === "string" && (SOCIAL_PLATFORMS as readonly string[]).includes(v);

function cleanEntries(v: unknown): ContactEntry[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((e) => ({ label: String(e?.label ?? "").trim(), value: String(e?.value ?? "").trim() }))
    .filter((e) => e.value);
}

function cleanSocials(v: unknown): SocialLink[] {
  if (!Array.isArray(v)) return [];
  return v
    .map((s) => ({ platform: s?.platform, url: String(s?.url ?? "").trim() }))
    .filter((s): s is SocialLink => isPlatform(s.platform) && /^https?:\/\//.test(s.url));
}

/**
 * Normalises a settings document from the database into the current shape.
 * Handles older documents that stored `instagramUrl` / `facebookUrl` as fixed
 * fields by migrating them into the `socials` list — so no data is lost.
 */
export function normalizeSettings(raw: Record<string, unknown> | null | undefined): SiteSettings {
  if (!raw) return DEFAULT_SETTINGS;
  const { _id, instagramUrl, facebookUrl, ...rest } = raw as Record<string, unknown> & {
    instagramUrl?: string;
    facebookUrl?: string;
  };
  void _id;
  const merged = { ...DEFAULT_SETTINGS, ...rest } as SiteSettings;

  let socials: SocialLink[];
  if (Array.isArray(rest.socials)) {
    socials = cleanSocials(rest.socials);
  } else {
    // legacy document → migrate the two fixed fields
    socials = cleanSocials([
      { platform: "instagram", url: instagramUrl ?? "" },
      { platform: "facebook", url: facebookUrl ?? "" },
    ]);
    if (!socials.length && instagramUrl === undefined && facebookUrl === undefined) socials = DEFAULT_SETTINGS.socials;
  }

  return {
    ...merged,
    extraPhones: cleanEntries(rest.extraPhones),
    extraEmails: cleanEntries(rest.extraEmails),
    socials,
    hours: Array.isArray(merged.hours) ? merged.hours : DEFAULT_SETTINGS.hours,
    heroSlider: normalizeHeroSlider(rest.heroSlider),
  };
}

/** Validates/clamps slider settings from the database, falling back to defaults. */
export function normalizeHeroSlider(v: unknown): HeroSliderSettings {
  const d = DEFAULT_SETTINGS.heroSlider;
  const o = (v ?? {}) as Partial<HeroSliderSettings>;
  const interval = Number(o.interval);
  return {
    autoplay: typeof o.autoplay === "boolean" ? o.autoplay : d.autoplay,
    interval: Number.isFinite(interval) ? Math.min(30, Math.max(2, Math.round(interval))) : d.interval,
    pauseOnHover: typeof o.pauseOnHover === "boolean" ? o.pauseOnHover : d.pauseOnHover,
  };
}

/** First URL configured for a platform (e.g. for "Follow on Instagram" buttons). */
export function socialUrl(s: SiteSettings, platform: SocialPlatform): string | undefined {
  return s.socials.find((x) => x.platform === platform)?.url;
}

/** Digits-only tel: link value, keeping a leading "+". */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
