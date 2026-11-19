"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { GALLERY_CATEGORIES, type GalleryItem } from "@/lib/types";
import { cn } from "@/lib/cn";

export function GalleryGrid({
  items,
  showFilters = true,
  limit,
}: {
  items: GalleryItem[];
  showFilters?: boolean;
  limit?: number;
}) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  const tabs = useMemo(
    () => ["All", ...GALLERY_CATEGORIES.filter((c) => items.some((i) => i.category === c))],
    [items],
  );
  const list = useMemo(() => {
    const l = filter === "All" ? items : items.filter((i) => i.category === filter);
    return limit ? l.slice(0, limit) : l;
  }, [items, filter, limit]);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: 1 | -1) => setOpen((o) => (o === null ? o : (o + d + list.length) % list.length)),
    [list.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close, step]);

  if (!items.length) {
    return (
      <div className="s-card p-14 text-center">
        <p className="h-serif text-2xl">Fresh looks coming soon</p>
        <p className="mt-2">Follow us on Instagram for our latest transformations.</p>
      </div>
    );
  }

  const current = open !== null ? list[open] : null;

  return (
    <>
      {showFilters && tabs.length > 2 && (
        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "relative cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition",
                filter === t ? "border-accent text-white" : "border-line bg-white text-espresso hover:border-accent/50",
              )}
            >
              {filter === t && <motion.span layoutId="gal-tab" className="absolute inset-0 rounded-full bg-accent" />}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>
      )}

      <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        <AnimatePresence mode="popLayout">
          {list.map((it, i) => (
            <motion.button
              layout
              key={it.id}
              type="button"
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, delay: Math.min(i * 0.03, 0.3) }}
              className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-xl bg-sand"
            >
              <Img
                src={it.imageUrl}
                alt={it.caption || `${it.category} at Darjeeling Hair Company`}
                fill
                sizes="(min-width:768px) 360px, 50vw"
                className="object-cover transition duration-[1.1s] ease-luxe group-hover:scale-105"
              />
              <span className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-espresso/80 via-espresso/0 to-transparent p-4 text-left opacity-0 transition duration-500 group-hover:opacity-100">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-accent-soft uppercase">{it.category}</span>
                {it.caption && <span className="mt-0.5 text-sm font-medium text-white">{it.caption}</span>}
              </span>
              <Expand className="absolute top-3 right-3 size-8 rounded-full bg-white/90 p-2 text-espresso opacity-0 transition group-hover:opacity-100" />
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {current && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-espresso/95 p-4 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            role="dialog"
            aria-modal="true"
            aria-label="Image viewer"
          >
            <motion.figure
              key={current.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.3 }}
              className="relative flex max-h-full max-w-5xl flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Img
                src={current.imageUrl}
                alt={current.caption || current.category}
                width={1600}
                height={1600}
                className="max-h-[80vh] w-auto rounded-xl object-contain"
              />
              <figcaption className="mt-4 text-center text-sm text-white/75">
                <span className="text-accent-soft">{current.category}</span>
                {current.caption && <> · {current.caption}</>}
                <span className="ml-3 text-white/40">{open! + 1}/{list.length}</span>
              </figcaption>
            </motion.figure>
            <button onClick={close} aria-label="Close" className="absolute top-5 right-5 grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
              <X className="size-5" />
            </button>
            {list.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous" className="absolute left-3 grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-8">
                  <ChevronLeft className="size-5" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next" className="absolute right-3 grid size-11 cursor-pointer place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-8">
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
