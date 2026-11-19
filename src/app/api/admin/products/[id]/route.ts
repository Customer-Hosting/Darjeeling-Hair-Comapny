import { ObjectId } from "mongodb";
import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, readForm, refresh, toObjectId } from "@/lib/api";
import { slugify } from "@/lib/defaults";
import { deleteImage, saveImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { productSchema } from "@/lib/schemas";
import { toProduct } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const _id = toObjectId((await params).id);
  if (!_id) return jsonError("Invalid id", 404);
  let newImageId = null;
  try {
    const { fields, file } = readForm(await req.formData());
    const parsed = parseOrError(productSchema, fields);
    if (!parsed.ok) return parsed.res;
    const removeImage = fields.removeImage === "true";
    const db = await getDb();
    if (!(await db.collection(COLLECTIONS.productCategories).findOne({ _id: new ObjectId(parsed.data.categoryId) }))) {
      return jsonError("category: please choose an existing category", 422);
    }
    const col = db.collection(COLLECTIONS.products);
    const existing = await col.findOne({ _id });
    if (!existing) return jsonError("Product not found", 404);
    if (file) newImageId = await saveImage(file);
    const imagePatch = newImageId ? { imageId: newImageId } : removeImage ? { imageId: null } : {};
    await col.updateOne(
      { _id },
      { $set: { ...parsed.data, slug: slugify(parsed.data.name), ...imagePatch, updatedAt: new Date() } },
    );
    if (newImageId || removeImage) await deleteImage(existing.imageId);
    refresh(TAGS.products);
    return Response.json(toProduct((await col.findOne({ _id }))!));
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
    const doc = await db.collection(COLLECTIONS.products).findOneAndDelete({ _id });
    if (!doc) return jsonError("Product not found", 404);
    await deleteImage(doc.imageId);
    refresh(TAGS.products);
    return Response.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
