import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, refresh, toObjectId } from "@/lib/api";
import { deleteImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { gallerySchema } from "@/lib/schemas";
import { toGallery } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const _id = toObjectId((await params).id);
  if (!_id) return jsonError("Invalid id", 404);
  try {
    const parsed = parseOrError(gallerySchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    const doc = await db
      .collection(COLLECTIONS.gallery)
      .findOneAndUpdate({ _id }, { $set: parsed.data }, { returnDocument: "after" });
    if (!doc) return jsonError("Image not found", 404);
    refresh(TAGS.gallery);
    return Response.json(toGallery(doc));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const _id = toObjectId((await params).id);
  if (!_id) return jsonError("Invalid id", 404);
  try {
    const db = await getDb();
    const doc = await db.collection(COLLECTIONS.gallery).findOneAndDelete({ _id });
    if (!doc) return jsonError("Image not found", 404);
    await deleteImage(doc.imageId);
    refresh(TAGS.gallery);
    return Response.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
