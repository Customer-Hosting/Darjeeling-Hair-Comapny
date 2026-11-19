import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServicesExplorer } from "@/components/site/ServicesExplorer";
import { Steps } from "@/components/site/Steps";
import { Faq } from "@/components/site/Faq";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Reveal } from "@/components/ui/Reveal";
import { getServices, getSettings } from "@/lib/data";
import { PRODUCTS } from "@/lib/defaults";
import { FAQS, PROCESS_STEPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Haircuts, global colour, balayage, ombré, highlights, nanoplastia, hair botox, protein treatment, hair spa, straightening and perming in Darjeeling.",
};

export default async function ServicesPage() {
  const [services, s] = await Promise.all([getServices(), getSettings()]);
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Cuts, Colour & *Care*"
        intro="From a sharp everyday cut to a full colour transformation, every service is tailored to you. Prices vary by hair length and condition — we confirm during your consultation."
      />

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <ServicesExplorer services={services} />
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="How it works" title="What to Expect at Your Visit" />
        <div className="mt-12">
          <Steps steps={PROCESS_STEPS} />
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_1.3fr]">
          <SectionHeading
            align="left"
            eyebrow="Retail · L'Oréal Professionnel"
            title="Professional Products, *At Home*"
            intro="Ask your stylist which formula suits your hair — all available in the salon."
          />
          <Reveal>
            <ul className="s-card divide-y divide-line">
              {PRODUCTS.map((p) => (
                <li key={p.name} className="flex items-center justify-between gap-6 px-6 py-5">
                  <span className="h-serif text-xl">{p.name}</span>
                  <span className="text-right text-sm">{p.note}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="Questions" title="Service FAQs" />
        <div className="mt-12">
          <Faq items={FAQS.slice(1, 5)} />
        </div>
      </section>

      <CtaBanner whatsapp={s.whatsapp} phone={s.phone} />
    </>
  );
}
