"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Send, X } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/Brand";
import { cn } from "@/lib/cn";


/**
 * Floating WhatsApp button with a chat pop-up.
 * - Desktop: opens on mouse hover, stays open while the pointer moves into the pop-up.
 * - Touch / keyboard: opens on tap / Enter (no hover on phones).
 * - Never auto-closes while the visitor is typing; closes on ✕, Escape or click outside.
 */
export function WhatsAppChat({ whatsapp }: { whatsapp: string }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false); // opened by click/tap → don't close on mouse-leave
  const [message, setMessage] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const clearTimer = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const close = useCallback(() => {
    clearTimer();
    setOpen(false);
    setPinned(false);
  }, []);

  // Escape + click outside
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, close]);

  useEffect(() => clearTimer, []);

  const send = (text = message) => {
    const msg = text.trim() || "Hi Darjeeling Hair Company! I'd like to know more.";
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
    setMessage("");
    close();
  };

  return (
    <div
      ref={root}
      className="fixed right-5 bottom-5 z-40 flex flex-col items-end md:right-8 md:bottom-8"
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimer();
        setOpen(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse" || pinned) return;
        // keep it open if the visitor has started typing
        if (message.trim() || document.activeElement === textarea.current) return;
        closeTimer.current = setTimeout(() => setOpen(false), 350);
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            role="dialog"
            aria-label="Chat with us on WhatsApp"
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 w-[min(92vw,360px)] origin-bottom-right overflow-hidden rounded-2xl border border-line bg-white shadow-[0_30px_70px_-20px_rgba(42,29,23,.45)]"
          >
            {/* Header */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-accent to-accent-dark px-4 py-3.5 text-white">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#1fa855]">
                <WhatsAppIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-[15px] font-bold">Darjeeling Hair Company</p>
                <p className="flex items-center gap-1.5 text-xs text-white/85">
                  <span className="size-1.5 rounded-full bg-[#7dffa9]" /> We usually reply on WhatsApp
                </p>
              </div>
              <button type="button" onClick={close} aria-label="Close chat" className="grid size-8 cursor-pointer place-items-center rounded-full transition hover:bg-white/15">
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="bg-sand/60 p-4">
              <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-2.5 text-sm text-espresso shadow-sm">
                Hi there 👋 Welcome to <strong>Darjeeling Hair Company</strong>! How can we help you?
              </div>
            </div>

            <form
              className="space-y-3 border-t border-line p-4"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <label htmlFor={`${panelId}-msg`} className="sr-only">Your message</label>
              <textarea
                id={`${panelId}-msg`}
                ref={textarea}
                rows={3}
                maxLength={500}
                value={message}
                onFocus={() => setPinned(true)}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type your message…"
                className="s-field resize-none !text-sm"
              />
              <button type="submit" className="s-btn-accent w-full !py-3 !text-sm">
                Send on WhatsApp <Send className="size-4" />
              </button>
              <p className="text-center text-[11px] text-body/70">Opens WhatsApp with your message ready to send.</p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <button
        type="button"
        aria-label={open ? "Close WhatsApp chat" : "Chat with us on WhatsApp"}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          clearTimer();
          if (open && pinned) close();
          else {
            setOpen(true);
            setPinned(true);
          }
        }}
        className={cn(
          "relative grid size-14 cursor-pointer place-items-center rounded-full text-white shadow-[0_14px_34px_-10px_rgba(163,95,69,.9)] transition duration-300 hover:scale-105",
          open ? "bg-espresso" : "bg-accent hover:bg-accent-dark",
        )}
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-accent/40 [animation-duration:2.6s]" aria-hidden />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "x" : "wa"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="grid place-items-center"
          >
            {open ? <X className="size-6" /> : <WhatsAppIcon className="size-7" />}
          </motion.span>
        </AnimatePresence>
      </button>
    </div>
  );
}
