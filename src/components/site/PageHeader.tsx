import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

/** Interior page banner — warm sand band, centered serif title, breadcrumb. */
export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  const parts = title.split(/(\*[^*]+\*)/g);
  return (
    <section className="bg-gradient-to-b from-sand to-[#efe6dd]">
      <Reveal className="mx-auto max-w-3xl px-5 py-16 text-center md:py-24">
        <nav aria-label="Breadcrumb" className="flex items-center justify-center gap-1.5 text-[13px] text-body">
          <Link href="/" className="hover:text-accent">Home</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-accent">{eyebrow}</span>
        </nav>
        <h1 className="h-serif mt-5 text-[2.6rem] leading-[1.08] text-balance md:text-[3.6rem]">
          {parts.map((p, i) =>
            p.startsWith("*") ? (
              <span key={i} className="text-accent">{p.slice(1, -1)}</span>
            ) : (
              <span key={i}>{p}</span>
            ),
          )}
        </h1>
        {intro && <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-body">{intro}</p>}
      </Reveal>
    </section>
  );
}
