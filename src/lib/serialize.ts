import "server-only";
import type { Document, WithId } from "mongodb";
import { imageUrl } from "./images";
import { defaultProductImage, defaultServiceImage } from "./defaults";
import type { Booking, GalleryItem, HeroSlide, Product, ProductCategory, Service } from "./types";
import { iconForCategoryName } from "./defaults";
import type { CategoryLookup } from "./service-categories";

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

export function toService(d: WithId<Document>, lookup?: CategoryLookup): Service {
  const cat = lookup?.(d) ?? {
    id: d.categoryId ? String(d.categoryId) : "",
    name: str(d.category, "Other"),
    icon: iconForCategoryName(str(d.category)),
  };
  return {
    id: d._id.toString(),
    slug: str(d.slug),
    title: str(d.title),
    categoryId: cat.id,
    category: cat.name,
    categoryIcon: cat.icon,
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

export function toProductCategory(d: WithId<Document>): ProductCategory {
  return {
    id: d._id.toString(),
    name: str(d.name),
    slug: str(d.slug),
    description: str(d.description),
    order: Number(d.order ?? 0),
  };
}

export function toProduct(d: WithId<Document>): Product {
  return {
    id: d._id.toString(),
    name: str(d.name),
    slug: str(d.slug),
    categoryId: d.categoryId ? String(d.categoryId) : "",
    brand: str(d.brand),
    size: str(d.size),
    price: str(d.price),
    description: str(d.description),
    imageUrl: d.imageId ? imageUrl(d.imageId) : defaultProductImage(str(d.slug)),
    customImage: Boolean(d.imageId),
    featured: Boolean(d.featured),
    inStock: d.inStock !== false,
    active: d.active !== false,
    order: Number(d.order ?? 0),
  };
}
