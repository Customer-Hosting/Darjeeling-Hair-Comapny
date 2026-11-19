import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, refresh } from "@/lib/api";
import { STARTER_SERVICES, slugify } from "@/lib/defaults";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { TAGS } from "@/lib/tags";

/** One-click import of the salon's starter service list (only when empty). */
export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const col = db.collection(COLLECTIONS.services);
    if ((await col.countDocuments()) > 0) {
      return jsonError("Services already exist — starter list not imported", 409);
    }
    const now = new Date();
    await col.insertMany(
      STARTER_SERVICES.map((s, i) => ({
        ...s,
        slug: slugify(s.title),
        imageId: null,
        active: true,
        order: i,
        createdAt: now,
        updatedAt: now,
      })),
    );
    refresh(TAGS.services);
    return Response.json({ ok: true, count: STARTER_SERVICES.length });
  } catch (err) {
    return handleError(err);
  }
}
