import Image, { type ImageProps } from "next/image";

/**
 * next/image wrapper. Images served from MongoDB (/api/images/…) are already
 * compressed on upload, so they skip the optimizer and are served directly.
 */
export function Img({ alt, unoptimized, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <Image alt={alt} {...props} unoptimized={unoptimized ?? src.startsWith("/api/")} />;
}
