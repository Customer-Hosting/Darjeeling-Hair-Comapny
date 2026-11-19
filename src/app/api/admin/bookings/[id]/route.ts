import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { handleError, jsonError, parseOrError, toObjectId } from "@/lib/api";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { bookingStatusSchema } from "@/lib/schemas";
import { toBooking } from "@/lib/serialize";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const _id = toObjectId((await params).id);
  if (!_id) return jsonError("Invalid id", 404);
  try {
    const parsed = parseOrError(bookingStatusSchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const db = await getDb();
    const doc = await db
      .collection(COLLECTIONS.bookings)
      .findOneAndUpdate({ _id }, { $set: parsed.data }, { returnDocument: "after" });
    if (!doc) return jsonError("Booking not found", 404);
    return Response.json(toBooking(doc));
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!(await verifyAdmin(req))) return unauthorized();
  const _id = toObjectId((await params).id);
  if (!_id) return jsonError("Invalid id", 404);
  try {
    const db = await getDb();
    const res = await db.collection(COLLECTIONS.bookings).deleteOne({ _id });
    if (!res.deletedCount) return jsonError("Booking not found", 404);
    return Response.json({ ok: true });
  } catch (err) {
    return handleError(err);
  }
}
