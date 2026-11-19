"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Mail, Phone, Plus, Save, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Field, PageTitle, Skeleton } from "@/components/admin/ui";
import { SocialIcon } from "@/components/icons/Social";
import { SOCIAL_META } from "@/lib/settings";
import { SOCIAL_PLATFORMS, type ContactEntry, type SiteSettings, type SocialLink, type SocialPlatform } from "@/lib/types";
import { cn } from "@/lib/cn";

const MAX_EXTRA = 5;
const MAX_SOCIALS = 12;

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-ink-2 p-6">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function SubHeading({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="border-t border-white/10 pt-5 sm:col-span-2">
      <p className="text-sm font-semibold">{children}</p>
      {hint && <p className="mt-0.5 text-xs text-white/50">{hint}</p>}
    </div>
  );
}

function RowButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-12 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/10 transition disabled:cursor-not-allowed disabled:opacity-30",
        danger ? "hover:border-blush hover:text-blush" : "hover:border-white/30",
      )}
    >
      {children}
    </button>
  );
}

/** Turns API paths like "extraPhones.1.value: …" into friendly messages. */
function friendlyError(message: string) {
  const m = message.match(/^([\w.]+):\s*(.*)$/);
  if (!m) return message;
  const [, path, msg] = m;
  const [field, idx] = path.split(".");
  const n = idx !== undefined ? ` #${Number(idx) + 1}` : "";
  const names: Record<string, string> = {
    phone: "Phone",
    whatsapp: "WhatsApp number",
    email: "Email",
    extraPhones: "Additional phone",
    extraEmails: "Additional email",
    socials: "Social profile",
    addressLine1: "Address line 1",
    googleMapsUrl: "Google Maps link",
    appleMapsUrl: "Apple Maps link",
    mapEmbedUrl: "Map embed URL",
    hours: "Opening hours row",
  };
  return `${names[field] ?? field}${n}: ${msg}`;
}

/** Drops rows the admin left completely blank so they don't block saving. */
function prepare(s: SiteSettings): SiteSettings {
  const entries = (list: ContactEntry[]) =>
    list.map((e) => ({ label: e.label.trim(), value: e.value.trim() })).filter((e) => e.value || e.label);
  return {
    ...s,
    extraPhones: entries(s.extraPhones),
    extraEmails: entries(s.extraEmails),
    socials: s.socials.map((x) => ({ ...x, url: x.url.trim() })).filter((x) => x.url),
    hours: s.hours.filter((h) => h.label.trim() || h.value.trim()),
  };
}

