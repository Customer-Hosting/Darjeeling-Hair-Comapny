"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarCheck, Check, Loader2, Send } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/Brand";
import { cn } from "@/lib/cn";

const SLOTS = [
  "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM",
  "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM",
];

type Form = {
  name: string;
  phone: string;
  email: string;
  service: string;
  date: string;
  time: string;
  message: string;
  company: string;
};

const EMPTY: Form = { name: "", phone: "", email: "", service: "", date: "", time: "", message: "", company: "" };

const noop = () => () => {};

function localISODate(d = new Date()) {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

export function BookingForm({ services, whatsapp }: { services: string[]; whatsapp: string }) {
  const [form, setForm] = useState<Form>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  // Browser-only values read without effects ("" during server prerender)
  const minDate = useSyncExternalStore(noop, localISODate, () => "");
  const urlService = useSyncExternalStore(
    noop,
    () => new URLSearchParams(window.location.search).get("service") ?? "",
    () => "",
  );
  const service = form.service || urlService;

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const waText = encodeURIComponent(
    `Hi Darjeeling Hair Company! I'd like to book an appointment.\n\nName: ${form.name}\nService: ${service}\nDate: ${form.date}\nTime: ${form.time}${form.message ? `\nNote: ${form.message}` : ""}`,
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.time) return setError("Please pick a preferred time slot.");
    setStatus("sending");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data.error as string)?.replace(/^\w+: /, "") || "Could not send your request");
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please WhatsApp us instead.",
      );
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-white p-6 shadow-soft md:p-9">
      <AnimatePresence mode="wait">
        {status === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative flex min-h-[460px] flex-col items-center justify-center text-center"
          >
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="grid size-20 place-items-center rounded-full bg-forest text-white shadow-[0_18px_40px_-15px_rgba(29,84,67,.8)]"
            >
              <Check className="size-10" strokeWidth={3} />
            </motion.span>
            <h3 className="h-serif mt-8 text-3xl">Request received!</h3>
            <p className="mt-3 max-w-sm">
              Thank you, {form.name.split(" ")[0]}. We&apos;ll call you shortly to confirm your{" "}
              <span className="font-semibold text-espresso">{service}</span> on{" "}
              <span className="font-semibold text-espresso">{form.date}</span> at <span className="font-semibold text-espresso">{form.time}</span>.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={`https://wa.me/${whatsapp}?text=${waText}`} target="_blank" rel="noreferrer" className="s-btn bg-[#25D366] text-white hover:brightness-105">
                <WhatsAppIcon className="size-5" /> Confirm faster on WhatsApp
              </a>
              <button
                type="button"
                onClick={() => {
                  setForm(EMPTY);
                  setStatus("idle");
                }}
                className="s-btn-outline"
              >
                Book another
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative space-y-5" noValidate={false}>
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-full bg-accent-soft text-accent">
                <CalendarCheck className="size-5" />
              </span>
              <div>
                <h3 className="h-serif text-2xl">Book an appointment</h3>
                <p className="text-sm">Takes under a minute · we confirm by phone</p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="s-label" htmlFor="b-name">Full name *</label>
                <input id="b-name" required minLength={2} maxLength={80} autoComplete="name" className="s-field" placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label className="s-label" htmlFor="b-phone">Phone *</label>
                <input id="b-phone" required type="tel" inputMode="tel" autoComplete="tel" pattern="[+\d][\d\s-]{6,18}" className="s-field" placeholder="+91 98xxx xxxxx" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div>
                <label className="s-label" htmlFor="b-email">Email</label>
                <input id="b-email" type="email" autoComplete="email" className="s-field" placeholder="Optional" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div>
                <label className="s-label" htmlFor="b-service">Service *</label>
                <select id="b-service" required className="s-field" value={service} onChange={(e) => set("service", e.target.value)}>
                  <option value="" disabled>Choose a service</option>
                  {services.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  {service && service !== "Consultation" && !services.includes(service) && <option value={service}>{service}</option>}
                  <option value="Consultation">Not sure — consultation</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="s-label" htmlFor="b-date">Preferred date *</label>
                <input id="b-date" required type="date" min={minDate || undefined} className="s-field" value={form.date} onChange={(e) => set("date", e.target.value)} />
              </div>
            </div>

            <fieldset>
              <legend className="s-label">Preferred time *</legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {SLOTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("time", t)}
                    aria-pressed={form.time === t}
                    className={cn(
                      "cursor-pointer rounded-lg border px-2 py-2.5 text-xs font-semibold transition",
                      form.time === t
                        ? "border-accent bg-accent text-white shadow-[0_8px_20px_-10px_rgba(192,119,90,.9)]"
                        : "border-line bg-white text-espresso hover:border-accent/60",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="s-label" htmlFor="b-msg">Anything we should know?</label>
              <textarea id="b-msg" rows={3} maxLength={600} className="s-field resize-none" placeholder="Hair length, reference look, allergies…" value={form.message} onChange={(e) => set("message", e.target.value)} />
            </div>

            {/* honeypot */}
            <input tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={form.company} onChange={(e) => set("company", e.target.value)} />

            {error && (
              <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button type="submit" disabled={status === "sending"} className="s-btn-accent flex-1 !py-4">
                {status === "sending" ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
                {status === "sending" ? "Sending…" : "Request appointment"}
              </button>
              <a href={`https://wa.me/${whatsapp}?text=${waText}`} target="_blank" rel="noreferrer" className="s-btn border border-[#25D366]/50 !py-4 text-[#16884a] hover:bg-[#25D366]/10">
                <WhatsAppIcon className="size-5" /> WhatsApp
              </a>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
