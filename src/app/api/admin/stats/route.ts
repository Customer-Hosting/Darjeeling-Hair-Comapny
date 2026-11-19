import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError } from "@/lib/api";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { toBooking } from "@/lib/serialize";

export async function GET(req: Request) {
  if (!(await verifyAdmin(req))) return unauthorized();
  try {
    const db = await getDb();
    const [hero, services, gallery, pending, total, recent] = await Promise.all([
      db.collection(COLLECTIONS.hero).countDocuments(),
      db.collection(COLLECTIONS.services).countDocuments(),
      db.collection(COLLECTIONS.gallery).countDocuments(),
      db.collection(COLLECTIONS.bookings).countDocuments({ status: "pending" }),
      db.collection(COLLECTIONS.bookings).countDocuments(),
      db.collection(COLLECTIONS.bookings).find().sort({ createdAt: -1 }).limit(5).toArray(),
    ]);
    return Response.json({
      hero,
      services,
      gallery,
      bookings: { pending, total },
      recent: recent.map(toBooking),
    });
  } catch (err) {
    return handleError(err);
  }
}
