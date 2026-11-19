import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/site/PageHeader";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { CtaBanner } from "@/components/site/CtaBanner";
import { FollowButton } from "@/components/site/FollowButton";
import { getGallery, getSettings } from "@/lib/data";

export const metadata: Metadata = pageMetadata({
  title: "Gallery — Haircuts, Colour & Hair Transformations",
  description: "Browse haircuts, hair colour, balayage, treatments, styling and salon photos from Darjeeling Hair Company, a premium unisex salon in Darjeeling.",
  path: "/gallery",
  keywords: ["hair gallery Darjeeling","balayage photos","haircut ideas"],
});

export default async function GalleryPage() {
  const [items, s] = await Promise.all([getGallery(), getSettings()]);
  return (
    <>
      <PageHeader
        eyebrow="Gallery"
        title="Looks We *Love*"
        intro="Cuts, colour and care we specialise in — tap any look to view it full-screen, then book the one you want."
      />
      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <GalleryGrid items={items} />
        </div>
        <div className="mt-14 text-center">
          <FollowButton s={s} prefix="See more on" />
        </div>
      </section>
      <CtaBanner whatsapp={s.whatsapp} phone={s.phone} />
    </>
  );
}
