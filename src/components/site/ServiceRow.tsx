import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import type { Service } from "@/lib/types";

/** Compact horizontal service card: icon · title/description · chevron. */
export function ServiceRow({ service }: { service: Service }) {
  return (
    <Link
      href={`/contact?service=${encodeURIComponent(service.title)}#book`}
      className="s-card group flex h-full items-center gap-4 p-5 transition duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white hover:shadow-[0_18px_40px_-25px_rgba(42,29,23,.4)]"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
        <CategoryIcon icon={service.categoryIcon} className="size-[18px]" strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-espresso">{service.title}</span>
        <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-body">{service.description}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-body transition group-hover:translate-x-1 group-hover:text-accent" />
    </Link>
  );
}
