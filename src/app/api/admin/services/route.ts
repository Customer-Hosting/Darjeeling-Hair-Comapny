import { ObjectId } from "mongodb";
import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, readForm, refresh } from "@/lib/api";
import { slugify } from "@/lib/defaults";
import { deleteImage, saveImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { serviceSchema } from "@/lib/schemas";
import { toService } from "@/lib/serialize";
import { makeCategoryLookup, migrateServiceCategories, toServiceCategory } from "@/lib/service-categories";
import { TAGS } from "@/lib/tags";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    // one-time, idempotent: link older services (category names) to managed categories
    const mig = await migrateServiceCategories(db);
    if (mig.created || mig.linked) refresh(TAGS.services);
    const [cats, docs] = await Promise.all([
      db.collection(COLLECTIONS.serviceCategories).find().sort({ order: 1, _id: 1 }).toArray(),
      db.collection(COLLECTIONS.services).find().sort({ order: 1, _id: 1 }).toArray(),
    ]);
    const lookup = makeCategoryLookup(cats.map(toServiceCategory));
    return Response.json(docs.map((d) => toService(d, lookup)));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  let imageId = null;
  try {
    const { fields, file } = readForm(await req.formData());
    const parsed = parseOrError(serviceSchema, fields);
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    const cat = await db.collection(COLLECTIONS.serviceCategories).findOne({ _id: new ObjectId(parsed.data.categoryId) });
    if (!cat) return jsonError("category: please choose an existing category", 422);
    if (file) imageId = await saveImage(file);
    const now = new Date();
    const res = await db.collection(COLLECTIONS.services).insertOne({
      ...parsed.data,
      category: cat.name, // denormalised name (kept in sync on rename)
      slug: slugify(parsed.data.title),
      imageId,
      createdAt: now,
      updatedAt: now,
    });
    refresh(TAGS.services);
    const doc = await db.collection(COLLECTIONS.services).findOne({ _id: res.insertedId });
    return Response.json(toService(doc!, makeCategoryLookup([toServiceCategory(cat)])), { status: 201 });
  } catch (err) {
    await deleteImage(imageId);
    return handleError(err);
  }
}
