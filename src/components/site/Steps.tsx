import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/cn";

type Step = { title: string; text: string };

/** Vertical numbered timeline ("How it works"). */
export function Steps({ steps }: { steps: Step[] }) {
  return (
    <div role="list" className="mx-auto max-w-xl">
      {steps.map((s, i) => (
        <Reveal key={s.title} delay={i * 0.06}>
          <div role="listitem" className={cn("relative flex gap-5", i < steps.length - 1 && "pb-10")}>
            {i < steps.length - 1 && <span className="absolute top-9 -bottom-0 left-[15px] w-px bg-accent/40" aria-hidden />}
            <span className="relative z-10 grid size-8 shrink-0 place-items-center rounded-full bg-[#8a5a44] font-heading text-sm font-bold text-white ring-4 ring-accent-soft">
              {i + 1}
            </span>
            <div className="-mt-0.5">
              <h3 className="h-serif text-lg">{s.title}</h3>
              <p className="mt-1 leading-relaxed">{s.text}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

/** Centre-line timeline with items alternating left/right on desktop. */
export function AlternatingTimeline({ items }: { items: Step[] }) {
  return (
    <div className="relative mx-auto max-w-3xl">
      <span className="absolute top-0 bottom-0 left-4 w-px bg-accent/30 md:left-1/2" aria-hidden />
      {items.map((it, i) => {
        const right = i % 2 === 0;
        return (
          <Reveal key={it.title} delay={i * 0.08}>
            <div className={cn("relative grid gap-4 pl-12 md:grid-cols-2 md:gap-16 md:pl-0", i < items.length - 1 && "pb-12 md:pb-14")}>
              <span className="absolute top-0 left-0 z-10 grid size-8 place-items-center rounded-full bg-accent font-heading text-sm font-bold text-white ring-4 ring-accent-soft md:left-1/2 md:-translate-x-1/2">
                {i + 1}
              </span>
              <div className={cn(right ? "md:col-start-2" : "md:col-start-1 md:text-right")}>
                <h3 className="h-serif text-lg">{it.title}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed">{it.text}</p>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
