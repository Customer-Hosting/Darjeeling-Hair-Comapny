import { z } from "zod";
import { BOOKING_STATUSES, GALLERY_CATEGORIES, SERVICE_CATEGORIES } from "./types";

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
  category: z.enum(SERVICE_CATEGORIES),
  description: text(600),
  price: text(60),
  duration: text(40),
  featured: bool.default(false),
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
  email: z.email().max(120),
  addressLine1: z.string().trim().min(1).max(160),
  addressLine2: text(160),
  city: text(80),
  pincode: text(12),
  googleMapsUrl: url,
  appleMapsUrl: url,
  mapEmbedUrl: url,
  instagramUrl: url,
  facebookUrl: url,
  hours: z
    .array(z.object({ label: z.string().trim().min(1).max(40), value: z.string().trim().min(1).max(60) }))
    .max(10),
  announcement: text(160),
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
