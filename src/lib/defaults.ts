import type { GalleryItem, HeroSlide, Service, SiteSettings } from "./types";

/** Royalty-free photos (Unsplash licence) bundled in /public/images. */
export const LOGO_URL = "/images/brand/logo.png";
export const ABOUT_IMAGES = {
  team: "/images/about/salon-team.webp",
  stylist: "/images/about/stylist-at-work.webp",
};

/** Default photo for each service, matched by slug (used until one is uploaded). */
export const SERVICE_IMAGES: Record<string, string> = {
  "signature-haircut": "/images/services/signature-haircut.webp",
  haircut: "/images/services/signature-haircut.webp",
  "global-hair-colour": "/images/services/global-hair-colour.webp",
  "hair-colour": "/images/services/global-hair-colour.webp",
  balayage: "/images/services/balayage.webp",
  ombre: "/images/services/ombre.webp",
  highlights: "/images/services/highlights.webp",
  nanoplastia: "/images/services/nanoplastia.webp",
  "hair-botox": "/images/services/hair-botox.webp",
  "protein-treatment": "/images/services/protein-treatment.webp",
  "hair-spa": "/images/services/hair-spa.webp",
  "hair-straightening": "/images/services/hair-straightening.webp",
  straightening: "/images/services/hair-straightening.webp",
  perming: "/images/services/perming.webp",
  perm: "/images/services/perming.webp",
};

/** Best-effort match: exact slug first, then a keyword contained in the slug. */
export function defaultServiceImage(slug: string): string | null {
  if (SERVICE_IMAGES[slug]) return SERVICE_IMAGES[slug];
  const rules: [RegExp, string][] = [
    [/balayage/, "balayage"],
    [/ombre/, "ombre"],
    [/highlight/, "highlights"],
    [/nano|smooth|keratin/, "nanoplastia"],
    [/botox/, "hair-botox"],
    [/protein/, "protein-treatment"],
    [/spa|wash/, "hair-spa"],
    [/straight|rebond/, "hair-straightening"],
    [/perm|curl/, "perming"],
    [/colou?r|global/, "global-hair-colour"],
    [/cut|trim|style|fade|beard/, "signature-haircut"],
  ];
  const hit = rules.find(([re]) => re.test(slug));
  return hit ? SERVICE_IMAGES[hit[1]] : null;
}

const G: [string, GalleryItem["category"], string][] = [
  ["look-01", "Haircuts", "Precision scissor work"],
  ["look-02", "Haircuts", "Detail texturising"],
  ["look-03", "Haircuts", "Classic men's cut"],
  ["look-04", "Haircuts", "Fresh cut & finish"],
  ["look-05", "Styling", "Blow-dry & style"],
  ["look-06", "Colour", "Silver-ash waves"],
  ["look-07", "Colour", "Soft blonde melt"],
  ["look-08", "Colour", "Sun-kissed balayage"],
  ["look-09", "Colour", "Foil highlights"],
  ["look-10", "Colour", "Lived-in bob colour"],
  ["look-11", "Colour", "Dimensional brunette"],
  ["look-12", "Treatments", "Relaxing hair wash"],
  ["look-13", "Treatments", "Scalp & hair ritual"],
  ["look-14", "Styling", "Defined curls"],
  ["look-15", "Styling", "Soft glam waves"],
  ["look-16", "Salon", "Our styling stations"],
  ["look-17", "Salon", "Bright & welcoming"],
  ["look-18", "Salon", "Retail corner"],
];

export const DEFAULT_GALLERY: GalleryItem[] = G.map(([file, category, caption], i) => ({
  id: `default-${file}`,
  imageUrl: `/images/gallery/${file}.webp`,
  caption,
  category,
  order: i,
  createdAt: "",
}));

export const BRAND = {
  name: "Darjeeling Hair Company",
  short: "DHC",
  tagline: "Unisex Salon · Darjeeling",
  founder: "Pranay Chettri",
  founded: 2021,
  experienceYears: 17,
  team: 3,
  academy: "Toni&Guy, Mumbai",
} as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: "+91 73841 63348",
  whatsapp: "917384163348",
  email: "pranaychettri04@gmail.com",
  addressLine1: "Shop No. 5, Ground Floor, Jai Complex",
  addressLine2: "",
  city: "Darjeeling, West Bengal",
  pincode: "734101",
  googleMapsUrl: "https://maps.app.goo.gl/ZfgK4yPoRgzG8pmK7",
  appleMapsUrl: "https://maps.apple/p/rqYsgLtejfDaWS",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Jai+Complex,+Darjeeling,+West+Bengal+734101&output=embed",
  instagramUrl: "https://www.instagram.com/pranayzh_chettri",
  facebookUrl: "https://www.facebook.com/share/1FnMJpJA1v/",
  hours: [{ label: "Monday – Sunday", value: "10:00 AM – 8:00 PM" }],
  announcement: "",
};

