import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Db, ObjectId } from "mongodb";
import { COLLECTIONS } from "./mongodb";
import { ensureCategoryIndex, migrateServiceCategories } from "./service-categories";
import { deleteImage, saveImageBuffer } from "./images";
import {
  DEFAULT_GALLERY,
  DEFAULT_HERO,
  DEFAULT_PRODUCT_GALLERY,
  HAIRCUT_STYLES,
  DEFAULT_SETTINGS,
  STARTER_PRODUCT_CATEGORIES,
  STARTER_PRODUCTS,
  STARTER_SERVICES,
  defaultProductImage,
  defaultServiceImage,
  slugify,
} from "./defaults";

/**
 * Sample-content migration: copies the built-in website content (hero slides,
 * services with photos, gallery photos, contact settings) into MongoDB so the
 * Super Admin can edit it.
 *
 * Idempotent & safe: each collection is only filled when it is EMPTY, so it
 * never duplicates or overwrites anything the admin has created.
 */

export type SeedReport = {
  hero: number;
  services: number;
  serviceCategories: number;
  gallery: number;
  productCategories: number;
  products: number;
  settings: boolean;
  skipped: string[];
};

const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".avif": "image/avif",
};

/** Loads a bundled /public image: from disk when available, otherwise over HTTP (serverless hosts). */
async function loadPublicImage(publicPath: string, origin: string) {
  const ext = path.extname(publicPath).toLowerCase();
  const contentType = MIME[ext] ?? "application/octet-stream";
  const filename = path.basename(publicPath);
  try {
    const buf = await readFile(path.join(process.cwd(), "public", publicPath));
    return { buf, contentType, filename };
  } catch {
    const res = await fetch(new URL(publicPath, origin));
    if (!res.ok) throw new Error(`Could not load sample image ${publicPath} (${res.status})`);
    return { buf: Buffer.from(await res.arrayBuffer()), contentType, filename };
  }
}

