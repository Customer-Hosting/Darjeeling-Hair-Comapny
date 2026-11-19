import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, readForm, refresh, toObjectId } from "@/lib/api";
import { deleteImage, saveImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { heroSchema } from "@/lib/schemas";
import { toHero } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const _id = toObjectId((await params).id);
  if (!_id) return jsonError("Invalid id", 404);
  let newImageId = null;
  try {
    const { fields, file } = readForm(await req.formData());
    const parsed = parseOrError(heroSchema, fields);
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    const col = db.collection(COLLECTIONS.hero);
    const existing = await col.findOne({ _id });
    if (!existing) return jsonError("Slide not found", 404);
    if (file) newImageId = await saveImage(file);
    await col.updateOne(
      { _id },
      { $set: { ...parsed.data, ...(newImageId ? { imageId: newImageId } : {}), updatedAt: new Date() } },
    );
    if (newImageId) await deleteImage(existing.imageId);
    refresh(TAGS.hero);
    return Response.json(toHero((await col.findOne({ _id }))!));
  } catch (err) {
    await deleteImage(newImageId);
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const _id = toObjectId((await params).id);
  if (!_id) return jsonError("Invalid id", 404);
  try {
    const db = await getDb();
    const doc = await db.collection(COLLECTIONS.hero).findOneAndDelete({ _id });
    if (!doc) return jsonError("Slide not found", 404);
    await deleteImage(doc.imageId);
    refresh(TAGS.hero);
    return Response.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
