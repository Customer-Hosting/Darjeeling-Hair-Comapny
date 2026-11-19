import { handleError, parseOrError } from "@/lib/api";
import { COLLECTIONS, getDb } from "@/lib/mongodb";
import { bookingSchema } from "@/lib/schemas";

// Basic in-memory throttle: max 5 requests / 10 min per IP (per server instance)
const hits = new Map<string, number[]>();
function throttled(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (throttled(ip)) {
    return Response.json(
      { error: "Too many requests. Please call or WhatsApp us instead." },
      { status: 429 },
    );
  }
  try {
    const parsed = parseOrError(bookingSchema, await req.json());
    if (!parsed.ok) return parsed.res;
    const { company: _hp, ...data } = parsed.data;
    void _hp;
    const today = new Date().toISOString().slice(0, 10);
    if (data.date < today) {
      return Response.json({ error: "date: Please choose today or a future date" }, { status: 422 });
    }
    const db = await getDb();
    await db
      .collection(COLLECTIONS.bookings)
      .insertOne({ ...data, status: "pending", createdAt: new Date() });
    return Response.json({ ok: true }, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
