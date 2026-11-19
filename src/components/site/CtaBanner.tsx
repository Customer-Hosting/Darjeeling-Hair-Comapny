import Link from "next/link";
import { Phone } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppIcon } from "@/components/icons/Brand";

export function CtaBanner({ whatsapp, phone }: { whatsapp: string; phone?: string }) {
  return (
    <section className="px-5 py-20 md:px-8 md:py-24">
      <Reveal>
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-espresso px-6 py-14 text-center md:px-16 md:py-16">
          <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-accent/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 size-72 rounded-full bg-forest/40 blur-3xl" />
          <div className="relative">
            <p className="eyebrow !text-accent-soft">Ready when you are</p>
            <h2 className="mt-4 font-heading text-3xl leading-tight font-bold text-white text-balance md:text-[2.6rem]">
              Your next great hair day starts here.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/70">
              Reserve your chair online in under a minute, or message us on WhatsApp — we&apos;ll help you choose the right service.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/contact#book" className="s-btn-accent !px-8 !py-4">
                Book an appointment
              </Link>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="s-btn border border-white/20 !px-8 !py-4 text-white hover:-translate-y-0.5 hover:bg-white/10">
                <WhatsAppIcon className="size-5 text-[#25D366]" /> WhatsApp us
              </a>
              {phone && (
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="s-btn border border-white/20 !px-8 !py-4 text-white hover:-translate-y-0.5 hover:bg-white/10">
                  <Phone className="size-4" /> {phone}
                </a>
              )}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
