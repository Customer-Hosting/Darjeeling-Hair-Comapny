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
};

export default nextConfig;
