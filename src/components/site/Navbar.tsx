"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Phone, X } from "lucide-react";
import { LogoBadge } from "./LogoBadge";
import { WhatsAppIcon } from "@/components/icons/Brand";
import { SocialLinks } from "@/components/icons/Social";
import { telHref } from "@/lib/settings";
import type { SocialLink } from "@/lib/types";
import { cn } from "@/lib/cn";
import { NAV_LINKS } from "./nav-links";

type Props = {
  phone: string;
  whatsapp: string;
  socials: SocialLink[];
};

export function Navbar({ phone, whatsapp, socials }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu after navigating (render-phase update instead of an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const link = (l: { href: string; label: string }) => (
    <Link
      key={l.href}
      href={l.href}
      className={cn(
        "relative py-2 text-[15px] font-medium transition-colors",
        isActive(l.href) ? "text-accent" : "text-espresso hover:text-accent",
      )}
    >
      {l.label}
      {isActive(l.href) && (
        <motion.span layoutId="nav-underline" className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent" />
      )}
    </Link>
  );

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-shadow duration-300",
        scrolled ? "border-line shadow-[0_8px_30px_-20px_rgba(42,29,23,.35)]" : "border-line/60",
      )}
    >
      <nav className="mx-auto flex h-[84px] max-w-6xl md:h-[92px] items-center justify-between gap-6 px-5 md:px-8">
        {/* Logo + links (grouped on the left, close together) */}
        <div className="flex items-center gap-6 lg:gap-12 xl:gap-[200px]">
          <Link href="/" aria-label="Darjeeling Hair Company — home" className="flex shrink-0 items-center">
            <LogoBadge className="w-[68px] md:w-[80px]" priority />
          </Link>
          <div className="hidden items-center gap-7 lg:flex xl:gap-10">{NAV_LINKS.map(link)}</div>
        </div>

        {/* CTA (right) */}
        <div className="flex items-center gap-3">
          <Link href="/contact#book" className="s-btn-accent !px-4 !py-2.5 !text-sm sm:!px-5">
            Book Now
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid size-10 cursor-pointer place-items-center rounded-lg border border-line text-espresso lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-white lg:hidden"
          >
            <ul className="px-5 py-2 sm:py-3">
              {NAV_LINKS.map((l, i) => (
                <motion.li key={l.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
                  <Link
                    href={l.href}
                    className={cn(
                      "flex items-center justify-between border-b border-line/70 py-2.5 font-heading text-base font-semibold sm:py-3 sm:text-lg",
                      isActive(l.href) ? "text-accent" : "text-espresso",
                    )}
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center gap-2 px-5 pt-1 pb-5">
              <a href={telHref(phone)} className="s-btn-outline min-w-24 flex-1 !py-2 !text-sm">
                <Phone className="size-3.5" /> Call
              </a>
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="grid size-10 place-items-center rounded-lg border border-line text-[#1fa855]">
                <WhatsAppIcon className="size-[18px]" />
              </a>
              <SocialLinks
                socials={socials.slice(0, 4)}
                iconClassName="size-[18px]"
                itemClassName="grid size-10 place-items-center rounded-lg border border-line text-espresso transition hover:border-accent hover:text-accent"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
