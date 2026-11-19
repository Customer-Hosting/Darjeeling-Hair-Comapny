"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUp, ExternalLink, ImagePlus, Loader2, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { Field, PageTitle, Skeleton, Switch } from "@/components/admin/ui";
import { CategoryIcon, CATEGORY_ICON_LABELS } from "@/components/icons/CategoryIcon";
import { compressImage } from "@/lib/compress-image";
import type { AboutContent } from "@/lib/about";
import { CATEGORY_ICONS, type CategoryIcon as IconKey } from "@/lib/types";
import { cn } from "@/lib/cn";

/* ── small building blocks ── */
function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-ink-2 p-6">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function RowBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-10 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/10 transition disabled:cursor-not-allowed disabled:opacity-30",
        danger ? "hover:border-blush hover:text-blush" : "hover:border-white/30",
      )}
    >
      {children}
    </button>
  );
}

const move = <T,>(list: T[], i: number, dir: -1 | 1) => {
  const next = [...list];
  const [x] = next.splice(i, 1);
  next.splice(i + dir, 0, x);
  return next;
};

function ListControls({ i, len, onMove, onRemove }: { i: number; len: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-1">
      <RowBtn label="Move up" disabled={i === 0} onClick={() => onMove(-1)}><ArrowUp className="size-4" /></RowBtn>
      <RowBtn label="Move down" disabled={i === len - 1} onClick={() => onMove(1)}><ArrowDown className="size-4" /></RowBtn>
      <RowBtn label="Remove" danger onClick={onRemove}><Trash2 className="size-4" /></RowBtn>
    </div>
  );
}

