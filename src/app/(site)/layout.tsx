import "./site.css";
import { Navbar } from "@/components/site/Navbar";
import { TopBar } from "@/components/site/TopBar";
import { Footer } from "@/components/site/Footer";
import { WhatsAppChat } from "@/components/site/WhatsAppChat";
import { BackToTop } from "@/components/site/BackToTop";
import { Analytics } from "@/components/site/Analytics";
import { getServices, getSettings } from "@/lib/data";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  const services = await getServices();

  // Structured data (schema.org) for Google: the salon (LocalBusiness/HairSalon) + the website.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HairSalon",
        "@id": absoluteUrl("/#salon"),
        name: SITE_NAME,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        foundingDate: "2021",
        founder: { "@type": "Person", name: "Pranay Chettri", jobTitle: "Founder & Master Stylist" },
        telephone: s.phone,
        email: s.email,
        image: [absoluteUrl("/opengraph-image.png"), absoluteUrl("/images/brand/logo.png")],
        logo: absoluteUrl("/images/brand/logo.png"),
        priceRange: "₹₹",
        currenciesAccepted: "INR",
        address: {
          "@type": "PostalAddress",
          streetAddress: [s.addressLine1, s.addressLine2].filter(Boolean).join(", "),
          addressLocality: "Darjeeling",
          addressRegion: "West Bengal",
          postalCode: s.pincode,
          addressCountry: "IN",
        },
        areaServed: { "@type": "City", name: "Darjeeling" },
        ...(s.googleMapsUrl ? { hasMap: s.googleMapsUrl } : {}),
        contactPoint: [s.phone, ...s.extraPhones.map((p) => p.value)].map((telephone) => ({
          "@type": "ContactPoint",
          telephone,
          contactType: "customer service",
          areaServed: "IN",
          availableLanguage: ["English", "Hindi", "Nepali", "Bengali"],
        })),
        knowsAbout: services.map((x) => x.title),
        sameAs: s.socials.map((x) => x.url),
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        url: SITE_URL,
        name: SITE_NAME,
        inLanguage: "en-IN",
        publisher: { "@id": absoluteUrl("/#salon") },
      },
    ],
  };

  return (
    <div className="site min-h-dvh">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <TopBar s={s} />
      <Navbar phone={s.phone} whatsapp={s.whatsapp} socials={s.socials} />
      <main>{children}</main>
      <Footer s={s} />
      <WhatsAppChat whatsapp={s.whatsapp} />
      <BackToTop />
      <Analytics />
    </div>
  );
}
