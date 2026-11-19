import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import type { Service } from "@/lib/types";

/** Photo card used on the Services page. */
export function ServiceCard({ service }: { service: Service; index?: number }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-500 hover:-translate-y-1 hover:shadow-soft">
      <div className="relative aspect-[4/3] overflow-hidden bg-sand">
        {service.imageUrl ? (
          <Img
            src={service.imageUrl}
            alt={service.title}
            fill
            sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw"
            className="object-cover transition duration-[1.2s] ease-luxe group-hover:scale-105"
          />
        ) : (
          <CategoryIcon icon={service.categoryIcon} className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-accent/30" strokeWidth={1} />
        )}
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-espresso shadow-sm">
          <CategoryIcon icon={service.categoryIcon} className="size-3.5 text-accent" /> {service.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="h-serif text-[1.4rem]">{service.title}</h3>
        <p className="mt-2.5 text-[15px] leading-relaxed text-body">{service.description}</p>
        <div className="mt-auto flex items-center justify-between gap-4 border-t border-line pt-5 mt-6">
          <div className="text-sm">
            {service.price && <p className="font-semibold text-accent-dark">{service.price}</p>}
            {service.duration && (
              <p className="mt-0.5 flex items-center gap-1 text-body">
                <Clock className="size-3.5" /> {service.duration}
              </p>
            )}
          </div>
          <Link
            href={`/contact?service=${encodeURIComponent(service.title)}#book`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-espresso transition group-hover:text-accent"
          >
            Book <ArrowRight className="size-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}
