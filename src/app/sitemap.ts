import type { MetadataRoute } from "next";
import { getCatalog, getGallery, getHeroSlides, getServices } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

/**
 * /sitemap.xml — every public page, with image entries so Google Images can
 * discover the salon's photos. Admin and API routes are intentionally excluded.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slides, services, gallery, catalog] = await Promise.all([
    getHeroSlides(),
    getServices(),
    getGallery(),
    getCatalog(),
  ]);
  const imgs = (urls: (string | null | undefined)[]) =>
    [...new Set(urls.filter((u): u is string => !!u).map((u) => absoluteUrl(u)))].slice(0, 1000);

  const lastModified = new Date();
  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1, images: imgs(slides.map((s) => s.imageUrl)) },
    { url: absoluteUrl("/services"), lastModified, changeFrequency: "weekly", priority: 0.9, images: imgs(services.map((s) => s.imageUrl)) },
    { url: absoluteUrl("/products"), lastModified, changeFrequency: "weekly", priority: 0.8, images: imgs(catalog.products.map((p) => p.imageUrl)) },
    { url: absoluteUrl("/gallery"), lastModified, changeFrequency: "weekly", priority: 0.8, images: imgs(gallery.map((g) => g.imageUrl)) },
    { url: absoluteUrl("/about"), lastModified, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/contact"), lastModified, changeFrequency: "monthly", priority: 0.9 },
  ];
}
