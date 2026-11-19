import { Award, GraduationCap, MapPin, Sparkles } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

/** Slim dark info strip above the navigation. */
export function TopBar({ s }: { s: SiteSettings }) {
  const items = [
    { Icon: Sparkles, text: "Premium unisex salon" },
    { Icon: Award, text: "17 years in the glamour industry" },
    { Icon: GraduationCap, text: "Toni&Guy Mumbai trained" },
    { Icon: MapPin, text: `${s.addressLine1.replace(/^Shop No\. 5, /, "")}, Darjeeling` },
  ];
  return (
    <div className="bg-espresso text-[13px] text-white/90">
      {s.announcement ? (
        <p className="px-4 py-2.5 text-center font-medium">{s.announcement}</p>
      ) : (
        <ul className="mx-auto flex max-w-6xl items-center justify-center gap-x-8 px-4 py-2.5">
          {items.map(({ Icon, text }, i) => (
            <li key={text} className={`items-center gap-2 ${i === 0 ? "flex" : i < 3 ? "hidden md:flex" : "hidden lg:flex"}`}>
              <Icon className="size-3.5 text-accent-soft" strokeWidth={1.8} />
              {text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
