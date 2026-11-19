import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, parseOrError, refresh } from "@/lib/api";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { settingsSchema } from "@/lib/schemas";
import { normalizeSettings } from "@/lib/settings";
import { TAGS } from "@/lib/tags";

type SettingsDoc = { _id: string } & Record<string, unknown>;

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const doc = await db.collection<SettingsDoc>(COLLECTIONS.settings).findOne({ _id: "site" });
    return Response.json(normalizeSettings(doc));
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const parsed = parseOrError(settingsSchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    await db.collection<SettingsDoc>(COLLECTIONS.settings).updateOne(
      { _id: "site" },
      {
        $set: parsed.data,
        // legacy fixed social fields now live in `socials`
        $unset: { instagramUrl: "", facebookUrl: "" },
      },
      { upsert: true },
    );
    refresh(TAGS.settings);
    const saved = await db.collection<SettingsDoc>(COLLECTIONS.settings).findOne({ _id: "site" });
    return Response.json(normalizeSettings(saved));
  } catch (err) {
    return handleError(err);
  }
}
