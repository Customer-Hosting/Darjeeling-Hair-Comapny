import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { COLLECTIONS, getDb, isDbConfigured } from "./mongodb";
import {
  DEFAULT_GALLERY,
  DEFAULT_HERO,
  DEFAULT_PRODUCT_CATEGORIES,
  DEFAULT_PRODUCTS,
  DEFAULT_SERVICE_CATEGORIES,
  DEFAULT_SERVICES,
  DEFAULT_SETTINGS,
} from "./defaults";
import { toGallery, toHero, toProduct, toProductCategory, toService } from "./serialize";
import { TAGS } from "./tags";
import { normalizeSettings } from "./settings";
import type { Catalog, GalleryItem, HeroSlide, Service, ServiceCatalog, SiteSettings } from "./types";
import { makeCategoryLookup, toServiceCategory } from "./service-categories";

/**
 * Public, cached readers used by the website's server components.
 * Admin mutations call revalidateTag(<tag>) so changes appear instantly.
 * If the DB is unreachable we fall back to sensible defaults with a short
 * cache lifetime so the site never breaks.
 */

export async function getHeroSlides(): Promise<HeroSlide[]> {
  "use cache";
  cacheTag(TAGS.hero);
  if (!isDbConfigured()) {
    cacheLife("minutes");
    return DEFAULT_HERO;
  }
  try {
    const db = await getDb();
    const docs = await db
      .collection(COLLECTIONS.hero)
      .find({ active: { $ne: false } })
      .sort({ order: 1, _id: 1 })
      .toArray();
    cacheLife("hours");
    return docs.length ? docs.map(toHero) : DEFAULT_HERO;
  } catch (err) {
    console.error("[data] hero", err);
    cacheLife("minutes");
    return DEFAULT_HERO;
  }
}

const DEFAULT_SERVICE_CATALOG: ServiceCatalog = { categories: DEFAULT_SERVICE_CATEGORIES, services: DEFAULT_SERVICES };

/**
 * Service categories + visible services, delivered together so category ids
 * always match. Works before and after the category migration (older service
 * documents are matched to categories by name).
 */
export async function getServiceCatalog(): Promise<ServiceCatalog> {
  "use cache";
  cacheTag(TAGS.services);
  if (!isDbConfigured()) {
    cacheLife("minutes");
    return DEFAULT_SERVICE_CATALOG;
  }
  try {
    const db = await getDb();
    const [catDocs, docs] = await Promise.all([
      db.collection(COLLECTIONS.serviceCategories).find().sort({ order: 1, _id: 1 }).toArray(),
      db.collection(COLLECTIONS.services).find({ active: { $ne: false } }).sort({ order: 1, _id: 1 }).toArray(),
    ]);
    cacheLife("hours");
    if (!docs.length) return DEFAULT_SERVICE_CATALOG;
    const categories = catDocs.length ? catDocs.map(toServiceCategory) : DEFAULT_SERVICE_CATEGORIES;
    const lookup = makeCategoryLookup(categories);
    return { categories, services: docs.map((d) => toService(d, lookup)) };
  } catch (err) {
    console.error("[data] services", err);
    cacheLife("minutes");
    return DEFAULT_SERVICE_CATALOG;
  }
}

/** Visible services (convenience wrapper used by most pages). */
export async function getServices(): Promise<Service[]> {
  return (await getServiceCatalog()).services;
}

export async function getGallery(): Promise<GalleryItem[]> {
  "use cache";
  cacheTag(TAGS.gallery);
  if (!isDbConfigured()) {
    cacheLife("minutes");
    return DEFAULT_GALLERY;
  }
  try {
    const db = await getDb();
    const docs = await db
      .collection(COLLECTIONS.gallery)
      .find({})
      .sort({ order: 1, createdAt: -1 })
      .toArray();
    cacheLife("hours");
    return docs.length ? docs.map(toGallery) : DEFAULT_GALLERY;
  } catch (err) {
    console.error("[data] gallery", err);
    cacheLife("minutes");
    return DEFAULT_GALLERY;
  }
}

export async function getSettings(): Promise<SiteSettings> {
  "use cache";
  cacheTag(TAGS.settings);
  if (!isDbConfigured()) {
    cacheLife("minutes");
    return DEFAULT_SETTINGS;
  }
  try {
    const db = await getDb();
    const doc = await db.collection<{ _id: string }>(COLLECTIONS.settings).findOne({ _id: "site" });
    cacheLife("hours");
    // normalizeSettings also migrates legacy instagramUrl/facebookUrl into `socials`
    return normalizeSettings(doc as Record<string, unknown> | null);
  } catch (err) {
    console.error("[data] settings", err);
    cacheLife("minutes");
    return DEFAULT_SETTINGS;
  }
}

const DEFAULT_CATALOG: Catalog = { categories: DEFAULT_PRODUCT_CATEGORIES, products: DEFAULT_PRODUCTS };

/**
 * Retail catalogue (categories + visible products). Falls back to the bundled
 * sample catalogue until the Super Admin has added products.
 */
export async function getCatalog(): Promise<Catalog> {
  "use cache";
  cacheTag(TAGS.products);
  if (!isDbConfigured()) {
    cacheLife("minutes");
    return DEFAULT_CATALOG;
  }
  try {
    const db = await getDb();
    const [cats, prods] = await Promise.all([
      db.collection(COLLECTIONS.productCategories).find().sort({ order: 1, _id: 1 }).toArray(),
      db.collection(COLLECTIONS.products).find().sort({ order: 1, _id: 1 }).toArray(),
    ]);
    cacheLife("hours");
    if (!prods.length) return DEFAULT_CATALOG;
    return {
      categories: cats.map(toProductCategory),
      products: prods.map(toProduct).filter((p) => p.active),
    };
  } catch (err) {
    console.error("[data] catalog", err);
    cacheLife("minutes");
    return DEFAULT_CATALOG;
  }
}
