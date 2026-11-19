import { Readable } from "node:stream";
import { openImage } from "@/lib/images";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const img = await openImage(id);
    if (!img) return new Response("Not found", { status: 404 });
    return new Response(Readable.toWeb(img.stream) as ReadableStream, {
      headers: {
        "Content-Type": img.contentType,
        "Content-Length": String(img.length),
        // ids are immutable — a replaced image always gets a new id
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("[images]", err);
    return new Response("Image unavailable", { status: 503 });
  }
}
