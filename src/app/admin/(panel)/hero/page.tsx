"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ConfirmDialog, Empty, Field, IconBtn, ImagePicker, Modal, PageTitle, Skeleton, Switch } from "@/components/admin/ui";
import { compressImage } from "@/lib/compress-image";
import type { HeroSlide } from "@/lib/types";

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

      {!items ? (
        <div className="grid gap-5 md:grid-cols-2">{[0, 1].map((i) => <Skeleton key={i} className="aspect-video" />)}</div>
      ) : items.length === 0 ? (
        <Empty
          title="No slides yet"
          text="The website is currently showing 3 built-in sample slides. Add your own slide (ideally a real photo of the salon) and it will replace them."
          action={<button className="btn-primary" onClick={() => setEditing("new")}><Plus className="size-4" /> Add first slide</button>}
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
