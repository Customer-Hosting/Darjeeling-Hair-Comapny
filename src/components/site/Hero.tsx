"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Img } from "@/components/ui/Img";
import type { HeroSlide, HeroSliderSettings } from "@/lib/types";
import { cn } from "@/lib/cn";

const ease = [0.22, 1, 0.36, 1] as const;
const TRUST = ["Unisex · men & women", "17 years of expertise", "L'Oréal Professionnel"];

/**
 * Full-screen hero slider with centred copy overlaid on the photo.
 * Autoplay, seconds-per-slide and pause-on-hover are managed by the Super Admin.
 * No visible controls: slides advance automatically; visitors can still swipe
 * (touch) or use the arrow keys when the slider is focused.
 */
export function Hero({ slides, settings }: { slides: HeroSlide[]; settings: HeroSliderSettings }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduce = useReducedMotion();
  const startX = useRef<number | null>(null);

  const count = slides.length;
  const slide = slides[index] ?? slides[0];
  const duration = Math.max(2, settings.interval) * 1000;
  const canAutoplay = settings.autoplay && count > 1;
  const paused = !canAutoplay || hidden || (settings.pauseOnHover && hovered);

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  // Performance: only load the current slide + the next one; keep slides already shown.
  // (Render-phase state update — no effect needed.)
  const [seen, setSeen] = useState<number[]>([0]);
  if (!seen.includes(index)) setSeen((v) => [...v, index]);
  const nextIndex = count > 1 ? (index + 1) % count : -1;

  // pause while the browser tab is in the background
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => go(index + 1), duration);
    return () => clearTimeout(t);
  }, [index, paused, duration, go]);

  if (!slide) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      tabIndex={count > 1 ? 0 : undefined}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      // Hover-pause reacts to a real mouse only. Touch devices fire an emulated
      // "mouseenter" on tap but never "mouseleave", which would freeze the slider.
      onPointerEnter={(e) => e.pointerType === "mouse" && settings.pauseOnHover && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
      onPointerDown={(e) => (startX.current = e.clientX)}
      onPointerUp={(e) => {
        if (startX.current === null || count < 2) return;
        const dx = e.clientX - startX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        startX.current = null;
      }}
      className="relative isolate flex h-[calc(100svh-7.25rem)] min-h-[440px] items-center pb-10 sm:min-h-[560px] sm:pb-0 justify-center overflow-hidden bg-espresso outline-none"
    >
      {/* ── Slides (all mounted & cross-faded, so the next image is already loaded) ── */}
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={s.id}
            aria-hidden={!active}
            className={cn("absolute inset-0 -z-10 transition-opacity duration-[1200ms] ease-in-out", active ? "opacity-100" : "opacity-0")}
          >
            <motion.div
              key={active ? `on-${index}` : "off"}
              className="absolute inset-0"
              initial={reduce ? false : { scale: 1.12 }}
              animate={{ scale: active && !reduce ? 1 : 1.04 }}
              transition={{ duration: duration / 1000 + 1.5, ease: "linear" }}
            >
              {(seen.includes(i) || i === nextIndex) && (
                <Img
                  src={s.imageUrl}
                  alt=""
                  fill
                  preload={i === 0}
                  fetchPriority={i === 0 ? "high" : "low"}
                  quality={75}
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </motion.div>
          </div>
        );
      })}

      {/* Readability overlays — even darkening for centred text, slightly stronger at the edges */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-black/50" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,.45)_100%)]" />

      {/* ── Centred copy ── */}
      <div className="relative mx-auto w-full max-w-4xl px-5 text-center md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            className="flex flex-col items-center"
            initial="hidden"
            animate="show"
            exit="exit"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
              exit: { opacity: 0, y: -12, transition: { duration: 0.3 } },
            }}
          >
            {slide.eyebrow && (
              <motion.p
                variants={item}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[13px] font-semibold text-white italic backdrop-blur-md"
              >
                <span className="size-1.5 rounded-full bg-accent" /> {slide.eyebrow}
              </motion.p>
            )}
            <motion.h1
              variants={item}
              className="h-serif mt-5 text-[2.15rem] min-[380px]:text-[2.4rem] sm:mt-6 leading-[1.06] !text-white text-balance drop-shadow-[0_2px_24px_rgba(0,0,0,.35)] sm:text-6xl lg:text-[4.6rem]"
            >
              {slide.title} {slide.highlight && <span className="text-[#f2b89d]">{slide.highlight}</span>}
            </motion.h1>
            {slide.subtitle && (
              <motion.p variants={item} className="mt-4 max-w-2xl text-[15px] sm:mt-6 sm:text-base leading-relaxed text-white/85 sm:text-[17px] md:text-lg">
                {slide.subtitle}
              </motion.p>
            )}

            {/* Buttons: always side by side — equal halves on phones, natural width on larger screens */}
            <motion.div variants={item} className="mt-7 grid w-full max-w-md grid-cols-2 gap-3 sm:mt-9 sm:flex sm:w-auto sm:max-w-none sm:justify-center">
              {slide.ctaLabel && slide.ctaHref && (
                <Link
                  href={slide.ctaHref}
                  className="s-btn-accent !px-3 !py-3.5 !text-[13px] whitespace-nowrap max-[380px]:!px-2 max-[380px]:!text-xs sm:!px-8 sm:!py-4 sm:!text-[15px]"
                >
                  {slide.ctaLabel} <ArrowRight className="hidden size-4 sm:block" />
                </Link>
              )}
              <Link
                href="/services"
                className={cn(
                  "s-btn border border-white/40 bg-white/10 !px-3 !py-3.5 !text-[13px] whitespace-nowrap max-[380px]:!px-2 max-[380px]:!text-xs text-white backdrop-blur-md hover:-translate-y-0.5 hover:bg-white hover:text-espresso sm:!px-8 sm:!py-4 sm:!text-[15px]",
                  !(slide.ctaLabel && slide.ctaHref) && "col-span-2",
                )}
              >
                See the Services
              </Link>
            </motion.div>

            <motion.ul variants={item} className="mt-8 hidden flex-wrap justify-center gap-2 sm:flex">
              {TRUST.map((t) => (
                <li key={t} className="rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[13px] text-white/90 backdrop-blur-md">
                  {t}
                </li>
              ))}
            </motion.ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
