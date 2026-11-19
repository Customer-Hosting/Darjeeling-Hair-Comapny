import "server-only";
import { GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "node:stream";
import { getDb } from "./mongodb";

const BUCKET = "images";
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

async function bucket() {
  return new GridFSBucket(await getDb(), { bucketName: BUCKET });
}

export function imageUrl(id: ObjectId | string): string {
  return `/api/images/${id.toString()}`;
}

export class UploadError extends Error {}

/** Stores an uploaded File in MongoDB GridFS and returns its ObjectId. */
export async function saveImage(file: File): Promise<ObjectId> {
  if (!ALLOWED.has(file.type)) {
    throw new UploadError("Only JPG, PNG, WEBP, AVIF or GIF images are allowed");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new UploadError("Image must be 8 MB or smaller");
  }
  const b = await bucket();
  const buffer = Buffer.from(await file.arrayBuffer());
  const upload = b.openUploadStream(file.name || "upload", {
    metadata: { contentType: file.type },
  });
  await new Promise<void>((resolve, reject) => {
    Readable.from(buffer).pipe(upload).on("finish", resolve).on("error", reject);
  });
  return upload.id as ObjectId;
}

export async function deleteImage(id: ObjectId | string | null | undefined) {
  if (!id) return;
  try {
    const b = await bucket();
    await b.delete(typeof id === "string" ? new ObjectId(id) : id);
  } catch {
    // file already gone – ignore
  }
}

export async function openImage(id: string) {
  if (!ObjectId.isValid(id)) return null;
  const b = await bucket();
  const _id = new ObjectId(id);
  const [file] = await b.find({ _id }).limit(1).toArray();
  if (!file) return null;
  return {
    contentType:
      (file.metadata?.contentType as string | undefined) ?? "application/octet-stream",
    length: file.length,
    stream: b.openDownloadStream(_id),
  };
}
