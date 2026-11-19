import "server-only";
import type { Db, Document, WithId } from "mongodb";
import { COLLECTIONS } from "./mongodb";
import { STARTER_SERVICE_CATEGORIES, iconForCategoryName, slugify } from "./defaults";
import { CATEGORY_ICONS, type CategoryIcon, type ServiceCategory } from "./types";

const isIcon = (v: unknown): v is CategoryIcon => typeof v === "string" && (CATEGORY_ICONS as readonly string[]).includes(v);

export function toServiceCategory(d: WithId<Document>): ServiceCategory {
  return {
    id: d._id.toString(),
    name: String(d.name ?? ""),
    slug: String(d.slug ?? ""),
    description: String(d.description ?? ""),
    icon: isIcon(d.icon) ? d.icon : iconForCategoryName(String(d.name ?? "")),
    order: Number(d.order ?? 0),
  };
}

export type CategoryLookup = (doc: Document) => { id: string; name: string; icon: CategoryIcon };

/**
 * Resolves a service document's category. Works for both migrated documents
 * (categoryId) and older ones that only stored the category name.
 */
export function makeCategoryLookup(categories: ServiceCategory[]): CategoryLookup {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const byName = new Map(categories.map((c) => [c.name.toLowerCase(), c]));
  return (doc) => {
    const name = typeof doc.category === "string" ? doc.category : "";
    const hit = (doc.categoryId && byId.get(String(doc.categoryId))) || byName.get(name.toLowerCase());
    if (hit) return { id: hit.id, name: hit.name, icon: hit.icon };
    return { id: doc.categoryId ? String(doc.categoryId) : "", name: name || "Other", icon: iconForCategoryName(name) };
  };
}

/**
 * Idempotent migration from fixed category names to managed categories:
 *  1. creates the starter categories (plus any custom names already used) if none exist;
 *  2. links every service that has no `categoryId` to its category by name.
 * Safe to call repeatedly — it only touches what still needs migrating.
 */
const isDuplicateKey = (err: unknown) =>
  typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000;

/**
 * Merges categories that share a slug (e.g. created by two simultaneous requests):
 * keeps the copy with the most services (oldest on a tie), moves services across,
 * and deletes the extras. Safe to run any time.
 */
export async function dedupeCategories(db: Db, catName: string, itemName: string): Promise<number> {
  const catCol = db.collection(catName);
  const itemCol = db.collection(itemName);
  const groups = await catCol
    .aggregate<{ _id: string; ids: import("mongodb").ObjectId[] }>([
      { $group: { _id: "$slug", ids: { $push: "$_id" }, n: { $sum: 1 } } },
      { $match: { n: { $gt: 1 } } },
    ])
    .toArray();
  let removed = 0;
  for (const g of groups) {
    const counts = await Promise.all(g.ids.map((id) => itemCol.countDocuments({ categoryId: id.toString() })));
    const sorted = g.ids
      .map((id, i) => ({ id, n: counts[i] }))
      .sort((a, b) => b.n - a.n || a.id.getTimestamp().getTime() - b.id.getTimestamp().getTime());
    const keeper = sorted[0].id.toString();
    const extras = sorted.slice(1).map((x) => x.id);
    await itemCol.updateMany({ categoryId: { $in: extras.map((x) => x.toString()) } }, { $set: { categoryId: keeper } });
    const res = await catCol.deleteMany({ _id: { $in: extras } });
    removed += res.deletedCount;
  }
  return removed;
}

/** One unique slug per category — enforced by MongoDB so races can never create duplicates. */
export async function ensureCategoryIndex(db: Db, catName: string, itemName: string) {
  await dedupeCategories(db, catName, itemName);
  await db.collection(catName).createIndex({ slug: 1 }, { unique: true, name: "slug_unique" });
}

export async function migrateServiceCategories(db: Db): Promise<{ created: number; linked: number }> {
  const catCol = db.collection(COLLECTIONS.serviceCategories);
  const svcCol = db.collection(COLLECTIONS.services);
  let created = 0;
  let linked = 0;

  await ensureCategoryIndex(db, COLLECTIONS.serviceCategories, COLLECTIONS.services);

  if ((await catCol.countDocuments()) === 0) {
    const used = (await svcCol.distinct("category")).filter((n): n is string => typeof n === "string" && !!n.trim());
    const starterNames = new Set(STARTER_SERVICE_CATEGORIES.map((c) => c.name.toLowerCase()));
    const extras = used.filter((n) => !starterNames.has(n.toLowerCase()));
    const docs = [
      ...STARTER_SERVICE_CATEGORIES.map((c, i) => ({ ...c, order: i })),
      ...extras.map((name, i) => ({
        name,
        slug: slugify(name),
        icon: "scissors" as CategoryIcon,
        description: "",
        order: STARTER_SERVICE_CATEGORIES.length + i,
      })),
    ].map((d) => ({ ...d, createdAt: new Date() }));
    if (docs.length) {
      try {
        const res = await catCol.insertMany(docs, { ordered: false });
        created = res.insertedCount;
      } catch (err) {
        // another request inserted some of them at the same moment — that's fine
        if (!isDuplicateKey(err) && !(err as { writeErrors?: unknown[] })?.writeErrors) throw err;
        created = (err as { result?: { insertedCount?: number } }).result?.insertedCount ?? 0;
      }
    }
  }

  const unlinked = await svcCol.find({ $or: [{ categoryId: { $exists: false } }, { categoryId: null }, { categoryId: "" }] }).toArray();
  if (unlinked.length) {
    const cats = (await catCol.find().toArray()).map(toServiceCategory);
    const byName = new Map(cats.map((c) => [c.name.toLowerCase(), c]));
    for (const s of unlinked) {
      const name = typeof s.category === "string" && s.category.trim() ? s.category.trim() : "Other";
      let cat = byName.get(name.toLowerCase());
      if (!cat) {
        const slug = slugify(name);
        try {
          const res = await catCol.insertOne({ name, slug, icon: "scissors", description: "", order: cats.length + created, createdAt: new Date() });
          cat = { id: res.insertedId.toString(), name, slug, icon: "scissors", description: "", order: cats.length };
          created++;
        } catch (err) {
          if (!isDuplicateKey(err)) throw err;
          cat = toServiceCategory((await catCol.findOne({ slug }))!); // created concurrently
        }
        byName.set(name.toLowerCase(), cat);
      }
      await svcCol.updateOne({ _id: s._id }, { $set: { categoryId: cat.id, category: cat.name } });
      linked++;
    }
  }
  return { created, linked };
}
