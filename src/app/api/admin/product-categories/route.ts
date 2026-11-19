import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, refresh } from "@/lib/api";
import { slugify } from "@/lib/defaults";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { productCategorySchema } from "@/lib/schemas";
import { toProductCategory } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";
import { ensureCategoryIndex } from "@/lib/service-categories";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    // unique slug per category (also merges any accidental duplicates)
    await ensureCategoryIndex(db, COLLECTIONS.productCategories, COLLECTIONS.products);
    const [cats, counts] = await Promise.all([
      db.collection(COLLECTIONS.productCategories).find().sort({ order: 1, _id: 1 }).toArray(),
      db
        .collection(COLLECTIONS.products)
        .aggregate<{ _id: string; n: number }>([{ $group: { _id: "$categoryId", n: { $sum: 1 } } }])
        .toArray(),
    ]);
    const byId = new Map(counts.map((c) => [String(c._id), c.n]));
    return Response.json(cats.map((c) => {
        const n = byId.get(c._id.toString()) ?? 0;
        return { ...toProductCategory(c), itemCount: n, productCount: n };
      }));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const parsed = parseOrError(productCategorySchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    const col = db.collection(COLLECTIONS.productCategories);
    const slug = slugify(parsed.data.name);
    if (await col.findOne({ slug })) return jsonError(`A category called “${parsed.data.name}” already exists`, 409);
    const res = await col.insertOne({ ...parsed.data, slug, createdAt: new Date() });
    refresh(TAGS.products);
    return Response.json(toProductCategory((await col.findOne({ _id: res.insertedId }))!), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
