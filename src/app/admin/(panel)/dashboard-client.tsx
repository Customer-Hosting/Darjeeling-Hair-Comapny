"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ImportSamplesButton } from "@/components/admin/ImportSamples";
import { ArrowUpRight, CalendarCheck, GalleryHorizontalEnd, Images, Scissors, ShoppingBag } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { PageTitle, Skeleton } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Booking } from "@/lib/types";

type Stats = {
  hero: number;
  services: number;
  gallery: number;
  products: number;
  bookings: { pending: number; total: number };
  recent: Booking[];
};

export default function DashboardPage() {
  const { api, user, toast } = useAdmin();
  const [stats, setStats] = useState<Stats | null>(null);

  const load = useCallback(
    () => api<Stats>("/api/admin/stats").then(setStats).catch((e: Error) => toast(e.message, "error")),
    [api, toast],
  );
  useEffect(() => {
    load();
  }, [load]);

  const needsImport = !!stats && (stats.hero === 0 || stats.services === 0 || stats.gallery === 0 || stats.products === 0);

  const cards = [
    { href: "/admin/bookings", label: "Pending bookings", value: stats?.bookings.pending, sub: `${stats?.bookings.total ?? 0} total`, Icon: CalendarCheck, c: "text-rose", bg: "from-rose/20" },
    { href: "/admin/hero", label: "Hero slides", value: stats?.hero, sub: "Home page slider", Icon: GalleryHorizontalEnd, c: "text-emerald", bg: "from-emerald/15" },
    { href: "/admin/services", label: "Services", value: stats?.services, sub: "On the menu", Icon: Scissors, c: "text-champagne", bg: "from-champagne/15" },
    { href: "/admin/products", label: "Products", value: stats?.products, sub: "In the shop", Icon: ShoppingBag, c: "text-emerald", bg: "from-emerald/10" },
    { href: "/admin/gallery", label: "Gallery photos", value: stats?.gallery, sub: "In the lookbook", Icon: Images, c: "text-rose-soft", bg: "from-[#ff4fa3]/20" },
  ];

  return (
    <>
      <PageTitle title={`Welcome back${user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}`} subtitle="Here's what's happening at Darjeeling Hair Company." />

      {needsImport && (
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-champagne/30 bg-champagne/[0.07] p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-display text-lg font-bold">Your website is showing built-in sample content</p>
            <p className="mt-1 max-w-2xl text-sm text-muted">
              The hero slides, services, products and gallery photos visitors see aren&apos;t in your database yet, so they can&apos;t be
              edited here. Import them once to manage everything from this panel. Only empty sections are filled — nothing
              you&apos;ve added is changed.
            </p>
          </div>
          <ImportSamplesButton onDone={load} className="shrink-0" />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
        {cards.map(({ href, label, value, sub, Icon, c, bg }) => (
          <Link key={href} href={href} className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${bg} to-transparent p-6 transition hover:border-white/25`}>
            <Icon className={`size-6 ${c}`} />
            <div className="mt-6 font-display text-4xl font-bold">{value ?? <Skeleton className="h-10 w-14" />}</div>
            <p className="mt-1 text-sm font-medium">{label}</p>
            <p className="text-xs text-white/45">{sub}</p>
            <ArrowUpRight className="absolute top-5 right-5 size-4 text-white/30 transition group-hover:text-white" />
          </Link>
        ))}
      </div>

      <section className="mt-10 rounded-3xl border border-white/10 bg-ink-2">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-display text-lg font-bold">Latest booking requests</h2>
          <Link href="/admin/bookings" className="text-sm text-rose hover:underline">View all</Link>
        </div>
        {!stats ? (
          <div className="space-y-3 p-6">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : stats.recent.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">No booking requests yet. They&apos;ll appear here as soon as customers book online.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {stats.recent.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div>
                  <p className="font-semibold">{b.name} <span className="font-normal text-white/45">· {b.service}</span></p>
                  <p className="text-xs text-white/45">{b.date} at {b.time} · {b.phone}</p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { t: "Update the hero slider", d: "Swap the home page banner images & headlines.", href: "/admin/hero" },
          { t: "Add a new service", d: "Add, edit or remove services with photos and prices.", href: "/admin/services" },
          { t: "Upload to the gallery", d: "Show off your latest transformations.", href: "/admin/gallery" },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="rounded-3xl border border-white/10 p-6 transition hover:border-rose/40 hover:bg-rose/[0.03]">
            <p className="font-semibold">{x.t}</p>
            <p className="mt-1 text-sm text-muted">{x.d}</p>
          </Link>
        ))}
      </section>
    </>
  );
}