export async function seedSampleContent(db: Db, origin: string): Promise<SeedReport> {
  const report: SeedReport = { hero: 0, services: 0, serviceCategories: 0, gallery: 0, productCategories: 0, products: 0, settings: false, skipped: [] };
  const uploaded: ObjectId[] = [];
  const store = async (publicPath: string) => {
    const { buf, contentType, filename } = await loadPublicImage(publicPath, origin);
    const id = await saveImageBuffer(buf, filename, contentType);
    uploaded.push(id);
    return id;
  };

  try {
    const now = Date.now();

    // ── Hero slides ──
    const heroCol = db.collection(COLLECTIONS.hero);
    if ((await heroCol.countDocuments()) === 0) {
      const docs = [];
      for (const s of DEFAULT_HERO) {
        const { id: _id, imageUrl, ...rest } = s;
        void _id;
        docs.push({ ...rest, imageId: await store(imageUrl), createdAt: new Date(now), updatedAt: new Date(now) });
      }
      await heroCol.insertMany(docs);
      report.hero = docs.length;
    } else report.skipped.push("hero");

    // ── Services (with photos) ──
    const svcCol = db.collection(COLLECTIONS.services);
    if ((await svcCol.countDocuments()) === 0) {
      const docs = [];
      for (const [i, s] of STARTER_SERVICES.entries()) {
        const slug = slugify(s.title);
        const img = defaultServiceImage(slug);
        docs.push({
          ...s,
          slug,
          imageId: img ? await store(img) : null,
          active: true,
          order: i,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        });
      }
      await svcCol.insertMany(docs);
      report.services = docs.length;
    } else {
      // add newly introduced starter services (e.g. haircut styles) that don't exist yet
      const titles = new Set((await svcCol.find().project({ title: 1 }).toArray()).map((x) => String(x.title).toLowerCase()));
      const missing = STARTER_SERVICES.filter((s) => !titles.has(s.title.toLowerCase()));
      if (missing.length) {
        const base = await svcCol.countDocuments();
        const docs = [];
        for (const [i, s] of missing.entries()) {
          const slug = slugify(s.title);
          const img = defaultServiceImage(slug);
          docs.push({ ...s, slug, imageId: img ? await store(img) : null, active: true, order: base + i, createdAt: new Date(now), updatedAt: new Date(now) });
        }
        await svcCol.insertMany(docs);
        report.services += docs.length;
      }
    }
    // create managed service categories (if none) and link every service to one
    const mig = await migrateServiceCategories(db);
    report.serviceCategories = mig.created;

    // ── Gallery ──
    const galCol = db.collection(COLLECTIONS.gallery);
    if ((await galCol.countDocuments()) === 0) {
      const docs = [];
      for (const [i, g] of DEFAULT_GALLERY.entries()) {
        docs.push({
          caption: g.caption,
          category: g.category,
          order: i,
          imageId: await store(g.imageUrl),
          createdAt: new Date(now - i * 1000),
        });
      }
      await galCol.insertMany(docs);
      report.gallery = docs.length;
    } else if ((await galCol.countDocuments({ category: "Products" })) === 0) {
      // gallery already exists (e.g. imported before products were added) → add only the product photos
      const docs = [];
      for (const [i, g] of DEFAULT_PRODUCT_GALLERY.entries()) {
        docs.push({ caption: g.caption, category: g.category, order: 100 + i, imageId: await store(g.imageUrl), createdAt: new Date(now) });
      }
      await galCol.insertMany(docs);
      report.gallery = docs.length;
    } else report.skipped.push("gallery");

    // ── Featured haircut styles: added to an existing gallery once, placed first ──
    {
      const existing = new Set((await galCol.find({ category: "Haircuts" }).project({ caption: 1 }).toArray()).map((x) => String(x.caption)));
      const missing = HAIRCUT_STYLES.filter(([, caption]) => !existing.has(caption));
      if (missing.length) {
        const docs = [];
        for (const [i, [file, caption]] of missing.entries()) {
          docs.push({ caption, category: "Haircuts", order: i, imageId: await store(`/images/gallery/${file}.webp`), createdAt: new Date(now) });
        }
        // push the older items back so the new styles come first
        await galCol.updateMany({ order: { $lt: 1000 } }, { $inc: { order: missing.length } });
        await galCol.insertMany(docs);
        report.gallery += docs.length;
      }
    }

    // ── Product categories ──
    const catCol = db.collection(COLLECTIONS.productCategories);
    await ensureCategoryIndex(db, COLLECTIONS.productCategories, COLLECTIONS.products);
    if ((await catCol.countDocuments()) === 0) {
      try {
        const res = await catCol.insertMany(
          STARTER_PRODUCT_CATEGORIES.map((c, i) => ({ ...c, order: i, createdAt: new Date(now) })),
          { ordered: false },
        );
        report.productCategories = res.insertedCount;
      } catch (err) {
        // a simultaneous import already created some — the unique index kept them single
        if ((err as { code?: number })?.code !== 11000 && !(err as { writeErrors?: unknown[] })?.writeErrors) throw err;
      }
    } else report.skipped.push("productCategories");

    // ── Products (with photos) ──
    const prodCol = db.collection(COLLECTIONS.products);
    if ((await prodCol.countDocuments()) === 0) {
      const catIdBySlug = new Map(
        (await catCol.find().toArray()).map((c) => [String(c.slug), c._id.toString()]),
      );
      const docs = [];
      for (const [i, { categorySlug, ...p }] of STARTER_PRODUCTS.entries()) {
        let categoryId = catIdBySlug.get(categorySlug);
        if (!categoryId) {
          // admin removed this starter category → recreate it so the product isn't orphaned
          const starter = STARTER_PRODUCT_CATEGORIES.find((c) => c.slug === categorySlug)!;
          const res = await catCol.insertOne({ ...starter, order: 99, createdAt: new Date(now) });
          categoryId = res.insertedId.toString();
          catIdBySlug.set(categorySlug, categoryId);
        }
        const slug = slugify(p.name);
        const img = defaultProductImage(slug);
        docs.push({
          ...p,
          slug,
          categoryId,
          imageId: img ? await store(img) : null,
          active: true,
          order: i,
          createdAt: new Date(now),
          updatedAt: new Date(now),
        });
      }
      await prodCol.insertMany(docs);
      report.products = docs.length;
    } else report.skipped.push("products");

    // ── Contact & settings ──
    const setCol = db.collection<{ _id: string }>(COLLECTIONS.settings);
    if (!(await setCol.findOne({ _id: "site" }))) {
      await setCol.insertOne({ _id: "site", ...DEFAULT_SETTINGS });
      report.settings = true;
    } else report.skipped.push("settings");

    return report;
  } catch (err) {
    // roll back images uploaded during a failed run so nothing is orphaned
    await Promise.all(uploaded.map((id) => deleteImage(id)));
    throw err;
  }
}