export const DEFAULT_HERO: HeroSlide[] = [
  {
    id: "default-1",
    imageUrl: "/images/hero/hero-1.webp",
    eyebrow: "Unisex Salon · Est. 2021",
    title: "Hair, crafted with",
    highlight: "17 years of artistry",
    subtitle:
      "Toni&Guy-trained styling, L'Oréal Professionnel colour and treatments — right here in the heart of Darjeeling.",
    ctaLabel: "Book an appointment",
    ctaHref: "/contact#book",
    active: true,
    order: 0,
  },
  {
    id: "default-2",
    imageUrl: "/images/hero/hero-2.webp",
    eyebrow: "Cuts · Fades · Beard",
    title: "Sharp cuts for",
    highlight: "every style",
    subtitle: "From classic gentlemen's cuts to modern textured styles — precision you can see and feel.",
    ctaLabel: "Explore services",
    ctaHref: "/services",
    active: true,
    order: 1,
  },
  {
    id: "default-3",
    imageUrl: "/images/hero/hero-3.webp",
    eyebrow: "Colour · Treatments · Care",
    title: "Colour that",
    highlight: "turns heads",
    subtitle: "Balayage, ombré, highlights, nanoplastia and hair botox with genuine L'Oréal Professionnel products.",
    ctaLabel: "Book your colour",
    ctaHref: "/contact?service=Balayage#book",
    active: true,
    order: 2,
  },
];

type StarterService = Omit<Service, "id" | "imageUrl" | "customImage" | "slug" | "active" | "order">;

export const STARTER_SERVICES: StarterService[] = [
  {
    title: "Signature Haircut",
    category: "Cut & Style",
    description:
      "A consultation-led cut tailored to your face shape, hair texture and lifestyle — finished with a wash and style.",
    price: "On consultation",
    duration: "",
    featured: true,
  },
  {
    title: "Global Hair Colour",
    category: "Colour",
    description:
      "Rich, even, all-over colour using L'Oréal Professionnel shades for lasting shine and grey coverage.",
    price: "On consultation",
    duration: "",
    featured: true,
  },
  {
    title: "Balayage",
    category: "Colour",
    description:
      "Hand-painted, sun-kissed dimension that grows out softly — low maintenance, high impact.",
    price: "On consultation",
    duration: "",
    featured: true,
  },
  {
    title: "Ombré",
    category: "Colour",
    description:
      "A seamless dark-to-light gradient from root to tip for a bold yet effortless finish.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
  {
    title: "Highlights",
    category: "Colour",
    description: "Classic or babylight highlights placed precisely to brighten and add movement.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
  {
    title: "Nanoplastia",
    category: "Texture",
    description:
      "A smoothing treatment that reduces frizz and leaves hair silky, straighter and easier to manage.",
    price: "On consultation",
    duration: "",
    featured: true,
  },
  {
    title: "Hair Botox",
    category: "Treatment",
    description:
      "Deep-conditioning repair that fills damaged fibres, restoring softness, volume and shine.",
    price: "On consultation",
    duration: "",
    featured: true,
  },
  {
    title: "Protein Treatment",
    category: "Treatment",
    description: "Rebuilds strength in weak, chemically-treated or breakage-prone hair.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
  {
    title: "Hair Spa",
    category: "Treatment",
    description:
      "A relaxing ritual of cleanse, mask and massage to nourish the scalp and revive tired hair.",
    price: "On consultation",
    duration: "",
    featured: true,
  },
  {
    title: "Hair Straightening",
    category: "Texture",
    description: "Long-lasting sleek, straight hair with a natural fall and mirror-like shine.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
  {
    title: "Perming",
    category: "Texture",
    description: "Soft waves to defined curls — modern perms designed to look natural and last.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
];

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export const DEFAULT_SERVICES: Service[] = STARTER_SERVICES.map((s, i) => ({
  ...s,
  id: `default-${i}`,
  slug: slugify(s.title),
  imageUrl: defaultServiceImage(slugify(s.title)),
  customImage: false,
  active: true,
  order: i,
}));

export const PRODUCTS = [
  { name: "Shampoo", note: "Professional cleansing for every hair type" },
  { name: "Hair Mask", note: "Intensive nourishment & repair" },
  { name: "Serum", note: "Frizz control and glass-like shine" },
  { name: "Wax", note: "Flexible hold with natural texture" },
  { name: "Clay", note: "Matte finish, strong all-day hold" },
] as const;
