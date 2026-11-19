import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, parseOrError, readForm, refresh } from "@/lib/api";
import { slugify } from "@/lib/defaults";
import { deleteImage, saveImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { serviceSchema } from "@/lib/schemas";
import { toService } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const docs = await db
      .collection(COLLECTIONS.services)
      .find()
      .sort({ order: 1, _id: 1 })
      .toArray();
    return Response.json(docs.map(toService));
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
    if (file) imageId = await saveImage(file);
    const db = await getDb();
    const now = new Date();
    const res = await db.collection(COLLECTIONS.services).insertOne({
      ...parsed.data,
      slug: slugify(parsed.data.title),
      imageId,
      createdAt: now,
      updatedAt: now,
    });
    refresh(TAGS.services);
    const doc = await db.collection(COLLECTIONS.services).findOne({ _id: res.insertedId });
    return Response.json(toService(doc!), { status: 201 });
  } catch (err) {
    await deleteImage(imageId);
    return handleError(err);
  }
}
