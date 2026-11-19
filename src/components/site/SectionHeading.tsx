import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

/**
 * Serif section heading. Wrap words in *asterisks* to colour them with the accent,
 * e.g. "Hair that feels like *you*".
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "center",
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}) {
  const parts = title.split(/(\*[^*]+\*)/g);
  const center = align === "center";
  return (
    <Reveal className={cn(center ? "mx-auto max-w-2xl text-center" : "max-w-xl", className)}>
      {eyebrow && (
        <div className={cn("mb-4", center && "flex flex-col items-center")}>
          <p className="eyebrow">{eyebrow}</p>
          {center && <span className="mt-2.5 block h-px w-8 bg-accent" />}
        </div>
      )}
      <Tag className="h-serif text-[2rem] leading-[1.12] text-balance md:text-[2.6rem]">
        {parts.map((p, i) =>
          p.startsWith("*") ? (
            <span key={i} className="text-accent">
              {p.slice(1, -1)}
            </span>
          ) : (
            <span key={i}>{p}</span>
          ),
        )}
      </Tag>
      {intro && <p className="mt-4 text-[16px] leading-relaxed text-body">{intro}</p>}
    </Reveal>
  );
}
