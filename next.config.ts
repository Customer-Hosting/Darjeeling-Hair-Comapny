import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // mongodb driver must stay a Node.js external (uses native modules / sockets)
  serverExternalPackages: ["mongodb"],
  poweredByHeader: false,
  compress: true,

  images: {
    // Serve modern formats: AVIF (smallest) with WebP fallback.
    formats: ["image/avif", "image/webp"],
    // Uploaded images (/api/images/<id>) are immutable — a replaced photo gets a new id —
    // and bundled /public images rarely change, so optimised copies can be cached for a month.
    minimumCacheTTL: 2678400,
  },

  async headers() {
    return [
      {
        // bundled photos & logo in /public/images
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" }],
      },
      {
        // basic security hardening for every response
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
