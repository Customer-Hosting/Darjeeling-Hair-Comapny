import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { BadgeCheck, MessageCircle, Sparkles, Store, UserRoundCheck } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ProductsExplorer } from "@/components/site/ProductsExplorer";
import { Steps } from "@/components/site/Steps";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Reveal } from "@/components/ui/Reveal";
import { getCatalog, getSettings } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "L'Oréal Professionnel Hair Care Products",
  description: "Professional L'Oréal Professionnel hair care in Darjeeling — shampoo, hair masks, serums, wax and clay. Ask your stylist or enquire on WhatsApp.",
  path: "/products",
  keywords: ["L'Oréal Professionnel products Darjeeling","hair care products Darjeeling","shampoo hair mask serum Darjeeling"],
});

const WHY = [
  { Icon: BadgeCheck, title: "Genuine professional products", text: "The same salon-grade formulas we use in the chair — no imitations." },
  { Icon: UserRoundCheck, title: "Recommended for your hair", text: "Your stylist matches each product to your hair type, colour and routine." },
  { Icon: Sparkles, title: "Make results last", text: "The right home care keeps colour vibrant and treatments working longer." },
];

const HOW = [
  { title: "Ask your stylist", text: "During your visit we'll recommend exactly what your hair needs — no hard sell." },
  { title: "Or message us on WhatsApp", text: "Tap “Ask on WhatsApp” on any product to check price and availability." },
  { title: "Pick up in the salon", text: "Collect your products at Jai Complex, Darjeeling — at your next visit or any time we're open." },
];

export default async function ProductsPage() {
  const [catalog, s] = await Promise.all([getCatalog(), getSettings()]);
  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Professional *Hair Care*"
        intro="Take the salon home. Shampoos, hair masks, serums and styling products — chosen by our stylists and available right here in the salon."
      />

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <ProductsExplorer catalog={catalog} whatsapp={s.whatsapp} />
        </div>
      </section>

      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="Why buy from us" title="Salon Results, *At Home*" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
          {WHY.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06} className="h-full">
              <div className="s-card h-full p-7">
                <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className="h-serif mt-5 text-lg">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="How to buy" title="Three Easy Ways" intro="No online checkout needed — we'll help you pick the right product." />
        <div className="mt-12">
          <Steps steps={HOW} />
        </div>
        <Reveal className="mt-12 flex flex-wrap justify-center gap-3">
          <a href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Hi! I'd like some advice on hair care products.")}`} target="_blank" rel="noreferrer" className="s-btn-accent">
            <MessageCircle className="size-4" /> Get product advice
          </a>
          <a href={s.googleMapsUrl || "/contact"} target="_blank" rel="noreferrer" className="s-btn-outline">
            <Store className="size-4" /> Visit the salon
          </a>
        </Reveal>
      </section>

      <CtaBanner whatsapp={s.whatsapp} phone={s.phone} />
    </>
  );
}
