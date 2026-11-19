"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Field, PageTitle, Skeleton } from "@/components/admin/ui";
import type { SiteSettings } from "@/lib/types";

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-ink-2 p-6">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function SettingsAdminPage() {
  const { api, toast } = useAdmin();
  const [s, setS] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<SiteSettings>("/api/admin/settings").then(setS).catch((e: Error) => toast(e.message, "error"));
  }, [api, toast]);

  if (!s) return (<><PageTitle title="Contact & Settings" /><div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}</div></>);

  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) => setS((x) => (x ? { ...x, [k]: v } : x));
  const input = (k: keyof SiteSettings, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <input className="field" value={s[k] as string} onChange={(e) => set(k, e.target.value as never)} {...props} />
  );

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = await api<SiteSettings>("/api/admin/settings", { method: "PUT", body: JSON.stringify(s) });
      setS(saved);
      toast("Settings saved — the website is updated");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save} className="space-y-6 pb-24">
      <PageTitle title="Contact & Settings" subtitle="These details appear in the header, footer and Contact page." />

      <Card title="Contact details">
        <Field label="Phone (display)">{input("phone", { required: true })}</Field>
        <Field label="WhatsApp number (digits with country code)">{input("whatsapp", { required: true, pattern: "\\d{8,15}", placeholder: "917384163348" })}</Field>
        <div className="sm:col-span-2"><Field label="Email">{input("email", { type: "email", required: true })}</Field></div>
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
              <button type="button" aria-label="Remove row" onClick={() => set("hours", s.hours.filter((_, j) => j !== i))} className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/10 hover:border-rose hover:text-rose">
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {s.hours.length < 10 && (
            <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => set("hours", [...s.hours, { label: "", value: "" }])}>
              <Plus className="size-3.5" /> Add row
            </button>
          )}
        </div>
      </Card>

      <Card title="Social media">
        <Field label="Instagram URL">{input("instagramUrl", { type: "url" })}</Field>
        <Field label="Facebook URL">{input("facebookUrl", { type: "url" })}</Field>
      </Card>

      <Card title="Announcement bar" subtitle="Optional message shown at the very top of every page (e.g. festive offers). Leave empty to hide.">
        <div className="sm:col-span-2"><Field label="Announcement">{input("announcement", { maxLength: 160, placeholder: "✨ Diwali special: 20% off hair spa this week" })}</Field></div>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-ink/85 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl justify-end">
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save settings
          </button>
        </div>
      </div>
    </form>
  );
}
