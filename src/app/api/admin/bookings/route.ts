import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError } from "@/lib/api";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { toBooking } from "@/lib/serialize";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const docs = await db
      .collection(COLLECTIONS.bookings)
      .find()
      .sort({ createdAt: -1 })
      .limit(500)
      .toArray();
    return Response.json(docs.map(toBooking));
  } catch (err) {
    return handleError(err);
  }
}
