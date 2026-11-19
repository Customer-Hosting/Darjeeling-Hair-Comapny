import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, parseOrError, refresh } from "@/lib/api";
import { normalizeAbout } from "@/lib/about";
import { imageUrl } from "@/lib/images";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { aboutSchema } from "@/lib/schemas";
import { TAGS } from "@/lib/tags";

type PageDoc = { _id: string } & Record<string, unknown>;

async function load() {
  const db = await getDb();
  const doc = await db.collection<PageDoc>(COLLECTIONS.pages).findOne({ _id: "about" });
  const imageId = (doc?.founder as { imageId?: unknown } | undefined)?.imageId;
  return normalizeAbout(doc, imageId ? imageUrl(String(imageId)) : null);
}

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    return Response.json(await load());
  } catch (err) {
    return handleError(err);
  }
}

export async function PUT(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const parsed = parseOrError(aboutSchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const { founder, ...rest } = parsed.data;
    const db = await getDb();
    // founder.imageId is managed by /api/admin/about/image — update the other founder fields individually
    await db.collection<PageDoc>(COLLECTIONS.pages).updateOne(
      { _id: "about" },
      {
        $set: {
          ...rest,
          "founder.eyebrow": founder.eyebrow,
          "founder.name": founder.name,
          "founder.body": founder.body,
          "founder.highlights": founder.highlights,
          "founder.showFollowButton": founder.showFollowButton,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    refresh(TAGS.about);
    return Response.json(await load());
  } catch (err) {
    return handleError(err);
  }
}