export default function SettingsAdminPage() {
  const { api, toast } = useAdmin();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<SiteSettings>("/api/admin/settings")
      .then((data) => {
        setS(data);
        setSaved(JSON.stringify(data));
      })
      .catch((e: Error) => toast(e.message, "error"));
  }, [api, toast]);

  const dirty = useMemo(() => !!s && JSON.stringify(s) !== saved, [s, saved]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  if (!s) return (<><PageTitle title="Contact & Settings" /><div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}</div></>);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((x) => (x ? { ...x, [k]: v } : x));
  const input = (k: keyof SiteSettings, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input className="field" value={s[k] as string} onChange={(e) => set(k, e.target.value as never)} {...props} />
  );

  // ── list helpers ──
  const updateEntry = (k: "extraPhones" | "extraEmails", i: number, patch: Partial<ContactEntry>) =>
    set(k, s[k].map((e, j) => (j === i ? { ...e, ...patch } : e)));
  const removeAt = <T,>(list: T[], i: number) => list.filter((_, j) => j !== i);
  const move = <T,>(list: T[], i: number, dir: -1 | 1) => {
    const next = [...list];
    const [item] = next.splice(i, 1);
    next.splice(i + dir, 0, item);
    return next;
  };
  const updateSocial = (i: number, patch: Partial<SocialLink>) => set("socials", s.socials.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const addSocial = (platform: SocialPlatform) => s.socials.length < MAX_SOCIALS && set("socials", [...s.socials, { platform, url: "" }]);
  const unused = SOCIAL_PLATFORMS.filter((p) => p !== "website" && !s.socials.some((x) => x.platform === p));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!s) return;
    setBusy(true);
    try {
      const data = await api<SiteSettings>("/api/admin/settings", { method: "PUT", body: JSON.stringify(prepare(s)) });
      setS(data);
      setSaved(JSON.stringify(data));
      toast("Settings saved — the website is updated");
    } catch (err) {
      toast(friendlyError((err as Error).message), "error");
    } finally {
      setBusy(false);
    }
  }

  const entryList = (k: "extraPhones" | "extraEmails") => {
    const isPhone = k === "extraPhones";
    const Icon = isPhone ? Phone : Mail;
    return (
      <div className="space-y-3 sm:col-span-2">
        {s[k].map((entry, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <input
              className="field sm:!w-48"
              maxLength={30}
              placeholder={isPhone ? "Label, e.g. Reception" : "Label, e.g. Bookings"}
              aria-label={`${isPhone ? "Phone" : "Email"} ${i + 2} label`}
              value={entry.label}
              onChange={(e) => updateEntry(k, i, { label: e.target.value })}
            />
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Icon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/40" />
                <input
                  className="field !pl-11"
                  type={isPhone ? "tel" : "email"}
                  inputMode={isPhone ? "tel" : "email"}
                  placeholder={isPhone ? "+91 98xxx xxxxx" : "name@example.com"}
                  aria-label={`${isPhone ? "Phone number" : "Email address"} ${i + 2}`}
                  value={entry.value}
                  onChange={(e) => updateEntry(k, i, { value: e.target.value })}
                />
              </div>
              <RowButton label="Remove" danger onClick={() => set(k, removeAt(s[k], i))}>
                <Trash2 className="size-4" />
              </RowButton>
            </div>
          </div>
        ))}
        {s[k].length < MAX_EXTRA ? (
          <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => set(k, [...s[k], { label: "", value: "" }])}>
            <Plus className="size-3.5" /> {isPhone ? "Add phone number" : "Add email address"}
          </button>
        ) : (
          <p className="text-xs text-white/50">Maximum of {MAX_EXTRA} additional {isPhone ? "numbers" : "emails"}.</p>
        )}
      </div>
    );
  };

  return (
    <form onSubmit={save} className="space-y-6 pb-24" noValidate>
      <PageTitle title="Contact & Settings" subtitle="These details appear in the header, footer and Contact page." />

      <Card title="Contact details" subtitle="The primary phone, WhatsApp and email are used for the Call / WhatsApp / Email buttons across the site.">
        <Field label="Primary phone">{input("phone", { required: true, type: "tel" })}</Field>
        <Field label="WhatsApp number (digits with country code)">{input("whatsapp", { required: true, inputMode: "numeric", placeholder: "917384163348" })}</Field>
        <div className="sm:col-span-2"><Field label="Primary email">{input("email", { type: "email", required: true })}</Field></div>

        <SubHeading hint="Shown on the Contact page and in the footer, with an optional label.">Additional phone numbers</SubHeading>
        {entryList("extraPhones")}

        <SubHeading hint="Shown on the Contact page and in the footer, with an optional label.">Additional email addresses</SubHeading>
        {entryList("extraEmails")}
      </Card>

      <Card title="Address & maps">
        <Field label="Address line 1">{input("addressLine1", { required: true })}</Field>
        <Field label="Address line 2">{input("addressLine2")}</Field>
        <Field label="City / State">{input("city")}</Field>
        <Field label="PIN code">{input("pincode")}</Field>
        <Field label="Google Maps link">{input("googleMapsUrl", { type: "url" })}</Field>
        <Field label="Apple Maps link">{input("appleMapsUrl", { type: "url" })}</Field>
        <div className="sm:col-span-2">
          <Field label="Map embed URL (Google Maps → Share → Embed a map → copy the src link)">{input("mapEmbedUrl", { type: "url" })}</Field>
        </div>
      </Card>

      <Card title="Opening hours">
        <div className="space-y-3 sm:col-span-2">
          {s.hours.map((h, i) => (
            <div key={i} className="flex gap-2">
              <input className="field" placeholder="Monday – Saturday" value={h.label} onChange={(e) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              <input className="field" placeholder="10:00 AM – 8:00 PM" value={h.value} onChange={(e) => set("hours", s.hours.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} />
              <RowButton label="Remove row" danger onClick={() => set("hours", removeAt(s.hours, i))}>
                <Trash2 className="size-4" />
              </RowButton>
            </div>
          ))}
          {s.hours.length < 10 && (
            <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => set("hours", [...s.hours, { label: "", value: "" }])}>
              <Plus className="size-3.5" /> Add row
            </button>
          )}
        </div>
      </Card>

      <Card title="Social media" subtitle="Add any profiles you like — they appear as icons in the footer, Contact page and mobile menu, in this order.">
        <div className="space-y-3 sm:col-span-2">
          {s.socials.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/15 p-4 text-center text-sm text-white/55">No social profiles yet — add one below.</p>
          )}
          {s.socials.map((link, i) => (
            <div key={i} className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-52">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-rose">
                  <SocialIcon platform={link.platform} className="size-4" />
                </span>
                <select
                  className="field !pl-11"
                  aria-label={`Platform for profile ${i + 1}`}
                  value={link.platform}
                  onChange={(e) => updateSocial(i, { platform: e.target.value as SocialPlatform })}
                >
                  {SOCIAL_PLATFORMS.map((p) => (
                    <option key={p} value={p}>{SOCIAL_META[p].label}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-1 gap-2">
                <input
                  className="field"
                  type="url"
                  inputMode="url"
                  aria-label={`${SOCIAL_META[link.platform].label} link`}
                  placeholder={SOCIAL_META[link.platform].placeholder}
                  value={link.url}
                  onChange={(e) => updateSocial(i, { url: e.target.value })}
                />
                <RowButton label="Move up" disabled={i === 0} onClick={() => set("socials", move(s.socials, i, -1))}>
                  <ArrowUp className="size-4" />
                </RowButton>
                <RowButton label="Move down" disabled={i === s.socials.length - 1} onClick={() => set("socials", move(s.socials, i, 1))}>
                  <ArrowDown className="size-4" />
                </RowButton>
                <RowButton label="Remove" danger onClick={() => set("socials", removeAt(s.socials, i))}>
                  <Trash2 className="size-4" />
                </RowButton>
              </div>
            </div>
          ))}

          {s.socials.length < MAX_SOCIALS ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-white/50">Quick add:</span>
              {unused.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => addSocial(p)}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium transition hover:border-rose/50 hover:text-rose"
                >
                  <SocialIcon platform={p} className="size-3.5" /> {SOCIAL_META[p].label}
                </button>
              ))}
              <button type="button" onClick={() => addSocial("website")} className="btn-ghost !px-3 !py-1.5 text-xs">
                <Plus className="size-3.5" /> Other link
              </button>
            </div>
          ) : (
            <p className="text-xs text-white/50">Maximum of {MAX_SOCIALS} social profiles.</p>
          )}
        </div>
      </Card>

      <Card title="Announcement bar" subtitle="Optional message shown at the very top of every page (e.g. festive offers). Leave empty to hide.">
        <div className="sm:col-span-2"><Field label="Announcement">{input("announcement", { maxLength: 160, placeholder: "✨ Diwali special: 20% off hair spa this week" })}</Field></div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-ink/85 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4">
          {dirty && <span className="text-sm text-champagne">Unsaved changes</span>}
          <button type="submit" className="btn-primary" disabled={busy || !dirty}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save settings
          </button>
        </div>
      </div>
    </form>
  );
}
