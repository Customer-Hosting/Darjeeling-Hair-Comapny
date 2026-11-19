import { CATEGORY_ICONS, type CategoryIcon } from "./types";

/** Editable content of the About page (managed by the Super Admin). */
export type AboutStat = { value: string; label: string };
export type AboutItem = { title: string; text: string };
export type AboutValue = AboutItem & { icon: CategoryIcon };

export type AboutContent = {
  header: { eyebrow: string; title: string; intro: string };
  founder: {
    eyebrow: string;
    name: string;
    /** Paragraphs separated by a blank line. */
    body: string;
    highlights: string[];
    /** Resolved image URL (uploaded photo or the bundled default). */
    imageUrl: string;
    /** true when the admin uploaded a photo. */
    customImage: boolean;
    showFollowButton: boolean;
  };
  stats: AboutStat[];
  journey: { eyebrow: string; title: string; items: AboutItem[] };
  values: { eyebrow: string; title: string; items: AboutValue[] };
  seo: { title: string; description: string };
};

export const DEFAULT_ABOUT_IMAGE = "/images/about/stylist-at-work.webp";

export const DEFAULT_ABOUT: AboutContent = {
  header: {
    eyebrow: "About us",
    title: "A Salon Built on *Craft & Care*",
    intro:
      "Where international training meets mountain warmth — a space designed to make every guest look and feel their absolute best.",
  },
  founder: {
    eyebrow: "Meet the founder",
    name: "Pranay Chettri",
    body:
      "With hair education from Toni&Guy, Mumbai and 17 years in the glamour industry, Pranay founded Darjeeling Hair Company in 2021 with one simple belief: everyone in Darjeeling deserves world-class hair without leaving the hills.\n\nEvery cut, colour and treatment at the salon follows the same approach — listen carefully, recommend honestly, and finish with care, using professional L'Oréal products.",
    highlights: ["Toni&Guy Mumbai hair education", "17 years of hands-on experience", "Specialist in colour, cuts & treatments"],
    imageUrl: DEFAULT_ABOUT_IMAGE,
    customImage: false,
    showFollowButton: true,
  },
  stats: [
    { value: "17+", label: "Years of experience" },
    { value: "3", label: "Skilled stylists" },
    { value: "11+", label: "Specialist services" },
    { value: "2021", label: "Established" },
  ],
  journey: {
    eyebrow: "Our story",
    title: "From the Academy to the Hills",
    items: [
      { title: "Trained at Toni&Guy, Mumbai", text: "Hair education at one of the most respected names in hairdressing — where precision and creativity meet." },
      { title: "17 years in the glamour industry", text: "Nearly two decades of cutting, colouring and transforming hair for every kind of client." },
      { title: "2021 — Darjeeling Hair Company opens", text: "A modern unisex salon at Jai Complex, bringing big-city craft home to the hills." },
      { title: "Today", text: "A skilled team, L'Oréal Professionnel products and a growing family of happy clients." },
    ],
  },
  values: {
    eyebrow: "What we believe",
    title: "Our Values",
    items: [
      { icon: "heart", title: "Consultation first", text: "We listen before we cut. Every service starts with understanding your hair, routine and goals." },
      { icon: "user", title: "Truly unisex", text: "Sharp fades to soft balayage — a welcoming chair for every person and every style." },
      { icon: "sparkles", title: "Honest care", text: "Professional products, hygienic tools and advice you can trust for healthy hair at home." },
    ],
  },
  seo: {
    title: "About Us — Pranay Chettri, Toni&Guy-Trained Stylist",
    description:
      "Meet Pranay Chettri, Toni&Guy Mumbai-trained founder of Darjeeling Hair Company — 17 years in the glamour industry. A premium unisex salon since 2021.",
  },
};

const str = (v: unknown, d: string) => (typeof v === "string" ? v : d);
const isIcon = (v: unknown): v is CategoryIcon => typeof v === "string" && (CATEGORY_ICONS as readonly string[]).includes(v);

/** Merges a stored document with the defaults so the page always renders. */
export function normalizeAbout(raw: Record<string, unknown> | null | undefined, imageUrl?: string | null): AboutContent {
  const d = DEFAULT_ABOUT;
  if (!raw) return d;
  const o = raw as Partial<Record<keyof AboutContent, Record<string, unknown>>> & { stats?: unknown };
  const h = o.header ?? {};
  const f = o.founder ?? {};
  const j = o.journey ?? {};
  const v = o.values ?? {};
  const s = o.seo ?? {};
  const items = <T,>(x: unknown, map: (e: Record<string, unknown>) => T | null, fallback: T[]) =>
    Array.isArray(x) ? (x.map((e) => map((e ?? {}) as Record<string, unknown>)).filter(Boolean) as T[]) : fallback;
  return {
    header: { eyebrow: str(h.eyebrow, d.header.eyebrow), title: str(h.title, d.header.title), intro: str(h.intro, d.header.intro) },
    founder: {
      eyebrow: str(f.eyebrow, d.founder.eyebrow),
      name: str(f.name, d.founder.name),
      body: str(f.body, d.founder.body),
      highlights: Array.isArray(f.highlights) ? f.highlights.filter((x): x is string => typeof x === "string" && !!x.trim()) : d.founder.highlights,
      imageUrl: imageUrl || DEFAULT_ABOUT_IMAGE,
      customImage: !!imageUrl,
      showFollowButton: typeof f.showFollowButton === "boolean" ? f.showFollowButton : d.founder.showFollowButton,
    },
    stats: items<AboutStat>(o.stats, (e) => (str(e.value, "").trim() ? { value: str(e.value, ""), label: str(e.label, "") } : null), d.stats),
    journey: {
      eyebrow: str(j.eyebrow, d.journey.eyebrow),
      title: str(j.title, d.journey.title),
      items: items<AboutItem>(j.items, (e) => (str(e.title, "").trim() ? { title: str(e.title, ""), text: str(e.text, "") } : null), d.journey.items),
    },
    values: {
      eyebrow: str(v.eyebrow, d.values.eyebrow),
      title: str(v.title, d.values.title),
      items: items<AboutValue>(
        v.items,
        (e) => (str(e.title, "").trim() ? { title: str(e.title, ""), text: str(e.text, ""), icon: isIcon(e.icon) ? e.icon : "sparkles" } : null),
        d.values.items,
      ),
    },
    seo: { title: str(s.title, d.seo.title), description: str(s.description, d.seo.description) },
  };
}
