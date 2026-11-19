import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, readForm, refresh } from "@/lib/api";
import { DEFAULT_ABOUT_IMAGE } from "@/lib/about";
import { deleteImage, imageUrl, saveImage } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { TAGS } from "@/lib/tags";

type PageDoc = { _id: string } & Record<string, unknown>;

const currentImageId = (doc: PageDoc | null) => (doc?.founder as { imageId?: unknown } | undefined)?.imageId;

/** Upload / replace the founder photo on the About page. */
export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  let newId = null;
  try {
    const { file } = readForm(await req.formData());
    if (!file) return jsonError("Please choose an image");
    newId = await saveImage(file);
    const col = (await getDb()).collection<PageDoc>(COLLECTIONS.pages);
    const old = currentImageId(await col.findOne({ _id: "about" }));
    await col.updateOne({ _id: "about" }, { $set: { "founder.imageId": newId } }, { upsert: true });
    if (old) await deleteImage(String(old));
    refresh(TAGS.about);
    return Response.json({ imageUrl: imageUrl(newId), customImage: true });
  } catch (err) {
    await deleteImage(newId);
    return handleError(err);
  }
}

/** Remove the uploaded photo (the page falls back to the bundled one). */
export async function DELETE(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const col = (await getDb()).collection<PageDoc>(COLLECTIONS.pages);
    const old = currentImageId(await col.findOne({ _id: "about" }));
    await col.updateOne({ _id: "about" }, { $unset: { "founder.imageId": "" } });
    if (old) await deleteImage(String(old));
    refresh(TAGS.about);
    return Response.json({ imageUrl: DEFAULT_ABOUT_IMAGE, customImage: false });
  } catch (err) {
    return handleError(err);
  }
}
