import Link from "next/link";
import { ArrowRight, Droplets, Palette, Scissors, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Hero } from "@/components/site/Hero";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ServiceRow } from "@/components/site/ServiceRow";
import { StatsRow } from "@/components/site/StatsRow";
import { CheckList } from "@/components/site/CheckList";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { AlternatingTimeline, Steps } from "@/components/site/Steps";
import { Faq } from "@/components/site/Faq";
import { CtaBanner } from "@/components/site/CtaBanner";
import { Reveal } from "@/components/ui/Reveal";
import { Img } from "@/components/ui/Img";
import { getGallery, getHeroSlides, getServices, getSettings } from "@/lib/data";
import { ABOUT_IMAGES, PRODUCTS } from "@/lib/defaults";
import { DIFFERENCE, FAQS, PROCESS_STEPS, WHY_US } from "@/lib/content";

const WHY_ICONS = { scissors: Scissors, palette: Palette, droplets: Droplets, users: Users, shield: ShieldCheck, sparkles: Sparkles };

/** Round-robin across categories so the preview shows a varied mix. */
function mixCategories<T extends { category: string }>(items: T[]): T[] {
  const groups = new Map<string, T[]>();
  for (const it of items) groups.set(it.category, [...(groups.get(it.category) ?? []), it]);
  const queues = [...groups.values()];
  const out: T[] = [];
  while (out.length < items.length) for (const q of queues) if (q.length) out.push(q.shift()!);
  return out;
}

export default async function HomePage() {
  const [slides, services, gallery, settings] = await Promise.all([
    getHeroSlides(),
    getServices(),
    getGallery(),
    getSettings(),
  ]);
  const featured = (services.some((s) => s.featured) ? services.filter((s) => s.featured) : services).slice(0, 6);

  return (
    <>
      <Hero slides={slides} />

      {/* ── Services ── */}
      <section className="px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          title="Hair Services, *Beautifully Done*"
          intro="Everything your hair needs — cuts, colour, treatments and texture — from stylists who care about the result and the health of your hair."
        />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
          {featured.map((s, i) => (
            <Reveal key={s.id} delay={(i % 2) * 0.06} className="h-full">
              <ServiceRow service={s} />
            </Reveal>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link href="/services" className="s-btn-outline">
            View all services <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-5 pb-20 md:pb-28">
        <StatsRow
          stats={[
            { value: 17, suffix: "+", label: "Years in glamour" },
            { value: 3, label: "Skilled stylists" },
            { value: services.length || 11, suffix: "+", label: "Hair services" },
            { value: 0, text: "2021", label: "Serving Darjeeling since" },
          ]}
        />
      </section>

      {/* ── About ── */}
      <section className="px-5 pb-20 md:px-8 md:pb-28">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading align="left" eyebrow="About Darjeeling Hair Company" title="City-Level Craft, Right Here in the Hills" />
            <Reveal delay={0.08}>
              <p className="mt-5 leading-relaxed">
                Darjeeling Hair Company was founded in 2021 by Pranay Chettri — a stylist with hair education from Toni&amp;Guy,
                Mumbai and 17 years in the glamour industry. The idea was simple: nobody in Darjeeling should have to travel to
                a big city for a great cut, beautiful colour or a proper hair treatment.
              </p>
              <p className="mt-4 leading-relaxed">
                Today our skilled team welcomes men and women at Jai Complex for everything from a quick, sharp trim to a complete
                colour transformation — always starting with a real consultation, and always using professional L&apos;Oréal
                products.
              </p>
              <div className="mt-7">
                <CheckList
                  items={[
                    "Toni&Guy-trained founder & stylist",
                    "Unisex — every hair type welcome",
                    "Genuine L'Oréal Professionnel products",
                    "Consultation before every service",
                  ]}
                />
              </div>
              <Link href="/about" className="s-btn-accent mt-8">Our story</Link>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
              <Img src={ABOUT_IMAGES.team} alt="Stylists working on a client's hair" fill sizes="(min-width:1024px) 480px, 100vw" className="object-cover" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why us ── */}
      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="Why Darjeeling Hair Company" title="Hair Done the Way It *Deserves*" intro="What a dedicated, professional salon does differently." />
        <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2">
          {WHY_US.map((w, i) => {
            const Icon = WHY_ICONS[w.icon];
            return (
              <Reveal key={w.title} delay={(i % 2) * 0.06} className="h-full">
                <div className="s-card flex h-full gap-4 p-6">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                    <Icon className="size-[18px]" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h3 className="h-serif text-lg">{w.title}</h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed">{w.text}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="The work" title="Looks We Love to Create" intro="Cuts, colour, treatments and styling — a taste of what's possible in our chair." />
        <div className="mx-auto mt-12 max-w-5xl">
          <GalleryGrid items={mixCategories(gallery).slice(0, 6)} showFilters={false} />
        </div>
        <div className="mt-10 text-center">
          <Link href="/gallery" className="s-btn-outline">
            View the gallery <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="How it works" title="From Consultation to Confidence" intro="Understanding your hair first — then making it look its best." />
        <div className="mt-12">
          <Steps steps={PROCESS_STEPS} />
        </div>
      </section>

      {/* ── Difference ── */}
      <section className="px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="The DHC difference" title="Three Things Every Client Gets" intro="Beyond a great style." />
        <div className="mt-14">
          <AlternatingTimeline items={DIFFERENCE} />
        </div>
      </section>

      {/* ── Aftercare & products ── */}
      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-soft">
              <Img src={ABOUT_IMAGES.stylist} alt="A stylist finishing a client's haircut" fill sizes="(min-width:1024px) 480px, 100vw" className="object-cover" />
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading align="left" eyebrow="Aftercare & products" title="We Send You Home Knowing Your Hair" />
            <Reveal delay={0.08}>
              <p className="mt-5 leading-relaxed">
                A great cut or colour should still look great a week later. That&apos;s why your stylist explains what your hair
                needs, shows you simple techniques, and only recommends products that genuinely suit you. Our L&apos;Oréal
                Professionnel range is available right here in the salon:
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {PRODUCTS.map((p) => (
                  <li key={p.name} className="rounded-full border border-line bg-card px-4 py-1.5 text-sm font-medium text-espresso">{p.name}</li>
                ))}
              </ul>
              <div className="mt-7">
                <CheckList items={["Products matched to your hair type", "Simple at-home routines", "Advice, never a sales pitch"]} />
              </div>
              <Link href="/contact#book" className="s-btn-accent mt-8">Book a consultation</Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Promise ── */}
      <section className="px-5 py-20 md:px-8 md:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="eyebrow">Our promise</p>
          <span className="mx-auto mt-2.5 block h-px w-8 bg-accent" />
          <p className="mt-8 font-heading text-2xl leading-snug text-espresso md:text-[2rem]">
            Great hair isn&apos;t a trend — it&apos;s the confidence you walk out with. We listen first, we do it properly,
            and we make sure you love it.
          </p>
          <p className="mt-6 text-sm font-semibold text-accent">— The Darjeeling Hair Company team</p>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white px-5 py-20 md:px-8 md:py-28">
        <SectionHeading eyebrow="Questions" title="Common Questions" intro="Everything you might want to know before your visit." />
        <div className="mt-12">
          <Faq items={FAQS} />
        </div>
      </section>

      <CtaBanner whatsapp={settings.whatsapp} phone={settings.phone} />
    </>
  );
}
