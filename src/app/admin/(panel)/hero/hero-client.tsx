"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Save, Timer, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ImportSamplesButton } from "@/components/admin/ImportSamples";
import { ConfirmDialog, Empty, Field, IconBtn, ImagePicker, Modal, PageTitle, Skeleton, Switch } from "@/components/admin/ui";
import { compressImage } from "@/lib/compress-image";
import { HERO_INTERVALS, type HeroSlide, type HeroSliderSettings } from "@/lib/types";
import { cn } from "@/lib/cn";

type Draft = Omit<HeroSlide, "id" | "imageUrl">;
const BLANK: Draft = {
  eyebrow: "Unisex Salon · Darjeeling",
  title: "",
  highlight: "",
  subtitle: "",
  ctaLabel: "Book an appointment",
  ctaHref: "/contact#book",
  active: true,
  order: 0,
};

export default function HeroAdminPage() {
  const { api, toast } = useAdmin();
  const [items, setItems] = useState<HeroSlide[] | null>(null);
  const [editing, setEditing] = useState<HeroSlide | "new" | null>(null);
  const [deleting, setDeleting] = useState<HeroSlide | null>(null);

  const load = useCallback(
    () => api<HeroSlide[]>("/api/admin/hero").then(setItems).catch((e: Error) => { setItems([]); toast(e.message, "error"); }),
    [api, toast],
  );
  useEffect(() => { load(); }, [load]);

  async function toggle(s: HeroSlide) {
    const fd = toForm({ ...s, active: !s.active });
    try {
      await api(`/api/admin/hero/${s.id}`, { method: "PATCH", body: fd });
      toast(s.active ? "Slide hidden" : "Slide is live");
      load();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  return (
    <>
      <PageTitle
        title="Hero Slider"
        subtitle="The full-screen banner on the home page. Landscape images (1920×1080+) look best."
        action={<button className="btn-primary" onClick={() => setEditing("new")}><Plus className="size-4" /> Add slide</button>}
      />

      <SliderSettingsCard slideCount={items?.filter((s) => s.active).length ?? 0} />

      {!items ? (
        <div className="grid gap-5 md:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="aspect-video" />)}</div>
      ) : items.length === 0 ? (
        <Empty
          title="No slides yet"
          text="The website is currently showing 3 built-in sample slides. Import them to edit them here, or add your own slide (ideally a real photo of the salon)."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ImportSamplesButton onDone={load} label="Import sample slides" />
              <button className="btn-ghost" onClick={() => setEditing("new")}><Plus className="size-4" /> Add your own</button>
            </div>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((s) => (
            <article key={s.id} className="overflow-hidden rounded-3xl border border-white/10 bg-ink-2">
              <div className="relative aspect-video">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.imageUrl} alt="" className={`size-full object-cover ${s.active ? "" : "opacity-40 grayscale"}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/90 to-transparent p-5">
                  <p className="text-[10px] tracking-[0.2em] text-rose uppercase">{s.eyebrow}</p>
                  <p className="mt-2 max-w-[75%] font-display text-xl leading-tight font-bold">
                    {s.title} <em className="font-serif font-normal text-rose-soft">{s.highlight}</em>
                  </p>
                </div>
                <span className="absolute top-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-[11px] backdrop-blur">#{s.order}</span>
                {!s.active && <span className="absolute right-3 bottom-3 rounded-full bg-ink/80 px-2.5 py-1 text-[11px]">Hidden</span>}
              </div>
              <div className="flex items-center justify-end gap-1 p-3">
                <IconBtn label={s.active ? "Hide" : "Show"} onClick={() => toggle(s)}>{s.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</IconBtn>
                <IconBtn label="Edit" onClick={() => setEditing(s)}><Pencil className="size-4" /></IconBtn>
                <IconBtn label="Delete" danger onClick={() => setDeleting(s)}><Trash2 className="size-4" /></IconBtn>
              </div>
            </article>
          ))}
        </div>
      )}

      <HeroForm
        target={editing}
        nextOrder={items?.length ?? 0}
        onClose={() => setEditing(null)}
        onSaved={() => { setEditing(null); load(); }}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Delete slide?"
        message="This slide and its image will be permanently removed from the website."
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await api(`/api/admin/hero/${deleting!.id}`, { method: "DELETE" });
            toast("Slide deleted");
            load();
          } catch (e) {
            toast((e as Error).message, "error");
          }
        }}
      />
    </>
  );
}

function toForm(d: Draft, file?: File | null) {
  const fd = new FormData();
  Object.entries(d).forEach(([k, v]) => fd.append(k, String(v)));
  if (file) fd.append("image", file);
  return fd;
}

function HeroForm({ target, nextOrder, onClose, onSaved }: { target: HeroSlide | "new" | null; nextOrder: number; onClose: () => void; onSaved: () => void }) {
  const { api, toast } = useAdmin();
  const [d, setD] = useState<Draft>(BLANK);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const isNew = target === "new";

  // Reset the form whenever a different slide is opened (render-phase update, no effect needed)
  const [prevTarget, setPrevTarget] = useState(target);
  if (target !== prevTarget) {
    setPrevTarget(target);
    if (target) {
      setFile(null);
      if (target === "new") setD({ ...BLANK, order: nextOrder });
      else {
        const { id: _i, imageUrl: _u, ...rest } = target;
        void _i; void _u;
        setD(rest);
      }
    }
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (isNew && !file) return toast("Please choose an image for the slide", "error");
    setBusy(true);
    try {
      const img = file ? await compressImage(file, 2400) : null;
      await api(isNew ? "/api/admin/hero" : `/api/admin/hero/${(target as HeroSlide).id}`, {
        method: isNew ? "POST" : "PATCH",
        body: toForm(d, img),
      });
      toast(isNew ? "Slide added" : "Slide updated");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!target} onClose={() => !busy && onClose()} title={isNew ? "Add hero slide" : "Edit hero slide"} wide>
      <form onSubmit={save} className="space-y-5">
        <ImagePicker value={file} onChange={setFile} existingUrl={target && target !== "new" ? target.imageUrl : null} hint="Landscape · at least 1920×1080 recommended" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Small label (eyebrow)"><input className="field" maxLength={80} value={d.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} /></Field>
          <Field label="Order"><input type="number" min={0} className="field" value={d.order} onChange={(e) => set("order", Number(e.target.value))} /></Field>
          <Field label="Headline *"><input required className="field" maxLength={120} placeholder="Hair, crafted with" value={d.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Highlighted words"><input className="field" maxLength={120} placeholder="17 years of artistry" value={d.highlight} onChange={(e) => set("highlight", e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Field label="Subtitle"><textarea rows={2} className="field resize-none" maxLength={300} value={d.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></Field>
          </div>
          <Field label="Button text"><input className="field" maxLength={40} value={d.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} /></Field>
          <Field label="Button link"><input className="field" maxLength={300} placeholder="/contact#book" value={d.ctaHref} onChange={(e) => set("ctaHref", e.target.value)} /></Field>
        </div>
        <Switch checked={d.active} onChange={(v) => set("active", v)} label="Show this slide on the website" />
        <div className="flex justify-end gap-2 border-t border-white/10 pt-5">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} {isNew ? "Add slide" : "Save changes"}</button>
        </div>
      </form>
    </Modal>
  );
}

/* ─────────────────────── Slider behaviour settings ─────────────────────── */

function SliderSettingsCard({ slideCount }: { slideCount: number }) {
  const { api, toast } = useAdmin();
  const [saved, setSaved] = useState<HeroSliderSettings | null>(null);
  const [draft, setDraft] = useState<HeroSliderSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<HeroSliderSettings>("/api/admin/hero-settings")
      .then((s) => {
        setSaved(s);
        setDraft(s);
      })
      .catch((e: Error) => toast(e.message, "error"));
  }, [api, toast]);

  if (!draft || !saved) return <Skeleton className="mb-6 h-36" />;

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const options: number[] = HERO_INTERVALS.includes(draft.interval as (typeof HERO_INTERVALS)[number])
    ? [...HERO_INTERVALS]
    : [...HERO_INTERVALS, draft.interval].sort((a, b) => a - b);

  async function save() {
    if (!draft) return;
    setBusy(true);
    try {
      const s = await api<HeroSliderSettings>("/api/admin/hero-settings", { method: "PUT", body: JSON.stringify(draft) });
      setSaved(s);
      setDraft(s);
      toast("Slider settings saved — the home page is updated");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mb-8 rounded-3xl border border-white/10 bg-ink-2 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-rose/10 text-rose">
            <Timer className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold">Slider settings</h2>
            <p className="text-sm text-white/55">
              {draft.autoplay
                ? `Each slide shows for ${draft.interval} second${draft.interval === 1 ? "" : "s"}${slideCount > 1 ? ` — a full loop of ${slideCount} slides takes ${slideCount * draft.interval}s` : ""}.`
                : "Slides change only when visitors use the arrows or swipe."}
            </p>
          </div>
        </div>
        <button type="button" className="btn-primary" disabled={!dirty || busy} onClick={save}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <Switch checked={draft.autoplay} onChange={(v) => setDraft({ ...draft, autoplay: v })} label="Play slides automatically" />

        <div className={cn("transition", !draft.autoplay && "pointer-events-none opacity-40")}>
          <p className="label">Time per slide</p>
          <div role="radiogroup" aria-label="Time per slide" className="flex flex-wrap gap-2">
            {options.map((sec) => (
              <button
                key={sec}
                type="button"
                role="radio"
                aria-checked={draft.interval === sec}
                onClick={() => setDraft({ ...draft, interval: sec })}
                className={cn(
                  "min-w-14 cursor-pointer rounded-xl border px-3.5 py-2 text-sm font-semibold transition",
                  draft.interval === sec ? "border-rose bg-rose text-ink" : "border-white/10 bg-white/[0.03] hover:border-white/30",
                )}
              >
                {sec}s
              </button>
            ))}
          </div>
        </div>

        <div className={cn("transition", !draft.autoplay && "pointer-events-none opacity-40")}>
          <Switch
            checked={draft.pauseOnHover}
            onChange={(v) => setDraft({ ...draft, pauseOnHover: v })}
            label="Pause while a visitor's mouse is over the slider"
          />
          <p className="mt-1.5 ml-14 text-xs text-white/50">
            Recommended off — the slider fills the screen, so the mouse is usually over it and the slides would rarely move.
            Never affects phones or tablets.
          </p>
        </div>
        {slideCount < 2 && draft.autoplay && (
          <p className="text-xs text-white/50">Tip: add at least 2 visible slides for the slider to rotate.</p>
        )}
      </div>
    </section>
  );
}
