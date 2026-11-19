import Link from "next/link";
import { cacheLife } from "next/cache";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { LogoBadge } from "./LogoBadge";
import { NAV_LINKS } from "./nav-links";
import { WhatsAppIcon } from "@/components/icons/Brand";
import { SocialLinks } from "@/components/icons/Social";
import { telHref } from "@/lib/settings";
import type { SiteSettings } from "@/lib/types";

async function Year() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

const ICON_BTN =
  "grid size-10 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-accent hover:bg-accent hover:text-white";

export function Footer({ s }: { s: SiteSettings }) {
  const phones = [{ label: "", value: s.phone }, ...s.extraPhones];
  const emails = [{ label: "", value: s.email }, ...s.extraEmails];
  return (
    <footer className="bg-espresso text-white/70">
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-8 md:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.2fr_1.2fr]">
          <div>
            <Link href="/" aria-label="Darjeeling Hair Company — home" className="inline-block">
              <LogoBadge className="w-24 !bg-black/40" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed">
              A premium unisex salon in Darjeeling, led by a Toni&amp;Guy-trained stylist with 17 years in the glamour industry.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <SocialLinks socials={s.socials} itemClassName={ICON_BTN} />
              <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className={ICON_BTN}>
                <WhatsAppIcon className="size-[18px]" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Explore</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="transition hover:text-accent-soft">{l.label}</Link>
                </li>
              ))}
              <li><Link href="/contact#book" className="transition hover:text-accent-soft">Book an appointment</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Visit</h3>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
                <a href={s.googleMapsUrl} target="_blank" rel="noreferrer" className="hover:text-white">
                  {s.addressLine1}
                  {s.addressLine2 && <>, {s.addressLine2}</>}
                  <br />
                  {s.city} {s.pincode}
                </a>
              </li>
              {s.hours.map((h) => (
                <li key={h.label} className="flex gap-3">
                  <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
                  <span>
                    <span className="block text-white/50">{h.label}</span>
                    <span className="text-white/85">{h.value}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-lg font-semibold text-white">Contact</h3>
            <ul className="mt-4 space-y-4 text-sm">
              {phones.map((p, i) => (
                <li key={`ph-${i}`}>
                  <a href={telHref(p.value)} className="flex items-center gap-3 hover:text-white">
                    <Phone className="size-4 shrink-0 text-accent" />
                    <span>
                      {p.value}
                      {p.label && <span className="ml-1.5 text-white/45">· {p.label}</span>}
                    </span>
                  </a>
                </li>
              ))}
              <li>
                <a href={`https://wa.me/${s.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-white">
                  <WhatsAppIcon className="size-4 text-[#25D366]" /> Chat on WhatsApp
                </a>
              </li>
              {emails.map((e, i) => (
                <li key={`em-${i}`}>
                  <a href={`mailto:${e.value}`} className="flex items-center gap-3 break-all hover:text-white">
                    <Mail className="size-4 shrink-0 text-accent" />
                    <span>
                      {e.value}
                      {e.label && <span className="ml-1.5 text-white/45">· {e.label}</span>}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/contact#book" className="s-btn-accent mt-6 !py-3 !text-sm">Book Now</Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row">
          <p>© <Year /> Darjeeling Hair Company. All rights reserved.</p>
          <p>Unisex Salon · Jai Complex, Darjeeling 734101</p>
        </div>
      </div>
    </footer>
  );
}
