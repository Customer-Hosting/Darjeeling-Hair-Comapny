import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { COLLECTIONS, getDb, isDbConfigured } from "./mongodb";
import { DEFAULT_GALLERY, DEFAULT_HERO, DEFAULT_SERVICES, DEFAULT_SETTINGS } from "./defaults";
import { toGallery, toHero, toService } from "./serialize";
import { TAGS } from "./tags";
import type { GalleryItem, HeroSlide, Service, SiteSettings } from "./types";

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

export async function getServices(): Promise<Service[]> {
  "use cache";
  cacheTag(TAGS.services);
  if (!isDbConfigured()) {
    cacheLife("minutes");
    return DEFAULT_SERVICES;
  }
  try {
    const db = await getDb();
    const docs = await db
      .collection(COLLECTIONS.services)
      .find({ active: { $ne: false } })
      .sort({ order: 1, _id: 1 })
      .toArray();
    cacheLife("hours");
    return docs.length ? docs.map(toService) : DEFAULT_SERVICES;
  } catch (err) {
    console.error("[data] services", err);
    cacheLife("minutes");
    return DEFAULT_SERVICES;
  }
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
    const doc = await db
      .collection<{ _id: string } & Partial<SiteSettings>>(COLLECTIONS.settings)
      .findOne({ _id: "site" });
    cacheLife("hours");
    if (!doc) return DEFAULT_SETTINGS;
    const { _id: _ignored, ...rest } = doc;
    void _ignored;
    return { ...DEFAULT_SETTINGS, ...rest };
  } catch (err) {
    console.error("[data] settings", err);
    cacheLife("minutes");
    return DEFAULT_SETTINGS;
  }
}
