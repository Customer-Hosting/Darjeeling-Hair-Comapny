import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, readForm, refresh } from "@/lib/api";
import { deleteImage, saveImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { heroSchema } from "@/lib/schemas";
import { toHero } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const docs = await db.collection(COLLECTIONS.hero).find().sort({ order: 1, _id: 1 }).toArray();
    return Response.json(docs.map(toHero));
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  let imageId = null;
  try {
    const { fields, file } = readForm(await req.formData());
    const parsed = parseOrError(heroSchema, fields);
    if (!parsed.ok) return parsed.res;
    if (!file) return jsonError("Please choose a slide image");
    imageId = await saveImage(file);
    const db = await getDb();
    const now = new Date();
    const res = await db
      .collection(COLLECTIONS.hero)
      .insertOne({ ...parsed.data, imageId, createdAt: now, updatedAt: now });
    refresh(TAGS.hero);
    const doc = await db.collection(COLLECTIONS.hero).findOne({ _id: res.insertedId });
    return Response.json(toHero(doc!), { status: 201 });
  } catch (err) {
    await deleteImage(imageId);
    return handleError(err);
  }
}
