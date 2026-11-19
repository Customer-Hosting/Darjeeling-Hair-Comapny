import { ObjectId } from "mongodb";
import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, readForm, refresh } from "@/lib/api";
import { slugify } from "@/lib/defaults";
import { deleteImage, saveImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { productSchema } from "@/lib/schemas";
import { toProduct } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const docs = await db.collection(COLLECTIONS.products).find().sort({ order: 1, _id: 1 }).toArray();
    return Response.json(docs.map(toProduct));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  let imageId = null;
  try {
    const { fields, file } = readForm(await req.formData());
    const parsed = parseOrError(productSchema, fields);
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    if (!(await db.collection(COLLECTIONS.productCategories).findOne({ _id: new ObjectId(parsed.data.categoryId) }))) {
      return jsonError("category: please choose an existing category", 422);
    }
    if (file) imageId = await saveImage(file);
    const now = new Date();
    const res = await db.collection(COLLECTIONS.products).insertOne({
      ...parsed.data,
      slug: slugify(parsed.data.name),
      imageId,
      createdAt: now,
      updatedAt: now,
    });
    refresh(TAGS.products);
    const doc = await db.collection(COLLECTIONS.products).findOne({ _id: res.insertedId });
    return Response.json(toProduct(doc!), { status: 201 });
  } catch (err) {
    await deleteImage(imageId);
    return handleError(err);
  }
}
