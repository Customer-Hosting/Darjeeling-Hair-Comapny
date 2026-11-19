import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { BookingForm } from "@/components/site/BookingForm";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Faq } from "@/components/site/Faq";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/icons/Brand";
import { SocialLinks } from "@/components/icons/Social";
import { telHref } from "@/lib/settings";
import { getServices, getSettings } from "@/lib/data";
import { FAQS } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Contact & Book an Appointment",
  description: "Book at Darjeeling Hair Company, Shop No. 5, Jai Complex, Darjeeling 734101. Call or WhatsApp +91 73841 63348, or book online in under a minute.",
  path: "/contact",
  keywords: ["book salon appointment Darjeeling","salon near me Darjeeling","Darjeeling Hair Company contact"],
});

export default async function ContactPage() {
  const [s, services] = await Promise.all([getSettings(), getServices()]);
  const phones = [{ label: "", value: s.phone }, ...s.extraPhones];
  const emails = [{ label: "", value: s.email }, ...s.extraEmails];
  const groups = [
    { Icon: Phone, k: "Call us", items: phones.map((p) => ({ ...p, href: telHref(p.value) })) },
    {
      Icon: WhatsAppIcon,
      k: "WhatsApp",
      items: [{ label: "", value: "Chat with us instantly", href: `https://wa.me/${s.whatsapp}` }],
    },
    { Icon: Mail, k: emails.length > 1 ? "Email us" : "Email", items: emails.map((e) => ({ ...e, href: `mailto:${e.value}` })) },
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
            {groups.map(({ Icon, k, items }, i) => (
              <Reveal key={k} delay={i * 0.05}>
                <div className="s-card flex gap-4 p-5">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">{k}</p>
                    <ul className="mt-0.5 space-y-1">
                      {items.map((it) => (
                        <li key={it.href}>
                          <a
                            href={it.href}
                            target={it.href.startsWith("http") ? "_blank" : undefined}
                            rel="noreferrer"
                            className="block truncate font-semibold text-espresso transition hover:text-accent"
                          >
                            {it.value}
                            {it.label && <span className="ml-1.5 text-sm font-normal text-body">· {it.label}</span>}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}

            {s.socials.length > 0 && (
              <Reveal delay={0.12}>
                <div className="s-card p-5">
                  <p className="text-sm">Follow us</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <SocialLinks
                      socials={s.socials}
                      iconClassName="size-[18px]"
                      itemClassName="grid size-11 place-items-center rounded-full border border-line bg-white text-espresso transition hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                    />
                  </div>
                </div>
              </Reveal>
            )}

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
