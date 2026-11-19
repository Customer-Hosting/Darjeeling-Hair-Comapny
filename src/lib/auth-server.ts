import "server-only";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

/**
 * Verifies Firebase ID tokens without a service account, using Google's
 * public signing keys (the documented approach for third-party JWT libs).
 */
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export type AdminUser = { uid: string; email: string };

type FirebaseClaims = JWTPayload & {
  email?: string;
  email_verified?: boolean;
};

function adminEmails(): string[] {
  return (process.env.SUPER_ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function verifyAdmin(req: Request): Promise<AdminUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!token || !projectId) return null;
  try {
    const { payload } = await jwtVerify<FirebaseClaims>(token, JWKS, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    });
    const email = payload.email?.toLowerCase();
    if (!payload.sub || !email) return null;
    if (!adminEmails().includes(email)) return null;
    return { uid: payload.sub, email };
  } catch {
    return null;
  }
}

export function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}
