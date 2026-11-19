import type { CategoryIcon, GalleryItem, HeroSlide, Product, ProductCategory, Service, ServiceCategory, SiteSettings } from "./types";

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
  // featured haircut styles (salon photos)
  "butterfly-haircut": "/images/gallery/style-butterfly-haircut.webp",
  "layered-bob": "/images/gallery/style-layer-bob.webp",
  "long-layers": "/images/gallery/style-long-layers.webp",
  "wolf-cut": "/images/gallery/style-wolf-cut.webp",
  "low-fade": "/images/gallery/style-low-fade.webp",
  "taper-fade": "/images/gallery/style-taper-fade.webp",
};

/** Best-effort match: exact slug first, then a keyword contained in the slug. */
export function defaultServiceImage(slug: string): string | null {
  if (SERVICE_IMAGES[slug]) return SERVICE_IMAGES[slug];
  const rules: [RegExp, string][] = [
    [/butterfly/, "butterfly-haircut"],
    [/bob/, "layered-bob"],
    [/long-layer/, "long-layers"],
    [/wolf/, "wolf-cut"],
    [/low-fade/, "low-fade"],
    [/taper/, "taper-fade"],
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
  ["style-butterfly-haircut", "Haircuts", "Butterfly Haircut"],
  ["style-layer-bob", "Haircuts", "Layered Bob"],
  ["style-long-layers", "Haircuts", "Long Layers"],
  ["style-wolf-cut", "Haircuts", "Wolf Cut"],
  ["style-low-fade", "Haircuts", "Low Fade"],
  ["style-taper-fade", "Haircuts", "Taper Fade"],
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

/** The salon's featured haircut styles (shown first in the gallery's Haircuts). */
export const HAIRCUT_STYLES = G_STYLES();
function G_STYLES() {
  return [
    ["style-butterfly-haircut", "Butterfly Haircut"],
    ["style-layer-bob", "Layered Bob"],
    ["style-long-layers", "Long Layers"],
    ["style-wolf-cut", "Wolf Cut"],
    ["style-low-fade", "Low Fade"],
    ["style-taper-fade", "Taper Fade"],
  ] as const;
}

/** Product photos for the gallery's "Products" category. */
const G_PRODUCTS: [string, string][] = [
  ["product-01", "Professional hair care on our shelves"],
  ["product-02", "Treatment oils & serums"],
  ["product-03", "Lightweight finishing serum"],
  ["product-04", "Nourishing hair oil"],
  ["product-05", "Salon-grade care to take home"],
];

const toGallery = ([file, category, caption]: [string, GalleryItem["category"], string], i: number): GalleryItem => ({
  id: `default-${file}`,
  imageUrl: `/images/gallery/${file}.webp`,
  caption,
  category,
  order: i,
  createdAt: "",
});

export const DEFAULT_PRODUCT_GALLERY: GalleryItem[] = G_PRODUCTS.map(([file, caption], i) =>
  toGallery([file, "Products", caption], G.length + i),
);

export const DEFAULT_GALLERY: GalleryItem[] = [...G.map(toGallery), ...DEFAULT_PRODUCT_GALLERY];

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
  extraPhones: [],
  extraEmails: [],
  addressLine1: "Shop No. 5, Ground Floor, Jai Complex",
  addressLine2: "",
  city: "Darjeeling, West Bengal",
  pincode: "734101",
  googleMapsUrl: "https://maps.app.goo.gl/ZfgK4yPoRgzG8pmK7",
  appleMapsUrl: "https://maps.apple/p/rqYsgLtejfDaWS",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Jai+Complex,+Darjeeling,+West+Bengal+734101&output=embed",
  socials: [
    { platform: "instagram", url: "https://www.instagram.com/pranayzh_chettri" },
    { platform: "facebook", url: "https://www.facebook.com/share/1FnMJpJA1v/" },
  ],
  hours: [{ label: "Monday – Sunday", value: "10:00 AM – 8:00 PM" }],
  announcement: "",
  heroSlider: { autoplay: true, interval: 6, pauseOnHover: false },
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

type StarterServiceCategory = Omit<ServiceCategory, "id" | "order">;

/** The salon's starting service categories — the Super Admin can add, rename, reorder or remove them. */
export const STARTER_SERVICE_CATEGORIES: StarterServiceCategory[] = [
  { name: "Cut & Style", slug: "cut-style", icon: "scissors", description: "Precision cuts and finishing styles for men and women." },
  { name: "Colour", slug: "colour", icon: "palette", description: "Global colour, balayage, ombré and highlights." },
  { name: "Treatment", slug: "treatment", icon: "droplets", description: "Repair, strengthen and nourish — from hair spa to botox." },
  { name: "Texture", slug: "texture", icon: "waves", description: "Smoothing, straightening and perming services." },
];

export const DEFAULT_SERVICE_CATEGORIES: ServiceCategory[] = STARTER_SERVICE_CATEGORIES.map((c, i) => ({
  ...c,
  id: `default-svc-${c.slug}`,
  order: i,
}));

/** Icon used when a category has none (or for unknown legacy names). */
export function iconForCategoryName(name: string): CategoryIcon {
  return STARTER_SERVICE_CATEGORIES.find((c) => c.name === name)?.icon ?? "scissors";
}

type StarterService = Omit<
  Service,
  "id" | "imageUrl" | "customImage" | "slug" | "active" | "order" | "categoryId" | "categoryIcon"
>;

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
  {
    title: "Butterfly Haircut",
    category: "Cut & Style",
    description: "Face-framing layers that flutter around the face for volume and movement — long hair with the bounce of a shorter cut.",
    price: "On consultation",
    duration: "",
    featured: true,
  },
  {
    title: "Layered Bob",
    category: "Cut & Style",
    description: "A chic bob with soft internal layers for bounce, movement and easy everyday styling.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
  {
    title: "Long Layers",
    category: "Cut & Style",
    description: "Seamless long layers that remove bulk and add flow while keeping your length.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
  {
    title: "Wolf Cut",
    category: "Cut & Style",
    description: "A textured, shaggy cut with choppy layers on top and lighter lengths — bold and low-maintenance.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
  {
    title: "Low Fade",
    category: "Cut & Style",
    description: "A clean men's fade that starts low around the ears and neckline for a sharp yet subtle finish.",
    price: "On consultation",
    duration: "",
    featured: false,
  },
  {
    title: "Taper Fade",
    category: "Cut & Style",
    description: "A gradual taper at the sides and neckline that keeps the look neat, modern and versatile.",
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
  categoryId: DEFAULT_SERVICE_CATEGORIES.find((c) => c.name === s.category)?.id ?? "",
  categoryIcon: iconForCategoryName(s.category),
  id: `default-${i}`,
  slug: slugify(s.title),
  imageUrl: defaultServiceImage(slugify(s.title)),
  customImage: false,
  active: true,
  order: i,
}));

/* ───────────────────────── Retail products ───────────────────────── */

export const DEFAULT_BRAND = "L'Oréal Professionnel";

type StarterCategory = Omit<ProductCategory, "id" | "order">;
export const STARTER_PRODUCT_CATEGORIES: StarterCategory[] = [
  { name: "Shampoo", slug: "shampoo", description: "Professional cleansing matched to your hair type and colour." },
  { name: "Hair Mask", slug: "hair-mask", description: "Intensive weekly nourishment and repair." },
  { name: "Serum", slug: "serum", description: "Frizz control, protection and glass-like shine." },
  { name: "Styling", slug: "styling", description: "Wax and clay for hold, texture and a finished look." },
];

/** Default photo for a product, matched by slug keywords (used until one is uploaded). */
export const PRODUCT_IMAGES: Record<string, string> = {
  "repair-shampoo": "/images/products/repair-shampoo.webp",
  "colour-care-shampoo": "/images/products/colour-care-shampoo.webp",
  "deep-repair-mask": "/images/products/deep-repair-mask.webp",
  "hydrating-hair-mask": "/images/products/hydrating-hair-mask.webp",
  "smoothing-serum": "/images/products/smoothing-serum.webp",
  "shine-serum": "/images/products/shine-serum.webp",
  "styling-wax": "/images/products/styling-wax.webp",
  "matte-styling-clay": "/images/products/matte-styling-clay.webp",
};

export function defaultProductImage(slug: string): string | null {
  if (PRODUCT_IMAGES[slug]) return PRODUCT_IMAGES[slug];
  const rules: [RegExp, string][] = [
    [/colou?r/, "colour-care-shampoo"],
    [/shampoo|cleans/, "repair-shampoo"],
    [/hydrat|moist/, "hydrating-hair-mask"],
    [/mask|conditioner|treatment/, "deep-repair-mask"],
    [/shine|oil/, "shine-serum"],
    [/serum|smooth|frizz/, "smoothing-serum"],
    [/clay|paste|matte/, "matte-styling-clay"],
    [/wax|pomade|gel|styl/, "styling-wax"],
  ];
  const hit = rules.find(([re]) => re.test(slug));
  return hit ? PRODUCT_IMAGES[hit[1]] : null;
}

type StarterProduct = Omit<Product, "id" | "slug" | "categoryId" | "imageUrl" | "customImage" | "active" | "order"> & {
  categorySlug: string;
};

/** Sample catalogue — the Super Admin replaces names, sizes & prices with the salon's actual stock. */
export const STARTER_PRODUCTS: StarterProduct[] = [
  { name: "Repair Shampoo", categorySlug: "shampoo", brand: DEFAULT_BRAND, size: "", price: "Ask in salon", description: "Gently cleanses and strengthens damaged, over-processed hair.", featured: true, inStock: true },
  { name: "Colour Care Shampoo", categorySlug: "shampoo", brand: DEFAULT_BRAND, size: "", price: "Ask in salon", description: "Keeps coloured hair vibrant and shiny for longer between visits.", featured: false, inStock: true },
  { name: "Deep Repair Mask", categorySlug: "hair-mask", brand: DEFAULT_BRAND, size: "", price: "Ask in salon", description: "A rich weekly treatment that restores softness and strength.", featured: true, inStock: true },
  { name: "Hydrating Hair Mask", categorySlug: "hair-mask", brand: DEFAULT_BRAND, size: "", price: "Ask in salon", description: "Instant moisture for dry, thirsty lengths and ends.", featured: false, inStock: true },
  { name: "Smoothing Serum", categorySlug: "serum", brand: DEFAULT_BRAND, size: "", price: "Ask in salon", description: "Tames frizz and flyaways for a sleek, polished finish.", featured: true, inStock: true },
  { name: "Shine Serum", categorySlug: "serum", brand: DEFAULT_BRAND, size: "", price: "Ask in salon", description: "A lightweight finishing touch for glass-like shine.", featured: false, inStock: true },
  { name: "Styling Wax", categorySlug: "styling", brand: DEFAULT_BRAND, size: "", price: "Ask in salon", description: "Flexible hold with natural texture — easy to restyle.", featured: true, inStock: true },
  { name: "Matte Styling Clay", categorySlug: "styling", brand: DEFAULT_BRAND, size: "", price: "Ask in salon", description: "Strong, all-day hold with a modern matte finish.", featured: false, inStock: true },
];

export const DEFAULT_PRODUCT_CATEGORIES: ProductCategory[] = STARTER_PRODUCT_CATEGORIES.map((c, i) => ({
  ...c,
  id: `default-cat-${c.slug}`,
  order: i,
}));

export const DEFAULT_PRODUCTS: Product[] = STARTER_PRODUCTS.map(({ categorySlug, ...p }, i) => {
  const slug = slugify(p.name);
  return {
    ...p,
    id: `default-product-${i}`,
    slug,
    categoryId: `default-cat-${categorySlug}`,
    imageUrl: defaultProductImage(slug),
    customImage: false,
    active: true,
    order: i,
  };
});
