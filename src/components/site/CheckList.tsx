import { Check } from "lucide-react";

export function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((t) => (
        <li key={t} className="flex items-center gap-3 text-[15px] text-espresso">
          <span className="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <Check className="size-3" strokeWidth={3} />
          </span>
          {t}
        </li>
      ))}
    </ul>
  );
}
