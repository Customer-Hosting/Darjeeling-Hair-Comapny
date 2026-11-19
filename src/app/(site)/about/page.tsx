import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
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
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { getAbout, getSettings } from "@/lib/data";

// SEO comes from the admin-editable About content
export async function generateMetadata(): Promise<Metadata> {
  const a = await getAbout();
  return pageMetadata({
    title: a.seo.title,
    description: a.seo.description,
    path: "/about",
    keywords: [a.founder.name, "hair stylist Darjeeling", "about Darjeeling Hair Company"],
  });
}

/** "17+" → animated counter; "2021" or free text → shown as-is. */
function toStat(value: string, label: string) {
  const m = value.trim().match(/^(\d{1,3})(\D{0,3})$/);
  return m ? { value: Number(m[1]), suffix: m[2], label } : { value: 0, text: value, label };
}

export default async function AboutPage() {
  const [a, s] = await Promise.all([getAbout(), getSettings()]);
  const paragraphs = a.founder.body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <>
      <PageHeader eyebrow={a.header.eyebrow || "About us"} title={a.header.title} intro={a.header.intro || undefined} />

      {/* Founder */}
      <section className="px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
              <Img src={a.founder.imageUrl} alt={a.founder.name} fill sizes="(min-width:1024px) 480px, 100vw" className="object-cover" />
            </div>
            <LogoBadge className="absolute -right-3 -bottom-6 w-24 ring-8 ring-canvas sm:w-28 md:-right-6" />
          </Reveal>
          <div>
            <SectionHeading align="left" eyebrow={a.founder.eyebrow || undefined} title={a.founder.name} />
            <Reveal delay={0.08}>
              {paragraphs.map((p, i) => (
                <p key={i} className={i === 0 ? "mt-5 leading-relaxed" : "mt-4 leading-relaxed"}>
                  {p}
                </p>
              ))}
              {a.founder.highlights.length > 0 && (
                <div className="mt-7">
                  <CheckList items={a.founder.highlights} />
                </div>
              )}
              {a.founder.showFollowButton && <FollowButton s={s} className="mt-8" />}
            </Reveal>
          </div>
        </div>
      </section>

      {a.stats.length > 0 && (
        <section className="px-5 pb-20 md:pb-28">
          <StatsRow stats={a.stats.map((x) => toStat(x.value, x.label))} />
        </section>
      )}

      {a.journey.items.length > 0 && (
        <section className="bg-white px-5 py-20 md:px-8 md:py-28">
          <SectionHeading eyebrow={a.journey.eyebrow || undefined} title={a.journey.title || "Our Story"} />
          <div className="mt-14">
            <AlternatingTimeline items={a.journey.items} />
          </div>
        </section>
      )}

      {a.values.items.length > 0 && (
        <section className="px-5 py-20 md:px-8 md:py-28">
          <SectionHeading eyebrow={a.values.eyebrow || undefined} title={a.values.title || "Our Values"} />
          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 md:grid-cols-3">
            {a.values.items.map(({ icon, title, text }, i) => (
              <Reveal key={`${title}-${i}`} delay={(i % 3) * 0.06} className="h-full">
                <div className="s-card h-full p-7">
                  <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
                    <CategoryIcon icon={icon} className="size-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="h-serif mt-5 text-xl">{title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <CtaBanner whatsapp={s.whatsapp} phone={s.phone} />
    </>
  );
}
