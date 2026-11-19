import type { Metadata } from "next";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { BookingForm } from "@/components/site/BookingForm";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Faq } from "@/components/site/Faq";
import { Reveal } from "@/components/ui/Reveal";
import { FacebookIcon, InstagramIcon, WhatsAppIcon } from "@/components/icons/Brand";
import { getServices, getSettings } from "@/lib/data";
import { FAQS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact & Book an Appointment",
  description:
    "Book your appointment at Darjeeling Hair Company, Shop No. 5, Jai Complex, Darjeeling 734101. Call or WhatsApp +91 73841 63348.",
};

export default async function ContactPage() {
  const [s, services] = await Promise.all([getSettings(), getServices()]);
  const tel = s.phone.replace(/\s/g, "");
  const cards = [
    { Icon: Phone, k: "Call us", v: s.phone, href: `tel:${tel}` },
    { Icon: WhatsAppIcon, k: "WhatsApp", v: "Chat with us instantly", href: `https://wa.me/${s.whatsapp}` },
    { Icon: Mail, k: "Email", v: s.email, href: `mailto:${s.email}` },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Book Your *Appointment*"
        intro="Reserve your chair online in under a minute, or reach us directly — we're always happy to help you choose the right service."
      />

      <section id="book" className="scroll-mt-24 px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <BookingForm services={services.map((x) => x.title)} whatsapp={s.whatsapp} />
          </Reveal>

          <div className="space-y-4">
            {cards.map(({ Icon, k, v, href }, i) => (
              <Reveal key={k} delay={i * 0.05}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="s-card group flex items-center gap-4 p-5 transition hover:border-accent/40 hover:bg-white"
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm">{k}</span>
                    <span className="block truncate font-semibold text-espresso group-hover:text-accent">{v}</span>
                  </span>
                </a>
              </Reveal>
            ))}

            <Reveal delay={0.15}>
              <div className="s-card p-6">
                <div className="flex gap-4">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-semibold text-espresso">Visit the salon</p>
                    <p className="mt-1">{s.addressLine1}</p>
                    {s.addressLine2 && <p>{s.addressLine2}</p>}
                    <p>{s.city} {s.pincode}</p>
                  </div>
                </div>
                <div className="mt-5 flex gap-4 border-t border-line pt-5">
                  <Clock className="mt-0.5 size-5 shrink-0 text-accent" />
                  <ul className="flex-1 space-y-1.5 text-sm">
                    {s.hours.map((h) => (
                      <li key={h.label} className="flex justify-between gap-4">
                        <span>{h.label}</span>
                        <span className="font-semibold text-espresso">{h.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {s.googleMapsUrl && (
                    <a href={s.googleMapsUrl} target="_blank" rel="noreferrer" className="s-btn-outline !px-4 !py-2 !text-sm">
                      <Navigation className="size-3.5" /> Google Maps
                    </a>
                  )}
                  {s.appleMapsUrl && (
                    <a href={s.appleMapsUrl} target="_blank" rel="noreferrer" className="s-btn-outline !px-4 !py-2 !text-sm">
                      <Navigation className="size-3.5" /> Apple Maps
                    </a>
                  )}
                  {s.instagramUrl && (
                    <a href={s.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="s-btn-outline !px-3 !py-2">
                      <InstagramIcon className="size-4" />
                    </a>
                  )}
                  {s.facebookUrl && (
                    <a href={s.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="s-btn-outline !px-3 !py-2">
                      <FacebookIcon className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {s.mapEmbedUrl && (
        <section className="px-5 pb-20 md:px-8">
          <Reveal className="mx-auto max-w-6xl">
            <div className="overflow-hidden rounded-2xl border border-line shadow-soft">
              <iframe
                title="Map to Darjeeling Hair Company"
                src={s.mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[420px] w-full"
              />
            </div>
          </Reveal>
        </section>
      )}

      <section className="bg-white px-5 py-20 md:px-8 md:py-24">
        <SectionHeading eyebrow="Before you visit" title="Common Questions" />
        <div className="mt-12">
          <Faq items={FAQS} />
        </div>
      </section>
    </>
  );
}
