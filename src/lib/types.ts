export type HeroSlide = {
  id: string;
  imageUrl: string;
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  active: boolean;
  order: number;
};

/** Icons the admin can choose for a service category. */
export const CATEGORY_ICONS = [
  "scissors",
  "palette",
  "droplets",
  "waves",
  "sparkles",
  "wind",
  "flower",
  "crown",
  "gem",
  "heart",
  "brush",
  "user",
] as const;
export type CategoryIcon = (typeof CATEGORY_ICONS)[number];

/** A service category, managed by the Super Admin (e.g. "Colour"). */
export type ServiceCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: CategoryIcon;
  order: number;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  /** Category reference (id). */
  categoryId: string;
  /** Resolved category name, for display. */
  category: string;
  /** Resolved category icon, for display. */
  categoryIcon: CategoryIcon;
  description: string;
  price: string;
  duration: string;
  imageUrl: string | null;
  /** true when the admin uploaded a photo (false = bundled default photo) */
  customImage: boolean;
  featured: boolean;
  active: boolean;
  order: number;
};

export const GALLERY_CATEGORIES = [
  "Haircuts",
  "Colour",
  "Treatments",
  "Styling",
  "Products",
  "Salon",
] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** A retail product category, managed by the Super Admin (e.g. "Shampoo"). */
export type ProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  order: number;
};

/** A retail product sold in the salon. */
export type Product = {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  brand: string;
  size: string;
  price: string;
  description: string;
  imageUrl: string | null;
  /** true when the admin uploaded a photo (false = bundled sample photo) */
  customImage: boolean;
  featured: boolean;
  inStock: boolean;
  active: boolean;
  order: number;
};

/** Service categories + services, delivered together so ids stay consistent. */
export type ServiceCatalog = { categories: ServiceCategory[]; services: Service[] };

/** Categories + products, always delivered together so ids stay consistent. */
export type Catalog = { categories: ProductCategory[]; products: Product[] };

export type GalleryItem = {
  id: string;
  imageUrl: string;
  caption: string;
  category: GalleryCategory;
  order: number;
  createdAt: string;
};

export type OpeningHour = { label: string; value: string };

/** An extra phone number or email, e.g. { label: "Reception", value: "+91 …" }. */
export type ContactEntry = { label: string; value: string };

export const SOCIAL_PLATFORMS = [
  "instagram",
  "facebook",
  "youtube",
  "linkedin",
  "x",
  "tiktok",
  "pinterest",
  "threads",
  "google",
  "website",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];
export type SocialLink = { platform: SocialPlatform; url: string };

/** Seconds-per-slide choices offered to the Super Admin. */
export const HERO_INTERVALS = [2, 3, 4, 5, 6, 7, 8, 10, 12, 15] as const;

/** Home-page hero slider behaviour, managed by the Super Admin. */
export type HeroSliderSettings = {
  /** advance slides automatically */
  autoplay: boolean;
  /** seconds each slide stays on screen */
  interval: number;
  /** pause while the visitor hovers the slider (desktop) */
  pauseOnHover: boolean;
};

export type SiteSettings = {
  /** Primary phone — used for "Call" buttons across the site. */
  phone: string;
  /** Primary WhatsApp number (digits incl. country code). */
  whatsapp: string;
  /** Primary email. */
  email: string;
  /** Additional phone numbers shown on the Contact page & footer. */
  extraPhones: ContactEntry[];
  /** Additional email addresses shown on the Contact page & footer. */
  extraEmails: ContactEntry[];
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  googleMapsUrl: string;
  appleMapsUrl: string;
  mapEmbedUrl: string;
  /** Social profiles, in display order. */
  socials: SocialLink[];
  hours: OpeningHour[];
  announcement: string;
  heroSlider: HeroSliderSettings;
};

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export type Booking = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
};
