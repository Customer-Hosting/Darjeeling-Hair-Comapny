import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { GalleryGrid } from "@/components/site/GalleryGrid";
import { CtaBanner } from "@/components/site/CtaBanner";
import { InstagramIcon } from "@/components/icons/Brand";
import { getGallery, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Haircuts, colour, balayage, treatments and styling at Darjeeling Hair Company.",
};

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
          <a href={s.instagramUrl} target="_blank" rel="noreferrer" className="s-btn-outline">
            <InstagramIcon className="size-4" /> See more on Instagram
          </a>
        </div>
      </section>
      <CtaBanner whatsapp={s.whatsapp} phone={s.phone} />
    </>
  );
}
