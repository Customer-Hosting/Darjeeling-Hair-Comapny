import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, refresh } from "@/lib/api";
import { slugify } from "@/lib/defaults";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { serviceCategorySchema } from "@/lib/schemas";
import { migrateServiceCategories, toServiceCategory } from "@/lib/service-categories";
import { TAGS } from "@/lib/tags";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const mig = await migrateServiceCategories(db);
    if (mig.created || mig.linked) refresh(TAGS.services);
    const [cats, counts] = await Promise.all([
      db.collection(COLLECTIONS.serviceCategories).find().sort({ order: 1, _id: 1 }).toArray(),
      db
        .collection(COLLECTIONS.services)
        .aggregate<{ _id: string; n: number }>([{ $group: { _id: "$categoryId", n: { $sum: 1 } } }])
        .toArray(),
    ]);
    const byId = new Map(counts.map((c) => [String(c._id), c.n]));
    return Response.json(cats.map((c) => ({ ...toServiceCategory(c), itemCount: byId.get(c._id.toString()) ?? 0 })));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const parsed = parseOrError(serviceCategorySchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    const col = db.collection(COLLECTIONS.serviceCategories);
    const slug = slugify(parsed.data.name);
    if (await col.findOne({ slug })) return jsonError(`A category called “${parsed.data.name}” already exists`, 409);
    const res = await col.insertOne({ ...parsed.data, slug, createdAt: new Date() });
    refresh(TAGS.services);
    return Response.json(toServiceCategory((await col.findOne({ _id: res.insertedId }))!), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
