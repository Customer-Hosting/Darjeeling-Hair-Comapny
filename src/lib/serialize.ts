import "server-only";
import type { Document, WithId } from "mongodb";
import { imageUrl } from "./images";
import { defaultServiceImage } from "./defaults";
import type { Booking, GalleryItem, HeroSlide, Service } from "./types";

const str = (v: unknown, d = "") => (typeof v === "string" ? v : d);
const iso = (v: unknown) =>
  v instanceof Date ? v.toISOString() : typeof v === "string" ? v : "";

export function toHero(d: WithId<Document>): HeroSlide {
  return {
    id: d._id.toString(),
    imageUrl: d.imageId ? imageUrl(d.imageId) : "/images/hero/hero-1.webp",
    eyebrow: str(d.eyebrow),
    title: str(d.title),
    highlight: str(d.highlight),
    subtitle: str(d.subtitle),
    ctaLabel: str(d.ctaLabel),
    ctaHref: str(d.ctaHref),
    active: d.active !== false,
    order: Number(d.order ?? 0),
  };
}

export function toService(d: WithId<Document>): Service {
  return {
    id: d._id.toString(),
    slug: str(d.slug),
    title: str(d.title),
    category: d.category,
    description: str(d.description),
    price: str(d.price),
    duration: str(d.duration),
    imageUrl: d.imageId ? imageUrl(d.imageId) : defaultServiceImage(str(d.slug)),
    customImage: Boolean(d.imageId),
    featured: Boolean(d.featured),
    active: d.active !== false,
    order: Number(d.order ?? 0),
  };
}

export function toGallery(d: WithId<Document>): GalleryItem {
  return {
    id: d._id.toString(),
    imageUrl: imageUrl(d.imageId),
    caption: str(d.caption),
    category: d.category,
    order: Number(d.order ?? 0),
    createdAt: iso(d.createdAt),
  };
}

export function toBooking(d: WithId<Document>): Booking {
  return {
    id: d._id.toString(),
    name: str(d.name),
    phone: str(d.phone),
    email: str(d.email),
    service: str(d.service),
    date: str(d.date),
    time: str(d.time),
    message: str(d.message),
    status: d.status ?? "pending",
    createdAt: iso(d.createdAt),
  };
}
