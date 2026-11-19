"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ServiceCard } from "./ServiceCard";
import { SERVICE_CATEGORIES, type Service } from "@/lib/types";
import { cn } from "@/lib/cn";

export function ServicesExplorer({ services }: { services: Service[] }) {
  const [active, setActive] = useState<string>("All");
  const tabs = useMemo(
    () => ["All", ...SERVICE_CATEGORIES.filter((c) => services.some((s) => s.category === c))],
    [services],
  );
  const list = active === "All" ? services : services.filter((s) => s.category === active);

  if (!services.length) {
    return (
      <p className="s-card p-12 text-center">
        Our service menu is being updated — please call or WhatsApp us for details.
      </p>
    );
  }

  return (
    <div>
      <div role="tablist" aria-label="Service categories" className="mb-10 flex flex-wrap justify-center gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={active === t}
            onClick={() => setActive(t)}
            className={cn(
              "relative cursor-pointer rounded-full border px-5 py-2 text-sm font-medium transition",
              active === t ? "border-accent text-white" : "border-line bg-white text-espresso hover:border-accent/50",
            )}
          >
            {active === t && (
              <motion.span layoutId="svc-tab" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
            )}
            <span className="relative">{t}</span>
          </button>
        ))}
      </div>
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
