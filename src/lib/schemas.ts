import { z } from "zod";
import { BOOKING_STATUSES, CATEGORY_ICONS, GALLERY_CATEGORIES, SOCIAL_PLATFORMS } from "./types";

const bool = z
  .union([z.boolean(), z.string()])
  .transform((v) => v === true || v === "true" || v === "on");
const order = z.coerce.number().int().min(0).max(10000).default(0);
const text = (max: number) => z.string().trim().max(max).default("");

const internalOrHttp = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || v.startsWith("/") || /^https?:\/\//.test(v), {
    message: "must start with / or http(s)://",
  })
  .default("");

export const heroSchema = z.object({
  eyebrow: text(80),
  title: z.string().trim().min(1, "required").max(120),
  highlight: text(120),
  subtitle: text(300),
  ctaLabel: text(40),
  ctaHref: internalOrHttp,
  active: bool.default(true),
  order,
});

export const serviceSchema = z.object({
  title: z.string().trim().min(1, "required").max(100),
  categoryId: z.string().regex(/^[a-f0-9]{24}$/, "please choose a category"),
  description: text(600),
  price: text(60),
  duration: text(40),
  featured: bool.default(false),
  active: bool.default(true),
  order,
});

export const serviceCategorySchema = z.object({
  name: z.string().trim().min(1, "required").max(60),
  description: text(200),
  icon: z.enum(CATEGORY_ICONS).default("scissors"),
  order,
});

export const productCategorySchema = z.object({
  name: z.string().trim().min(1, "required").max(60),
  description: text(200),
  order,
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "required").max(100),
  categoryId: z.string().regex(/^[a-f0-9]{24}$/, "please choose a category"),
  brand: text(60),
  size: text(40),
  price: text(60),
  description: text(600),
  featured: bool.default(false),
  inStock: bool.default(true),
  active: bool.default(true),
  order,
});

export const gallerySchema = z.object({
  caption: text(140),
  category: z.enum(GALLERY_CATEGORIES),
  order,
});

const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//.test(v), { message: "must be a URL" });

export const settingsSchema = z.object({
  phone: z.string().trim().min(5).max(30),
  whatsapp: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "digits only incl. country code, e.g. 917384163348"),
  email: z.email("must be a valid email").max(120),
  extraPhones: z
    .array(
      z.object({
        label: text(30),
        value: z.string().trim().regex(/^\+?[\d\s()-]{6,20}$/, "must be a valid phone number"),
      }),
    )
    .max(5, "up to 5 extra phone numbers")
    .default([]),
  extraEmails: z
    .array(z.object({ label: text(30), value: z.email("must be a valid email").max(120) }))
    .max(5, "up to 5 extra emails")
    .default([]),
  addressLine1: z.string().trim().min(1).max(160),
  addressLine2: text(160),
  city: text(80),
  pincode: text(12),
  googleMapsUrl: url,
  appleMapsUrl: url,
  mapEmbedUrl: url,
  socials: z
    .array(
      z.object({
        platform: z.enum(SOCIAL_PLATFORMS),
        url: z
          .string()
          .trim()
          .max(500)
          .refine((v) => /^https?:\/\//.test(v), { message: "must start with https://" }),
      }),
    )
    .max(12, "up to 12 social profiles")
    .default([]),
  hours: z
    .array(z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(60) }))
    .max(10),
  announcement: text(160),
});

const short = (max: number) => z.string().trim().max(max);
export const aboutSchema = z.object({
  header: z.object({ eyebrow: short(60), title: z.string().trim().min(1, "required").max(120), intro: short(400) }),
  founder: z.object({
    eyebrow: short(60),
    name: z.string().trim().min(1, "required").max(80),
    body: short(3000),
    highlights: z.array(short(120)).max(8),
    showFollowButton: z.boolean(),
  }),
  stats: z.array(z.object({ value: z.string().trim().min(1, "required").max(12), label: short(60) })).max(6),
  journey: z.object({
    eyebrow: short(60),
    title: short(120),
    items: z.array(z.object({ title: z.string().trim().min(1, "required").max(120), text: short(400) })).max(10),
  }),
  values: z.object({
    eyebrow: short(60),
    title: short(120),
    items: z
      .array(z.object({ icon: z.enum(CATEGORY_ICONS), title: z.string().trim().min(1, "required").max(80), text: short(300) }))
      .max(9),
  }),
  seo: z.object({ title: short(70), description: short(170) }),
});

export const heroSliderSchema = z.object({
  autoplay: z.boolean(),
  interval: z.number().int().min(2, "minimum 2 seconds").max(30, "maximum 30 seconds"),
  pauseOnHover: z.boolean(),
});

export const bookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[+\d][\d\s-]{6,18}$/, "Please enter a valid phone number"),
  email: z.union([z.literal(""), z.email("Please enter a valid email")]).default(""),
  service: z.string().trim().min(1, "Please choose a service").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Please pick a date"),
  time: z.string().trim().min(1, "Please pick a time").max(20),
  message: text(600),
  // honeypot — must stay empty
  company: z.string().max(0).optional().default(""),
});

export const bookingStatusSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
});
