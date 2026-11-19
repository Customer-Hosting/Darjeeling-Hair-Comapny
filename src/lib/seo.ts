import type { Metadata } from "next";

/**
 * Public site URL used for canonical links, Open Graph and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL to the live domain in production (e.g. https://darjeelinghaircompany.in).
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "");
export const SITE_NAME = "Darjeeling Hair Company";
export const SITE_DESCRIPTION =
  "Premium unisex salon at Jai Complex, Darjeeling. Toni&Guy-trained founder with 17 years of experience — haircuts, balayage, ombré, highlights, global colour, nanoplastia, hair botox, protein treatments, hair spa, straightening and perming with L'Oréal Professionnel products.";

export const SITE_KEYWORDS = [
  "Darjeeling Hair Company",
  "salon in Darjeeling",
  "unisex salon Darjeeling",
  "best hair salon Darjeeling",
  "haircut Darjeeling",
  "hair colour Darjeeling",
  "balayage Darjeeling",
  "ombre hair Darjeeling",
  "highlights Darjeeling",
  "nanoplastia Darjeeling",
  "hair botox Darjeeling",
  "keratin and protein treatment Darjeeling",
  "hair spa Darjeeling",
  "hair straightening Darjeeling",
  "L'Oréal Professionnel salon Darjeeling",
  "Toni&Guy trained stylist",
  "Jai Complex Darjeeling",
];

/** Absolute URL for a site path. */
export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Per-page metadata: title, description, canonical URL and matching
 * Open Graph / Twitter cards (the shared social image comes from app/opengraph-image.png).
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords = [],
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const fullTitle = path === "/" ? title : `${title} · ${SITE_NAME}`;
  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    keywords: [...keywords, ...SITE_KEYWORDS],
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      url: path,
      siteName: SITE_NAME,
      locale: "en_IN",
      title: fullTitle,
      description,
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
  };
}
