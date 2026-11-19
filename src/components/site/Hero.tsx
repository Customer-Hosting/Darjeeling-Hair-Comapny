"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Img } from "@/components/ui/Img";
import type { HeroSlide } from "@/lib/types";
import { cn } from "@/lib/cn";

const DURATION = 6500;
const ease = [0.22, 1, 0.36, 1] as const;

const TRUST = ["Unisex · men & women", "17 years of expertise", "L'Oréal Professionnel"];

/** Split hero: copy on the left, rounded photo on the right. Admin slides rotate softly. */
export function Hero({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduce = useReducedMotion();
  const count = slides.length;
  const slide = slides[index];

  const go = useCallback((i: number) => setIndex((i + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setTimeout(() => go(index + 1), DURATION);
    return () => clearTimeout(t);
  }, [index, paused, count, go]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="relative overflow-hidden bg-gradient-to-b from-sand to-[#efe6dd]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:px-8 md:py-24 lg:grid-cols-[1.08fr_1fr] lg:gap-16 lg:py-28">
        {/* Copy */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.09 } },
              exit: { opacity: 0, transition: { duration: 0.25 } },
            }}
          >
            {slide.eyebrow && (
              <motion.p variants={item} className="inline-block rounded-full bg-accent-soft px-4 py-1.5 text-[13px] font-semibold text-accent-dark italic">
                {slide.eyebrow}
              </motion.p>
            )}
            <motion.h1 variants={item} className="h-serif mt-6 text-[2.75rem] leading-[1.04] text-balance sm:text-6xl lg:text-[4.1rem]">
              {slide.title}{" "}
              {slide.highlight && <span className="text-accent">{slide.highlight}</span>}
            </motion.h1>
            {slide.subtitle && (
              <motion.p variants={item} className="mt-6 max-w-xl text-[17px] leading-relaxed text-body">
                {slide.subtitle}
              </motion.p>
            )}
            <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
              {slide.ctaLabel && slide.ctaHref && (
                <Link href={slide.ctaHref} className="s-btn-accent !px-8 !py-4">
                  {slide.ctaLabel}
                </Link>
              )}
              <Link href="/services" className="s-btn-outline !px-8 !py-4">
                See the Services
              </Link>
            </motion.div>
            <motion.ul variants={item} className="mt-7 flex flex-wrap gap-2">
              {TRUST.map((t) => (
                <li key={t} className="s-chip">{t}</li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>

        {/* Photo */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease }}
          className="relative"
        >
          <div className="relative aspect-[1.08/1] overflow-hidden rounded-2xl bg-line shadow-soft">
            <AnimatePresence initial={false}>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.1, ease }}
              >
                <Img src={slide.imageUrl} alt={`${slide.title} ${slide.highlight}`.trim()} fill priority={index === 0} sizes="(min-width:1024px) 520px, 100vw" className="object-cover" />
              </motion.div>
            </AnimatePresence>
          </div>
          {count > 1 && (
            <div className="mt-5 flex justify-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                  className={cn("h-2 cursor-pointer rounded-full transition-all duration-500", i === index ? "w-8 bg-accent" : "w-2 bg-espresso/20 hover:bg-espresso/40")}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
