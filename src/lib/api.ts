import "server-only";
import { ObjectId } from "mongodb";
import { revalidateTag } from "next/cache";
import type { z } from "zod";
import { UploadError } from "./images";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

/** Invalidate a public cache tag so the website shows the change right away. */
export function refresh(tag: string) {
  revalidateTag(tag, { expire: 0 });
}

export function toObjectId(id: string): ObjectId | null {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

/** Turns FormData into a plain object (strings + booleans) and pulls out a file. */
export function readForm(form: FormData, fileField = "image") {
  const fields: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (typeof v === "string") fields[k] = v;
  }
  const raw = form.get(fileField);
  const file = raw instanceof File && raw.size > 0 ? raw : null;
  return { fields, file };
}

export function parseOrError<T extends z.ZodType>(
  schema: T,
  input: unknown,
): { ok: true; data: z.infer<T> } | { ok: false; res: Response } {
  const r = schema.safeParse(input);
  if (r.success) return { ok: true, data: r.data };
  const first = r.error.issues[0];
  const where = first?.path?.join(".") || "input";
  return { ok: false, res: jsonError(`${where}: ${first?.message ?? "invalid"}`, 422) };
}

export function handleError(err: unknown) {
  if (err instanceof UploadError) return jsonError(err.message, 400);
  console.error("[api]", err);
  const msg = err instanceof Error ? err.message : "Server error";
  if (msg.includes("MONGODB_URI")) return jsonError(msg, 503);
  return jsonError("Something went wrong. Please try again.", 500);
}
