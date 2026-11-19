import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, parseOrError, refresh } from "@/lib/api";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { settingsSchema } from "@/lib/schemas";
import { TAGS } from "@/lib/tags";
import type { SiteSettings } from "@/lib/types";

type SettingsDoc = { _id: string } & Partial<SiteSettings>;

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const doc = await db.collection<SettingsDoc>(COLLECTIONS.settings).findOne({ _id: "site" });
    const { _id: _ignored, ...rest } = doc ?? { _id: "site" };
    void _ignored;
    return Response.json({ ...DEFAULT_SETTINGS, ...rest });
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
    await db
      .collection<SettingsDoc>(COLLECTIONS.settings)
      .updateOne({ _id: "site" }, { $set: parsed.data }, { upsert: true });
    refresh(TAGS.settings);
    return Response.json(parsed.data);
  } catch (err) {
    return handleError(err);
  }
}
