import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, Instrument_Serif, Manrope, Syne, Yellowtail } from "next/font/google";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", axes: ["SOFT", "WONK", "opsz"], display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const yellowtail = Yellowtail({ subsets: ["latin"], weight: "400", variable: "--font-yellowtail", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Favicon (app/icon.png), Apple icon and social preview (app/opengraph-image.png)
// are picked up automatically via Next.js file conventions.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Darjeeling Hair Company — Premium Unisex Salon in Darjeeling",
    template: "%s · Darjeeling Hair Company",
  },
  description:
    "Premium unisex salon at Jai Complex, Darjeeling. Toni&Guy-trained founder with 17 years of experience — haircuts, balayage, ombré, highlights, nanoplastia, hair botox, keratin & L'Oréal Professionnel treatments.",
  keywords: [
    "salon in Darjeeling",
    "unisex salon Darjeeling",
    "hair colour Darjeeling",
    "balayage Darjeeling",
    "nanoplastia",
    "hair botox",
    "Darjeeling Hair Company",
  ],
  openGraph: { type: "website", siteName: "Darjeeling Hair Company" },
};

export const viewport: Viewport = {
  themeColor: "#06110e",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${manrope.variable} ${syne.variable} ${instrument.variable} ${yellowtail.variable} ${fraunces.variable} ${inter.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
