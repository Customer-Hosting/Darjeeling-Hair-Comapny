import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServicesExplorer } from "@/components/site/ServicesExplorer";
import { Steps } from "@/components/site/Steps";
import { Faq } from "@/components/site/Faq";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Reveal } from "@/components/ui/Reveal";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCatalog, getServiceCatalog, getSettings } from "@/lib/data";
import { FAQS, PROCESS_STEPS } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Hair Services — Cuts, Colour, Balayage & Treatments",
  description: "Haircuts, global colour, balayage, ombré, highlights, nanoplastia, hair botox, protein, hair spa, straightening & perming in Darjeeling. Book online.",
  path: "/services",
  keywords: ["hair services Darjeeling","salon services Darjeeling","hair treatment Darjeeling"],
});

export default async function ServicesPage() {
  const [serviceCatalog, s, catalog] = await Promise.all([getServiceCatalog(), getSettings(), getCatalog()]);
  const productCategories = catalog.categories
    .map((c) => ({ ...c, count: catalog.products.filter((p) => p.categoryId === c.id).length }))
    .filter((c) => c.count > 0);
  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Cuts, Colour & *Care*"
        intro="From a sharp everyday cut to a full colour transformation, every service is tailored to you. Prices vary by hair length and condition — we confirm during your consultation."
      />

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <ServicesExplorer catalog={serviceCatalog} />
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
              {productCategories.map((c) => (
                <li key={c.id}>
                  <Link href="/products" className="group flex items-center justify-between gap-6 px-6 py-5 transition hover:bg-white">
                    <span>
                      <span className="h-serif block text-xl transition group-hover:text-accent">{c.name}</span>
                      {c.description && <span className="mt-0.5 block text-sm">{c.description}</span>}
                    </span>
                    <span className="flex shrink-0 items-center gap-2 text-sm text-body">
                      {c.count} product{c.count > 1 ? "s" : ""}
                      <ArrowRight className="size-4 transition group-hover:translate-x-1 group-hover:text-accent" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/products" className="s-btn-outline mt-5">
              Browse all products <ArrowRight className="size-4" />
            </Link>
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
