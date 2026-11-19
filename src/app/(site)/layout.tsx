import "./site.css";
import { Navbar } from "@/components/site/Navbar";
import { TopBar } from "@/components/site/TopBar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFab } from "@/components/site/WhatsAppFab";
import { Analytics } from "@/components/site/Analytics";
import { getSettings } from "@/lib/data";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: "Darjeeling Hair Company",
    description: "Premium unisex salon in Darjeeling by Toni&Guy-trained stylist Pranay Chettri.",
    foundingDate: "2021",
    founder: { "@type": "Person", name: "Pranay Chettri" },
    telephone: s.phone,
    email: s.email,
    image: "/images/brand/logo.png",
    logo: "/images/brand/logo.png",
    address: {
      "@type": "PostalAddress",
      streetAddress: [s.addressLine1, s.addressLine2].filter(Boolean).join(", "),
      addressLocality: "Darjeeling",
      addressRegion: "West Bengal",
      postalCode: s.pincode,
      addressCountry: "IN",
    },
    sameAs: [s.instagramUrl, s.facebookUrl].filter(Boolean),
  };

  return (
    <div className="site min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <TopBar s={s} />
      <Navbar phone={s.phone} whatsapp={s.whatsapp} instagramUrl={s.instagramUrl} facebookUrl={s.facebookUrl} />
      <main>{children}</main>
      <Footer s={s} />
      <WhatsAppFab whatsapp={s.whatsapp} />
      <Analytics />
    </div>
  );
}
