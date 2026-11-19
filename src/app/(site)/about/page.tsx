import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Heart, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionHeading } from "@/components/site/SectionHeading";
import { StatsRow } from "@/components/site/StatsRow";
import { CheckList } from "@/components/site/CheckList";
import { AlternatingTimeline } from "@/components/site/Steps";
import { CtaBanner } from "@/components/site/CtaBanner";
import { LogoBadge } from "@/components/site/LogoBadge";
import { Reveal } from "@/components/ui/Reveal";
import { Img } from "@/components/ui/Img";
import { FollowButton } from "@/components/site/FollowButton";
import { getSettings } from "@/lib/data";
import { ABOUT_IMAGES } from "@/lib/defaults";

export const metadata: Metadata = pageMetadata({
  title: "About Us — Pranay Chettri, Toni&Guy-Trained Stylist",
  description: "Meet Pranay Chettri, Toni&Guy Mumbai-trained founder of Darjeeling Hair Company — 17 years in the glamour industry. A premium unisex salon since 2021.",
  path: "/about",
  keywords: ["Pranay Chettri","hair stylist Darjeeling","about Darjeeling Hair Company"],
});

const JOURNEY = [
  { title: "Trained at Toni&Guy, Mumbai", text: "Hair education at one of the most respected names in hairdressing — where precision and creativity meet." },
  { title: "17 years in the glamour industry", text: "Nearly two decades of cutting, colouring and transforming hair for every kind of client." },
  { title: "2021 — Darjeeling Hair Company opens", text: "A modern unisex salon at Jai Complex, bringing big-city craft home to the hills." },
  { title: "Today", text: "A skilled team, L'Oréal Professionnel products and a growing family of happy clients." },
];

const VALUES = [
  { Icon: Heart, title: "Consultation first", text: "We listen before we cut. Every service starts with understanding your hair, routine and goals." },
  { Icon: Users, title: "Truly unisex", text: "Sharp fades to soft balayage — a welcoming chair for every person and every style." },
  { Icon: Sparkles, title: "Honest care", text: "Professional products, hygienic tools and advice you can trust for healthy hair at home." },
];

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageHeader
        eyebrow="About us"
        title="A Salon Built on *Craft & Care*"
        intro="Where international training meets mountain warmth — a space designed to make every guest look and feel their absolute best."
      />

      {/* Founder */}
      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
              <Img src={ABOUT_IMAGES.stylist} alt="A stylist giving a precision haircut" fill sizes="(min-width:1024px) 480px, 100vw" className="object-cover" />
            </div>
            <LogoBadge className="absolute -right-3 -bottom-6 w-28 ring-8 ring-canvas md:-right-6" />
          </Reveal>
          <div>
            <SectionHeading align="left" eyebrow="Meet the founder" title="Pranay Chettri" />
            <Reveal delay={0.08}>
              <p className="mt-5 leading-relaxed">
                With hair education from Toni&amp;Guy, Mumbai and 17 years in the glamour industry, Pranay founded Darjeeling Hair
                Company in 2021 with one simple belief: everyone in Darjeeling deserves world-class hair without leaving the hills.
              </p>
              <p className="mt-4 leading-relaxed">
                Every cut, colour and treatment at the salon follows the same approach — listen carefully, recommend honestly, and
                finish with care, using professional L&apos;Oréal products.
              </p>
              <div className="mt-7">
                <CheckList items={["Toni&Guy Mumbai hair education", "17 years of hands-on experience", "Specialist in colour, cuts & treatments"]} />
              </div>
              <FollowButton s={s} className="mt-8" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 md:pb-28">
        <StatsRow
          stats={[
            { value: 17, suffix: "+", label: "Years of experience" },
            { value: 3, label: "Skilled stylists" },
            { value: 11, suffix: "+", label: "Specialist services" },
            { value: 0, text: "2021", label: "Established" },
          ]}
        />
      </section>

      {/* Journey */}
      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="Our story" title="From the Academy to the Hills" />
        <div className="mt-14">
          <AlternatingTimeline items={JOURNEY} />
        </div>
      </section>

      {/* Values */}
      <section className="px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="What we believe" title="Our Values" />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
          {VALUES.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 0.06} className="h-full">
              <div className="s-card h-full p-7">
                <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
                  <Icon className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className="h-serif mt-5 text-xl">{title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBanner whatsapp={s.whatsapp} phone={s.phone} />
    </>
  );
}