/* ── page ── */
export default function AboutAdminPage() {
  const { api, toast } = useAdmin();
  const [a, setA] = useState<AboutContent | null>(null);
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api<AboutContent>("/api/admin/about")
      .then((d) => {
        setA(d);
        setSaved(JSON.stringify(d));
      })
      .catch((e: Error) => toast(e.message, "error"));
  }, [api, toast]);

  // image changes are saved immediately, so they're excluded from the "unsaved" comparison
  const comparable = (x: AboutContent) => JSON.stringify({ ...x, founder: { ...x.founder, imageUrl: "", customImage: false } });
  const dirty = useMemo(() => !!a && saved !== "" && comparable(a) !== comparable(JSON.parse(saved)), [a, saved]);

  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  if (!a) return (<><PageTitle title="About Page" /><div className="space-y-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-48" />)}</div></>);

  const set = (patch: Partial<AboutContent>) => setA((x) => (x ? { ...x, ...patch } : x));
  const setPart = <K extends keyof AboutContent>(k: K, patch: Partial<AboutContent[K]>) =>
    setA((x) => (x ? { ...x, [k]: { ...(x[k] as object), ...patch } } : x));

  async function save() {
    if (!a) return;
    setBusy(true);
    try {
      const clean: AboutContent = {
        ...a,
        founder: { ...a.founder, highlights: a.founder.highlights.map((h) => h.trim()).filter(Boolean) },
        stats: a.stats.filter((s) => s.value.trim()),
        journey: { ...a.journey, items: a.journey.items.filter((j) => j.title.trim()) },
        values: { ...a.values, items: a.values.items.filter((v) => v.title.trim()) },
      };
      const d = await api<AboutContent>("/api/admin/about", { method: "PUT", body: JSON.stringify(clean) });
      setA(d);
      setSaved(JSON.stringify(d));
      toast("About page saved — the website is updated");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", await compressImage(file, 1600));
      const r = await api<{ imageUrl: string; customImage: boolean }>("/api/admin/about/image", { method: "POST", body: fd });
      setPart("founder", r);
      setSaved((s) => JSON.stringify({ ...JSON.parse(s), founder: { ...JSON.parse(s).founder, ...r } }));
      toast("Photo updated");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setUploading(false);
    }
  }

  async function resetImage() {
    setUploading(true);
    try {
      const r = await api<{ imageUrl: string; customImage: boolean }>("/api/admin/about/image", { method: "DELETE" });
      setPart("founder", r);
      toast("Photo reset to the default");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <PageTitle
        title="About Page"
        subtitle="Edit every section of the website's About Us page."
        action={
          <a href="/about" target="_blank" rel="noreferrer" className="btn-ghost">
            <ExternalLink className="size-4" /> View page
          </a>
        }
      />

      <Card title="Page header" subtitle="Tip: wrap words in *asterisks* to colour them, e.g. A Salon Built on *Craft & Care*">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <Field label="Small label"><input className="field" maxLength={60} value={a.header.eyebrow} onChange={(e) => setPart("header", { eyebrow: e.target.value })} /></Field>
          <Field label="Title *"><input className="field" maxLength={120} value={a.header.title} onChange={(e) => setPart("header", { title: e.target.value })} /></Field>
        </div>
        <Field label="Introduction"><textarea rows={2} maxLength={400} className="field resize-none" value={a.header.intro} onChange={(e) => setPart("header", { intro: e.target.value })} /></Field>
      </Card>

      <Card title="Founder section">
        <div className="grid gap-6 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            <span className="label">Photo</span>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-ink-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.founder.imageUrl} alt="" className="size-full object-cover" />
              {uploading && <span className="text-on-dark absolute inset-0 grid place-items-center bg-black/50"><Loader2 className="size-6 animate-spin" /></span>}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.target.value = ""; }} />
            <button type="button" className="btn-ghost w-full !py-2 text-xs" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <ImagePlus className="size-3.5" /> {a.founder.customImage ? "Replace photo" : "Upload photo"}
            </button>
            {a.founder.customImage && (
              <button type="button" className="flex w-full cursor-pointer items-center justify-center gap-1 text-xs text-white/55 hover:text-rose" disabled={uploading} onClick={resetImage}>
                <RotateCcw className="size-3" /> Use default photo
              </button>
            )}
            {!a.founder.customImage && <p className="text-[11px] text-white/45">Showing a sample photo — upload a real photo of the founder or salon.</p>}
          </div>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Small label"><input className="field" maxLength={60} value={a.founder.eyebrow} onChange={(e) => setPart("founder", { eyebrow: e.target.value })} /></Field>
              <Field label="Name *"><input className="field" maxLength={80} value={a.founder.name} onChange={(e) => setPart("founder", { name: e.target.value })} /></Field>
            </div>
            <Field label="Story (leave a blank line between paragraphs)">
              <textarea rows={7} maxLength={3000} className="field resize-y" value={a.founder.body} onChange={(e) => setPart("founder", { body: e.target.value })} />
            </Field>
            <div>
              <span className="label">Highlights (checklist)</span>
              <div className="space-y-2">
                {a.founder.highlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="field" maxLength={120} value={h} onChange={(e) => setPart("founder", { highlights: a.founder.highlights.map((x, j) => (j === i ? e.target.value : x)) })} />
                    <ListControls i={i} len={a.founder.highlights.length} onMove={(d) => setPart("founder", { highlights: move(a.founder.highlights, i, d) })} onRemove={() => setPart("founder", { highlights: a.founder.highlights.filter((_, j) => j !== i) })} />
                  </div>
                ))}
                {a.founder.highlights.length < 8 && (
                  <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => setPart("founder", { highlights: [...a.founder.highlights, ""] })}>
                    <Plus className="size-3.5" /> Add highlight
                  </button>
                )}
              </div>
            </div>
            <Switch checked={a.founder.showFollowButton} onChange={(v) => setPart("founder", { showFollowButton: v })} label="Show “Follow on Instagram” button" />
          </div>
        </div>
      </Card>

      <Card title="Numbers" subtitle='Short values like "17+", "3" or "2021". Numbers up to 3 digits count up with an animation.'>
        {a.stats.map((s, i) => (
          <div key={i} className="flex flex-col gap-2 sm:flex-row">
            <input className="field sm:!w-32" maxLength={12} placeholder="17+" value={s.value} onChange={(e) => set({ stats: a.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
            <div className="flex flex-1 gap-2">
              <input className="field" maxLength={60} placeholder="Years of experience" value={s.label} onChange={(e) => set({ stats: a.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
              <ListControls i={i} len={a.stats.length} onMove={(d) => set({ stats: move(a.stats, i, d) })} onRemove={() => set({ stats: a.stats.filter((_, j) => j !== i) })} />
            </div>
          </div>
        ))}
        {a.stats.length < 6 && (
          <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => set({ stats: [...a.stats, { value: "", label: "" }] })}>
            <Plus className="size-3.5" /> Add number
          </button>
        )}
      </Card>

      <Card title="Our story (timeline)">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <Field label="Small label"><input className="field" maxLength={60} value={a.journey.eyebrow} onChange={(e) => setPart("journey", { eyebrow: e.target.value })} /></Field>
          <Field label="Section title"><input className="field" maxLength={120} value={a.journey.title} onChange={(e) => setPart("journey", { title: e.target.value })} /></Field>
        </div>
        {a.journey.items.map((it, i) => (
          <div key={i} className="rounded-2xl border border-white/10 p-4">
            <div className="flex gap-2">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose text-sm font-bold text-ink">{i + 1}</span>
              <input className="field" maxLength={120} placeholder="Milestone title" value={it.title} onChange={(e) => setPart("journey", { items: a.journey.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
              <ListControls i={i} len={a.journey.items.length} onMove={(d) => setPart("journey", { items: move(a.journey.items, i, d) })} onRemove={() => setPart("journey", { items: a.journey.items.filter((_, j) => j !== i) })} />
            </div>
            <textarea rows={2} maxLength={400} className="field mt-2 resize-none" placeholder="Short description" value={it.text} onChange={(e) => setPart("journey", { items: a.journey.items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
          </div>
        ))}
        {a.journey.items.length < 10 && (
          <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => setPart("journey", { items: [...a.journey.items, { title: "", text: "" }] })}>
            <Plus className="size-3.5" /> Add milestone
          </button>
        )}
      </Card>

      <Card title="Our values">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <Field label="Small label"><input className="field" maxLength={60} value={a.values.eyebrow} onChange={(e) => setPart("values", { eyebrow: e.target.value })} /></Field>
          <Field label="Section title"><input className="field" maxLength={120} value={a.values.title} onChange={(e) => setPart("values", { title: e.target.value })} /></Field>
        </div>
        {a.values.items.map((it, i) => (
          <div key={i} className="rounded-2xl border border-white/10 p-4">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative sm:w-44">
                <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-rose"><CategoryIcon icon={it.icon} className="size-4" /></span>
                <select aria-label="Icon" className="field !pl-10" value={it.icon} onChange={(e) => setPart("values", { items: a.values.items.map((x, j) => (j === i ? { ...x, icon: e.target.value as IconKey } : x)) })}>
                  {CATEGORY_ICONS.map((ic) => <option key={ic} value={ic}>{CATEGORY_ICON_LABELS[ic]}</option>)}
                </select>
              </div>
              <div className="flex flex-1 gap-2">
                <input className="field" maxLength={80} placeholder="Value title" value={it.title} onChange={(e) => setPart("values", { items: a.values.items.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} />
                <ListControls i={i} len={a.values.items.length} onMove={(d) => setPart("values", { items: move(a.values.items, i, d) })} onRemove={() => setPart("values", { items: a.values.items.filter((_, j) => j !== i) })} />
              </div>
            </div>
            <textarea rows={2} maxLength={300} className="field mt-2 resize-none" placeholder="Short description" value={it.text} onChange={(e) => setPart("values", { items: a.values.items.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
          </div>
        ))}
        {a.values.items.length < 9 && (
          <button type="button" className="btn-ghost !py-2 text-xs" onClick={() => setPart("values", { items: [...a.values.items, { icon: "sparkles", title: "", text: "" }] })}>
            <Plus className="size-3.5" /> Add value
          </button>
        )}
      </Card>

      <Card title="Search engine (SEO)" subtitle="What Google shows for the About page.">
        <Field label={`Page title (${a.seo.title.length}/70)`}><input className="field" maxLength={70} value={a.seo.title} onChange={(e) => setPart("seo", { title: e.target.value })} /></Field>
        <Field label={`Description (${a.seo.description.length}/170 — aim for under 160)`}><textarea rows={2} maxLength={170} className="field resize-none" value={a.seo.description} onChange={(e) => setPart("seo", { description: e.target.value })} /></Field>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-ink/85 px-4 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-4">
          {dirty && <span className="text-sm text-champagne">Unsaved changes</span>}
          <button type="button" className="btn-primary" disabled={busy || !dirty} onClick={save}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save About page
          </button>
        </div>
      </div>
    </div>
  );
}
