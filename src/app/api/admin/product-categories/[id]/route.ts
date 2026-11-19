import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, refresh, toObjectId } from "@/lib/api";
import { slugify } from "@/lib/defaults";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { productCategorySchema } from "@/lib/schemas";
import { toProductCategory } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const _id = toObjectId((await params).id);
  if (!_id) return jsonError("Invalid id", 404);
  try {
    const parsed = parseOrError(productCategorySchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    const col = db.collection(COLLECTIONS.productCategories);
    const slug = slugify(parsed.data.name);
    if (await col.findOne({ slug, _id: { $ne: _id } })) {
      return jsonError(`A category called “${parsed.data.name}” already exists`, 409);
    }
    const doc = await col.findOneAndUpdate({ _id }, { $set: { ...parsed.data, slug } }, { returnDocument: "after" });
    if (!doc) return jsonError("Category not found", 404);
    refresh(TAGS.products);
    return Response.json(toProductCategory(doc));
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
    // never orphan products: a category can only be deleted when it's empty
    const inUse = await db.collection(COLLECTIONS.products).countDocuments({ categoryId: _id.toString() });
    if (inUse) {
      return jsonError(
        `This category still has ${inUse} product${inUse > 1 ? "s" : ""}. Move or delete ${inUse > 1 ? "them" : "it"} first.`,
        409,
      );
    }
    const res = await db.collection(COLLECTIONS.productCategories).deleteOne({ _id });
    if (!res.deletedCount) return jsonError("Category not found", 404);
    refresh(TAGS.products);
    return Response.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
