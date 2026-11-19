import type { ObjectId } from "mongodb";
import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, refresh } from "@/lib/api";
import { deleteImage, saveImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { gallerySchema } from "@/lib/schemas";
import { toGallery } from "@/lib/serialize";
import { TAGS } from "@/lib/tags";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const docs = await db
      .collection(COLLECTIONS.gallery)
      .find()
      .sort({ order: 1, createdAt: -1 })
      .toArray();
    return Response.json(docs.map(toGallery));
  } catch (err) {
    return handleError(err);
  }
}

/** Upload one or many images at once (field name: "images"). */
export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const saved: ObjectId[] = [];
  try {
    const form = await req.formData();
    const parsed = parseOrError(gallerySchema, {
      caption: form.get("caption") ?? "",
      category: form.get("category"),
      order: form.get("order") ?? 0,
    });
    if (!parsed.ok) return parsed.res;
    const files = form.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) return jsonError("Please choose at least one image");
    if (files.length > 20) return jsonError("Upload at most 20 images at a time");
    for (const f of files) saved.push(await saveImage(f));
    const db = await getDb();
    const now = Date.now();
    await db.collection(COLLECTIONS.gallery).insertMany(
      saved.map((imageId, i) => ({
        ...parsed.data,
        imageId,
        createdAt: new Date(now + i),
      })),
    );
    refresh(TAGS.gallery);
    return Response.json({ ok: true, count: saved.length }, { status: 201 });
  } catch (err) {
    await Promise.all(saved.map((id) => deleteImage(id)));
    return handleError(err);
  }
}
