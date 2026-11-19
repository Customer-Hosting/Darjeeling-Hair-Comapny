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

export const SERVICE_CATEGORIES = [
  "Cut & Style",
  "Colour",
  "Treatment",
  "Texture",
] as const;
export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

export type Service = {
  id: string;
  slug: string;
  title: string;
  category: ServiceCategory;
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
  "Salon",
] as const;
export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export type GalleryItem = {
  id: string;
  imageUrl: string;
  caption: string;
  category: GalleryCategory;
  order: number;
  createdAt: string;
};

export type OpeningHour = { label: string; value: string };

export type SiteSettings = {
  phone: string;
  whatsapp: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  googleMapsUrl: string;
  appleMapsUrl: string;
  mapEmbedUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  hours: OpeningHour[];
  announcement: string;
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
