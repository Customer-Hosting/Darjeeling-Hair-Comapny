import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Only two font families are downloaded: Fraunces (headings) + Inter (body).
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Favicon (app/icon.png), Apple icon and social preview (app/opengraph-image.png)
// are picked up automatically via Next.js file conventions.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Darjeeling Hair Company — Premium Unisex Salon in Darjeeling",
    template: "%s · Darjeeling Hair Company",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Beauty & Hair Salon",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    url: "/",
    title: "Darjeeling Hair Company — Premium Unisex Salon in Darjeeling",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Darjeeling Hair Company — Premium Unisex Salon in Darjeeling",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#fdfaf6",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
