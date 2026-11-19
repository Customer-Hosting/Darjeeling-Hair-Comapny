import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper used across the site. Every image — bundled files and photos
 * uploaded to MongoDB (/api/images/…) — goes through the Next.js image optimiser,
 * so each device downloads a correctly-sized AVIF/WebP instead of the full original.
 */
export function Img({ alt, ...props }: ImageProps) {
  return <Image alt={alt} {...props} />;
}
