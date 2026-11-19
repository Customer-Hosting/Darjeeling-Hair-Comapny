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
  LogOut,
  Menu,
  Scissors,
  Settings,
  TriangleAlert,
  X,
} from "lucide-react";
import { useAdmin } from "./AdminProvider";
import { BrandLogo } from "@/components/site/BrandLogo";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/bookings", label: "Bookings", Icon: CalendarCheck },
  { href: "/admin/hero", label: "Hero Slider", Icon: GalleryHorizontalEnd },
  { href: "/admin/services", label: "Services", Icon: Scissors },
  { href: "/admin/gallery", label: "Gallery", Icon: Images },
  { href: "/admin/settings", label: "Contact & Settings", Icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { status, user, signOut, dbConfigured } = useAdmin();
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
      <div className="grid min-h-dvh place-items-center bg-ink">
        <Loader2 className="size-8 animate-spin text-rose" />
      </div>
    );
  }

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/admin" className="flex justify-center px-4 py-7">
        <BrandLogo size="sm" />
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
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/55 hover:bg-white/5 hover:text-white">
          <ExternalLink className="size-[18px]" /> View website
        </Link>
        <button onClick={signOut} className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/55 hover:bg-white/5 hover:text-white">
          <LogOut className="size-[18px]" /> Sign out
        </button>
        <p className="truncate px-3.5 pt-2 text-[11px] text-white/30">{user?.email}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-white/10 bg-ink-2 lg:block">{sidebar}</aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-ink/80 px-4 py-3 backdrop-blur lg:hidden">
        <BrandLogo size="sm" />
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-10 place-items-center rounded-full border border-white/15">
          <Menu className="size-5" />
        </button>
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
