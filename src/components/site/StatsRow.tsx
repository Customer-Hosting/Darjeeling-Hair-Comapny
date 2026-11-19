import { Counter } from "./Counter";
import { Reveal } from "@/components/ui/Reveal";

type Stat = { value: number; suffix?: string; label: string; text?: string };

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <Reveal>
      <dl className="mx-auto grid max-w-4xl grid-cols-2 gap-y-10 md:grid-cols-4 md:divide-x md:divide-line">
        {stats.map((s) => (
          <div key={s.label} className="px-4 text-center">
            <dt className="sr-only">{s.label}</dt>
            <dd className="h-serif text-4xl md:text-[2.75rem]">
              {s.text ?? <Counter to={s.value} suffix={s.suffix} />}
            </dd>
            <dd className="mt-1.5 text-[15px] text-body">{s.label}</dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
