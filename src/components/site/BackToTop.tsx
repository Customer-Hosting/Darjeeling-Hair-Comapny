"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUp } from "lucide-react";

const SHOW_AFTER = 480; // px scrolled before the button appears
const R = 25;
const CIRC = 2 * Math.PI * R;

/** Bottom-left "back to top" button with a scroll-progress ring. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y > SHOW_AFTER);
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update); // throttle to one update per frame
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          title="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          initial={{ opacity: 0, scale: 0.6, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 12 }}
          transition={{ duration: 0.22 }}
          className="group fixed bottom-5 left-5 z-40 grid size-14 cursor-pointer place-items-center rounded-full border-2 border-white bg-accent text-white shadow-[0_10px_30px_-6px_rgba(163,95,69,.85),0_0_0_4px_rgba(192,119,90,.18)] transition hover:-translate-y-1 hover:bg-accent-dark md:bottom-8 md:left-8"
        >
          {/* scroll progress ring */}
          <svg viewBox="0 0 56 56" className="absolute inset-0 size-full -rotate-90" aria-hidden>
            {/* track (remaining) */}
            <circle cx="28" cy="28" r={R} fill="none" stroke="rgb(255 255 255 / .28)" strokeWidth="3" />
            {/* progress (scrolled part) — bright gold so it reads clearly on terracotta */}
            <circle
              cx="28"
              cy="28"
              r={R}
              fill="none"
              stroke="#ffd166"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              className="transition-[stroke-dashoffset] duration-150"
            />
          </svg>
          <ArrowUp className="relative size-6 transition group-hover:-translate-y-0.5" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
