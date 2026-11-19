"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ServiceCard } from "./ServiceCard";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import type { ServiceCatalog } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ServicesExplorer({ catalog }: { catalog: ServiceCatalog }) {
  const { services, categories } = catalog;
  const [active, setActive] = useState<string>("all");
  // only categories that actually contain visible services, in the admin's order
  const tabs = useMemo(
    () => categories.filter((c) => services.some((s) => s.categoryId === c.id)),
    [categories, services],
  );
  const list = active === "all" ? services : services.filter((s) => s.categoryId === active);
  const activeCat = categories.find((c) => c.id === active);

  if (!services.length) {
    return (
      <p className="s-card p-12 text-center">
        Our service menu is being updated — please call or WhatsApp us for details.
      </p>
    );
  }

  return (
    <div>
      <div role="tablist" aria-label="Service categories" className={cn("flex flex-wrap justify-center gap-2", activeCat?.description ? "mb-4" : "mb-10")}>
        {[{ id: "all", name: "All", icon: null }, ...tabs].map((t) => (
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
              <motion.span layoutId="svc-tab" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
            )}
            <span className="relative inline-flex items-center gap-1.5">
              {t.icon && <CategoryIcon icon={t.icon} className="size-3.5" />}
              {t.name}
            </span>
          </button>
        ))}
      </div>
      {activeCat?.description && <p className="mx-auto mb-10 max-w-xl text-center text-sm">{activeCat.description}</p>}
      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s, i) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.04, 0.3) }}
            >
              <ServiceCard service={s} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
