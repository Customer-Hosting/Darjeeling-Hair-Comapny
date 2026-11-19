import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/seo";

/** /robots.txt — allow the public site, keep the admin panel and API out of search engines. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/images/"],
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
