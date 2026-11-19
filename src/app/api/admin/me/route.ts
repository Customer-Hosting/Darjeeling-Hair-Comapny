import { unauthorized, verifyAdmin } from "@/lib/auth-server";
import { isDbConfigured } from "@/lib/mongodb";

export async function GET(req: Request) {
  const admin = await verifyAdmin(req);
  if (!admin) return unauthorized();
  return Response.json({ ...admin, dbConfigured: isDbConfigured() });
}
