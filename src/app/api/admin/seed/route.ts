import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, refresh } from "@/lib/api";
import { getDb } from "@/lib/mongodb";
import { seedSampleContent } from "@/lib/seed";
import { TAGS } from "@/lib/tags";

/**
 * POST /api/admin/seed — import the built-in sample content into MongoDB.
 * Only fills collections that are empty, so it is safe to run more than once.
 */
export async function POST(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const report = await seedSampleContent(await getDb(), new URL(req.url).origin);
    if (report.hero) refresh(TAGS.hero);
    if (report.services || report.serviceCategories) refresh(TAGS.services);
    if (report.gallery) refresh(TAGS.gallery);
    if (report.settings) refresh(TAGS.settings);
    if (report.products || report.productCategories) refresh(TAGS.products);
    return Response.json({ ok: true, ...report });
  } catch (err) {
    return handleError(err);
  }
}
