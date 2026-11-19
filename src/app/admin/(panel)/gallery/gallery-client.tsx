"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Loader2, Pencil, Trash2, Upload, X } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ImportSamplesButton } from "@/components/admin/ImportSamples";
import { ConfirmDialog, Empty, Field, IconBtn, Modal, PageTitle, Skeleton } from "@/components/admin/ui";
import { compressImage } from "@/lib/compress-image";
import { GALLERY_CATEGORIES, type GalleryCategory, type GalleryItem } from "@/lib/types";
import { cn } from "@/lib/cn";

export default function GalleryAdminPage() {
  const { api, toast } = useAdmin();
  const [items, setItems] = useState<GalleryItem[] | null>(null);
  const [cat, setCat] = useState("All");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<GalleryItem | null>(null);

  const load = useCallback(
    () => api<GalleryItem[]>("/api/admin/gallery").then(setItems).catch((e: Error) => { setItems([]); toast(e.message, "error"); }),
    [api, toast],
  );
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => (items ?? []).filter((i) => cat === "All" || i.category === cat), [items, cat]);

  return (
    <>
      <PageTitle
        title="Gallery"
        subtitle="Upload several photos at once. Newest appear first unless you set an order."
        action={<button className="btn-primary" onClick={() => setUploading(true)}><Upload className="size-4" /> Upload photos</button>}
      />

      {items && items.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {["All", ...GALLERY_CATEGORIES].map((c) => {
            const n = c === "All" ? items.length : items.filter((i) => i.category === c).length;
            return (
              <button key={c} onClick={() => setCat(c)} className={cn("cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition", cat === c ? "bg-rose text-ink" : "bg-white/5 text-white/60 hover:text-white")}>
                {c} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
      )}

      {!items ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <Skeleton key={i} className="aspect-square" />)}</div>
      ) : items.length === 0 ? (
        <Empty
          title="No photos uploaded yet"
          text="The website is currently showing 18 built-in sample photos. Import them to manage them here, or upload your own salon work."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ImportSamplesButton onDone={load} label="Import sample photos" />
              <button className="btn-ghost" onClick={() => setUploading(true)}><ImagePlus className="size-4" /> Upload your own</button>
            </div>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((it) => (
            <figure key={it.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-ink-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.imageUrl} alt={it.caption} loading="lazy" className="size-full object-cover transition duration-500 group-hover:scale-105" />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 to-transparent p-3 pt-10">
                <p className="text-[10px] font-semibold tracking-[0.15em] text-rose uppercase">{it.category}</p>
                {it.caption && <p className="truncate text-xs">{it.caption}</p>}
              </figcaption>
              <div className="absolute top-2 right-2 flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
                <span className="rounded-full bg-ink/80 backdrop-blur"><IconBtn label="Edit" onClick={() => setEditing(it)}><Pencil className="size-3.5" /></IconBtn></span>
                <span className="rounded-full bg-ink/80 backdrop-blur"><IconBtn label="Delete" danger onClick={() => setDeleting(it)}><Trash2 className="size-3.5" /></IconBtn></span>
              </div>
            </figure>
          ))}
        </div>
      )}

      <UploadModal open={uploading} onClose={() => setUploading(false)} onDone={() => { setUploading(false); load(); }} />
      <EditModal item={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      <ConfirmDialog
        open={!!deleting}
        title="Delete photo?"
        message="This photo will be permanently removed from the gallery."
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await api(`/api/admin/gallery/${deleting!.id}`, { method: "DELETE" });
            toast("Photo deleted");
            load();
          } catch (e) {
            toast((e as Error).message, "error");
          }
        }}
      />
    </>
  );
}

function UploadModal({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const { api, toast } = useAdmin();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState<GalleryCategory>("Haircuts");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  // Object URLs for previews; revoked when the file list changes
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  // Start fresh each time the modal opens
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) { setFiles([]); setCaption(""); }
  }

  const add = (list: FileList | null) => {
    if (!list) return;
    const imgs = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((f) => [...f, ...imgs].slice(0, 20));
  };

  async function upload() {
    if (!files.length) return toast("Choose at least one photo", "error");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("category", category);
      fd.append("caption", caption);
      for (const f of files) fd.append("images", await compressImage(f, 1800));
      const r = await api<{ count: number }>("/api/admin/gallery", { method: "POST", body: fd });
      toast(`${r.count} photo${r.count > 1 ? "s" : ""} uploaded`);
      onDone();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title="Upload photos" wide>
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }}
          className={cn("flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-10 transition", drag ? "border-rose bg-rose/10" : "border-white/15 hover:border-white/35")}
        >
          <ImagePlus className="size-8 text-white/50" />
          <span className="text-sm font-semibold">Click or drop photos here</span>
          <span className="text-xs text-white/40">Up to 20 at a time · auto-optimised</span>
        </button>
        <input ref={input} type="file" multiple accept="image/*" className="hidden" onChange={(e) => { add(e.target.files); e.target.value = ""; }} />

        {previews.length > 0 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {previews.map((u, i) => (
              <div key={u} className="relative aspect-square overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u} alt="" className="size-full object-cover" />
                <button type="button" aria-label="Remove" onClick={() => setFiles((f) => f.filter((_, j) => j !== i))} className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-ink/80">
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <select className="field" value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)}>
              {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Caption (optional, applies to all)"><input className="field" maxLength={140} value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-5">
          <button className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn-primary" onClick={upload} disabled={busy || !files.length}>
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload {files.length || ""}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function EditModal({ item, onClose, onSaved }: { item: GalleryItem | null; onClose: () => void; onSaved: () => void }) {
  const { api, toast } = useAdmin();
  const [caption, setCaption] = useState("");
  const [category, setCategory] = useState<GalleryCategory>("Haircuts");
  const [order, setOrder] = useState(0);
  const [busy, setBusy] = useState(false);

  const [prevItem, setPrevItem] = useState(item);
  if (item !== prevItem) {
    setPrevItem(item);
    if (item) { setCaption(item.caption); setCategory(item.category); setOrder(item.order); }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api(`/api/admin/gallery/${item!.id}`, { method: "PATCH", body: JSON.stringify({ caption, category, order }) });
      toast("Photo updated");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!item} onClose={() => !busy && onClose()} title="Edit photo">
      {item && (
        <form onSubmit={save} className="space-y-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.imageUrl} alt="" className="max-h-64 w-full rounded-2xl object-cover" />
          <Field label="Caption"><input className="field" maxLength={140} value={caption} onChange={(e) => setCaption(e.target.value)} /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category">
              <select className="field" value={category} onChange={(e) => setCategory(e.target.value as GalleryCategory)}>
                {GALLERY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Order (0 = newest first)"><input type="number" min={0} className="field" value={order} onChange={(e) => setOrder(Number(e.target.value))} /></Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-white/10 pt-5">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={busy}>{busy && <Loader2 className="size-4 animate-spin" />} Save</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
