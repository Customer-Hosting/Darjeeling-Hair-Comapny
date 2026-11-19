"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarCheck,
  ExternalLink,
  GalleryHorizontalEnd,
  Images,
  LayoutDashboard,
  Loader2,
  Menu,
  Scissors,
  Settings,
  ShoppingBag,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { useAdmin } from "./AdminProvider";
import { AccountMenu } from "./AccountMenu";
import { LogoBadge } from "@/components/site/LogoBadge";
import { cn } from "@/lib/cn";

const PROFILE = { href: "/admin/profile", label: "Profile", Icon: UserRound };

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", Icon: CalendarCheck },
  { href: "/admin/hero", label: "Hero Slider", Icon: GalleryHorizontalEnd },
  { href: "/admin/services", label: "Services", Icon: Scissors },
  { href: "/admin/products", label: "Products", Icon: ShoppingBag },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/settings", label: "Contact & Settings", Icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { status, dbConfigured } = useAdmin();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status === "signedOut" || status === "denied") router.replace("/admin/login");
  }, [status, router]);
  // Close the menu after navigating (render-phase update instead of an effect)
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  if (status !== "admin") {
    return (
      <div className="admin-theme grid min-h-dvh place-items-center bg-ink">
        <Loader2 className="size-8 animate-spin text-rose" />
      </div>
    );
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const current = [...NAV, PROFILE].find((n) => isActive(n.href)) ?? NAV[0];

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex justify-center px-4 py-7">
        <LogoBadge className="w-20" />
      </Link>
      <p className="px-6 pb-2 text-[10px] font-semibold tracking-[0.25em] text-white/30 uppercase">Super Admin</p>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition",
              isActive(href) ? "text-white" : "text-white/55 hover:bg-white/5 hover:text-white",
            )}
          >
            {isActive(href) && (
              <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose/25 to-rose/5 ring-1 ring-rose/30" />
            )}
            <Icon className={cn("relative size-[18px]", isActive(href) && "text-rose")} />
            <span className="relative">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link
          href={PROFILE.href}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition",
            isActive(PROFILE.href) ? "bg-rose/10 font-medium text-white" : "text-white/55 hover:bg-white/5 hover:text-white",
          )}
        >
          <UserRound className={cn("size-[18px]", isActive(PROFILE.href) && "text-rose")} /> {PROFILE.label}
        </Link>
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/55 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-[18px]" /> View website
        </Link>
      </div>
    </div>
  );

  return (
    <div className="admin-theme min-h-dvh bg-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-ink-2 lg:block">{sidebar}</aside>

      {/* Top bar (all screen sizes) */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink-2/90 backdrop-blur lg:ml-64">
        <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-white/15 lg:hidden">
              <Menu className="size-5" />
            </button>
            <Link href="/admin" className="lg:hidden" aria-label="Dashboard">
              <LogoBadge className="w-10" />
            </Link>
            <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-2 text-sm sm:flex">
              <span className="text-white/45">Super Admin</span>
              <span className="text-white/25">/</span>
              <span className="truncate font-semibold">{current.label}</span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-white/60 transition hover:bg-white/5 hover:text-white md:flex"
            >
              <ExternalLink className="size-4" /> View website
            </Link>
            <AccountMenu />
          </div>
        </div>
      </header>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/60 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-white/10 bg-ink-2 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
            >
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute top-4 right-4 grid size-9 place-items-center rounded-full hover:bg-white/10">
                <X className="size-4" />
              </button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">
          {!dbConfigured && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-champagne/30 bg-champagne/10 p-4 text-sm text-champagne">
              <TriangleAlert className="size-5 shrink-0" />
              <p>
                MongoDB isn&apos;t connected yet. Put your real database password in <code>MONGODB_URI</code> inside{" "}
                <code>.env.local</code>, then restart the server. Changes can&apos;t be saved until then.
              </p>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
