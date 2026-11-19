"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PackageOpen, Search, Sparkles } from "lucide-react";
import { Img } from "@/components/ui/Img";
import { WhatsAppIcon } from "@/components/icons/Brand";
import type { Catalog, Product } from "@/lib/types";
import { cn } from "@/lib/cn";

function ProductCard({ p, category, whatsapp }: { p: Product; category?: string; whatsapp: string }) {
  const msg = encodeURIComponent(
    `Hi Darjeeling Hair Company! Is "${p.name}"${p.size ? ` (${p.size})` : ""}${p.brand ? ` by ${p.brand}` : ""} available? I'd like to know the price.`,
  );
  return (
    <article className={cn("group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-500 hover:-translate-y-1 hover:shadow-soft", !p.inStock && "opacity-80")}>
      <div className="relative aspect-square overflow-hidden bg-sand">
        {p.imageUrl ? (
          <Img
            src={p.imageUrl}
            alt={p.name}
            fill
            sizes="(min-width:1024px) 270px, (min-width:640px) 45vw, 90vw"
            className="object-cover transition duration-[1.2s] ease-luxe group-hover:scale-105"
          />
        ) : (
          <PackageOpen className="absolute top-1/2 left-1/2 size-14 -translate-x-1/2 -translate-y-1/2 text-accent/30" strokeWidth={1} />
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {category && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-espresso shadow-sm">{category}</span>}
          {p.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
              <Sparkles className="size-3" /> Bestseller
            </span>
          )}
        </div>
        {!p.inStock && (
          <span className="absolute right-3 bottom-3 rounded-full bg-espresso/85 px-2.5 py-1 text-[11px] font-semibold text-white">Out of stock</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {p.brand && <p className="text-[11px] font-semibold tracking-[0.14em] text-accent uppercase">{p.brand}</p>}
        <h3 className="h-serif mt-1.5 text-lg leading-snug">{p.name}</h3>
        {p.description && <p className="mt-2 line-clamp-3 text-sm leading-relaxed">{p.description}</p>}
        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-4 text-sm">
            <span className="font-semibold text-accent-dark">{p.price || "Ask in salon"}</span>
            {p.size && <span className="text-body">{p.size}</span>}
          </div>
          <a
            href={`https://wa.me/${whatsapp}?text=${msg}`}
            target="_blank"
            rel="noreferrer"
            className="s-btn-outline mt-4 w-full !py-2.5 !text-sm"
          >
            <WhatsAppIcon className="size-4 text-[#1fa855]" /> {p.inStock ? "Ask on WhatsApp" : "Ask when it's back"}
          </a>
        </div>
      </div>
    </article>
  );
}

export function ProductsExplorer({ catalog, whatsapp }: { catalog: Catalog; whatsapp: string }) {
  const [active, setActive] = useState("all");
  const [q, setQ] = useState("");

  const catName = useMemo(() => new Map(catalog.categories.map((c) => [c.id, c.name])), [catalog.categories]);
  const tabs = useMemo(
    () => catalog.categories.filter((c) => catalog.products.some((p) => p.categoryId === c.id)),
    [catalog],
  );
  const term = q.trim().toLowerCase();
  const list = catalog.products.filter(
    (p) =>
      (active === "all" || p.categoryId === active) &&
      (!term || [p.name, p.brand, p.description, catName.get(p.categoryId) ?? ""].some((v) => v.toLowerCase().includes(term))),
  );
  const activeCat = catalog.categories.find((c) => c.id === active);

  if (!catalog.products.length) {
    return (
      <p className="s-card p-12 text-center">Our product shelf is being updated — ask your stylist or message us on WhatsApp.</p>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col items-center gap-5">
        <div role="tablist" aria-label="Product categories" className="flex flex-wrap justify-center gap-2">
          {[{ id: "all", name: "All products" }, ...tabs].map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              onClick={() => setActive(t.id)}
              className={cn(
                "relative cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition",
                active === t.id ? "border-accent text-white" : "border-line bg-white text-espresso hover:border-accent/50",
              )}
            >
              {active === t.id && (
                <motion.span layoutId="prod-tab" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">{t.name}</span>
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-body/60" />
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search products…"
            className="s-field !rounded-full !pl-11"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {activeCat?.description && <p className="max-w-xl text-center text-sm">{activeCat.description}</p>}
      </div>

      {list.length === 0 ? (
        <p className="py-12 text-center">No products match your search.</p>
      ) : (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.4, delay: Math.min(i * 0.03, 0.25) }}
              >
                <ProductCard p={p} category={catName.get(p.categoryId)} whatsapp={whatsapp} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
