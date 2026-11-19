import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, parseOrError, refresh } from "@/lib/api";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { heroSliderSchema } from "@/lib/schemas";
import { normalizeHeroSlider } from "@/lib/settings";
import { TAGS } from "@/lib/tags";

type SettingsDoc = { _id: string } & Record<string, unknown>;

/** Hero slider behaviour (autoplay, seconds per slide, pause on hover). */
export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const doc = await db.collection<SettingsDoc>(COLLECTIONS.settings).findOne({ _id: "site" });
    return Response.json(normalizeHeroSlider(doc?.heroSlider));
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const parsed = parseOrError(heroSliderSchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    // only touches the heroSlider field — contact settings are left untouched
    await db
      .collection<SettingsDoc>(COLLECTIONS.settings)
      .updateOne({ _id: "site" }, { $set: { heroSlider: parsed.data } }, { upsert: true });
    refresh(TAGS.settings);
    return Response.json(normalizeHeroSlider(parsed.data));
  } catch (err) {
    return handleError(err);
  }
}
