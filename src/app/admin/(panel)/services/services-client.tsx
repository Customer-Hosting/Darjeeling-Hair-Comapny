"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Loader2, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ImportSamplesButton } from "@/components/admin/ImportSamples";
import { CategoryManager, type CategoryRow } from "@/components/admin/CategoryManager";
import { ConfirmDialog, Empty, Field, IconBtn, ImagePicker, Modal, PageTitle, Skeleton, Switch } from "@/components/admin/ui";
import { CategoryIcon } from "@/components/icons/CategoryIcon";
import { compressImage } from "@/lib/compress-image";
import type { Service } from "@/lib/types";
import { cn } from "@/lib/cn";

type Draft = Pick<Service, "title" | "categoryId" | "description" | "price" | "duration" | "featured" | "active" | "order">;

const blankDraft = (categoryId: string, order: number): Draft => ({
  title: "",
  categoryId,
  description: "",
  price: "On consultation",
  duration: "",
  featured: false,
  active: true,
  order,
});

function toForm(d: Draft, file?: File | null, removeImage = false) {
  const fd = new FormData();
  Object.entries(d).forEach(([k, v]) => fd.append(k, String(v)));
  if (file) fd.append("image", file);
  if (removeImage) fd.append("removeImage", "true");
  return fd;
}

function draftOf(s: Service): Draft {
  return {
    title: s.title,
    categoryId: s.categoryId,
    description: s.description,
    price: s.price,
    duration: s.duration,
    featured: s.featured,
    active: s.active,
    order: s.order,
  };
}

export default function ServicesAdminPage() {
  const { api, toast } = useAdmin();
  const [tab, setTab] = useState<"services" | "categories">("services");
  const [items, setItems] = useState<Service[] | null>(null);
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);

  // categories are loaded first — that request also runs the one-time category migration
  const load = useCallback(
    () =>
      api<CategoryRow[]>("/api/admin/service-categories")
        .then((c) => api<Service[]>("/api/admin/services").then((s) => [c, s] as const))
        .then(([c, s]) => {
          setCategories(c);
          setItems(s);
        })
        .catch((e: Error) => {
          setItems((x) => x ?? []);
          setCategories((x) => x ?? []);
          toast(e.message, "error");
        }),
    [api, toast],
  );
  useEffect(() => {
    load();
  }, [load]);

  const loading = !items || !categories;

  return (
    <>
      <PageTitle
        title="Services"
        subtitle="Add, edit or remove services and their categories. Starred services appear on the home page."
      />

      <div role="tablist" className="mb-6 inline-flex rounded-full border border-white/10 bg-ink-2 p-1">
        {(
          [
            ["services", `Services${items ? ` (${items.length})` : ""}`],
            ["categories", `Categories${categories ? ` (${categories.length})` : ""}`],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn(
              "cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition",
              tab === key ? "bg-rose text-ink" : "text-white/60 hover:text-white",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : tab === "services" ? (
        <ServicesTab items={items} categories={categories} reload={load} goToCategories={() => setTab("categories")} />
      ) : (
        <CategoryManager
          endpoint="/api/admin/service-categories"
          categories={categories}
          reload={load}
          itemLabel="service"
          withIcon
          placeholder="Name, e.g. Bridal & Makeup"
          emptyText="Create categories like Cut & Style, Colour, Treatment or Texture, then add services to them."
        />
      )}
    </>
  );
}

/* ────────────────────────────── Services tab ────────────────────────────── */

function ServicesTab({
  items,
  categories,
  reload,
  goToCategories,
}: {
  items: Service[];
  categories: CategoryRow[];
  reload: () => void;
  goToCategories: () => void;
}) {
  const { api, toast } = useAdmin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Service | "new" | null>(null);
  const [deleting, setDeleting] = useState<Service | null>(null);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return items.filter((s) => (cat === "all" || s.categoryId === cat) && (!term || s.title.toLowerCase().includes(term)));
  }, [items, q, cat]);

  async function quick(s: Service, patch: Partial<Draft>, msg: string) {
    try {
      await api(`/api/admin/services/${s.id}`, { method: "PATCH", body: toForm({ ...draftOf(s), ...patch }) });
      toast(msg);
      reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  const form = (
    <ServiceForm
      target={editing}
      categories={categories}
      nextOrder={items.length}
      onClose={() => setEditing(null)}
      onSaved={() => {
        setEditing(null);
        reload();
      }}
    />
  );

  if (!items.length) {
    return (
      <>
        <Empty
          title="No services yet"
          text="The website is currently showing the built-in starter menu. Import it to edit prices, photos and descriptions (Haircut, Balayage, Nanoplastia, Hair Botox and more) — or create services from scratch."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ImportSamplesButton onDone={reload} label="Import starter services" />
              <button className="btn-ghost" disabled={!categories.length} onClick={() => setEditing("new")}>
                <Plus className="size-4" /> Add manually
              </button>
            </div>
          }
        />
        {!categories.length && (
          <p className="mt-3 text-center text-xs text-white/50">
            To add services manually, first{" "}
            <button className="cursor-pointer text-rose underline" onClick={goToCategories}>create a category</button>.
          </p>
        )}
        {form}
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35" />
          <input className="field !pl-11" placeholder="Search services…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[{ id: "all", name: "All" }, ...categories].map((c) => (
            <button
              key={c.id}
              onClick={() => setCat(c.id)}
              className={cn("cursor-pointer rounded-full px-4 py-2 text-xs font-semibold transition", cat === c.id ? "bg-rose text-ink" : "bg-white/5 text-white/60 hover:text-white")}
            >
              {c.name}
            </button>
          ))}
        </div>
        <button className="btn-primary shrink-0" onClick={() => setEditing("new")}>
          <Plus className="size-4" /> Add service
        </button>
      </div>

      <ul className="space-y-3">
        {list.map((s) => (
          <li key={s.id} className={cn("flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-2 p-3 pr-4", !s.active && "opacity-55")}>
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-3">
              {s.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="grid size-full place-items-center text-[10px] text-white/30">No photo</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold">{s.title}</p>
                {s.featured && <Star className="size-3.5 fill-champagne text-champagne" />}
                {!s.active && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">Hidden</span>}
                {s.imageUrl && !s.customImage && <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] text-champagne">Sample photo</span>}
              </div>
              <p className="flex flex-wrap items-center gap-1 text-xs text-white/50">
                <CategoryIcon icon={s.categoryIcon} className="size-3.5 text-rose" />
                {s.category} · {s.price || "No price"} {s.duration && `· ${s.duration}`} · order {s.order}
              </p>
              <p className="mt-1 line-clamp-1 hidden text-sm text-muted sm:block">{s.description}</p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              <IconBtn label={s.featured ? "Remove from home page" : "Feature on home page"} onClick={() => quick(s, { featured: !s.featured }, s.featured ? "Removed from home page" : "Featured on home page")}>
                <Star className={cn("size-4", s.featured && "fill-champagne text-champagne")} />
              </IconBtn>
              <IconBtn label={s.active ? "Hide" : "Show"} onClick={() => quick(s, { active: !s.active }, s.active ? "Service hidden" : "Service is live")}>
                {s.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </IconBtn>
              <IconBtn label="Edit" onClick={() => setEditing(s)}><Pencil className="size-4" /></IconBtn>
              <IconBtn label="Delete" danger onClick={() => setDeleting(s)}><Trash2 className="size-4" /></IconBtn>
            </div>
          </li>
        ))}
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted">No services match your search.</p>}
      </ul>

      {form}
      <ConfirmDialog
        open={!!deleting}
        title="Delete service?"
        message={`"${deleting?.title}" and its photo will be permanently removed from the website.`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await api(`/api/admin/services/${deleting!.id}`, { method: "DELETE" });
            toast("Service deleted");
            reload();
          } catch (e) {
            toast((e as Error).message, "error");
          }
        }}
      />
    </>
  );
}

function ServiceForm({
  target,
  categories,
  nextOrder,
  onClose,
  onSaved,
}: {
  target: Service | "new" | null;
  categories: CategoryRow[];
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { api, toast } = useAdmin();
  const [d, setD] = useState<Draft>(blankDraft("", 0));
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [busy, setBusy] = useState(false);
  const isNew = target === "new";
  const existing = target && target !== "new" ? target : null;

  // reset whenever a different service is opened (render-phase update)
  const [prevTarget, setPrevTarget] = useState(target);
  if (target !== prevTarget) {
    setPrevTarget(target);
    if (target) {
      setFile(null);
      setRemoveImage(false);
      setD(target === "new" ? blankDraft(categories[0]?.id ?? "", nextOrder) : draftOf(target));
    }
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!d.categoryId) return toast("Please choose a category", "error");
    setBusy(true);
    try {
      const img = file ? await compressImage(file, 1600) : null;
      await api(isNew ? "/api/admin/services" : `/api/admin/services/${existing!.id}`, {
        method: isNew ? "POST" : "PATCH",
        body: toForm(d, img, removeImage && !img),
      });
      toast(isNew ? "Service added" : "Service updated");
      onSaved();
    } catch (err) {
      toast((err as Error).message.replace(/^\w+: /, ""), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!target} onClose={() => !busy && onClose()} title={isNew ? "Add service" : "Edit service"} wide>
      <form onSubmit={save} className="grid gap-5 md:grid-cols-[240px_1fr]">
        <div className="space-y-2">
          <span className="label">Photo</span>
          <ImagePicker
            value={file}
            onChange={(f) => {
              setFile(f);
              setRemoveImage(false);
            }}
            existingUrl={removeImage ? null : existing?.imageUrl}
            aspect="aspect-[4/3]"
            hint="Optional · 4:3 works best"
          />
          {existing && !existing.customImage && !file && existing.imageUrl && (
            <p className="text-[11px] leading-snug text-white/45">Showing a sample photo. Upload your own to replace it.</p>
          )}
          {(file || (existing?.customImage && !removeImage)) && (
            <button type="button" className="cursor-pointer text-xs text-rose hover:underline" onClick={() => { setFile(null); setRemoveImage(true); }}>
              Remove uploaded photo
            </button>
          )}
        </div>
        <div className="space-y-4">
          <Field label="Service name *">
            <input required maxLength={100} className="field" value={d.title} onChange={(e) => set("title", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category *">
              <select className="field" value={d.categoryId} onChange={(e) => set("categoryId", e.target.value)}>
                {!d.categoryId && <option value="">Choose a category</option>}
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Display order">
              <input type="number" min={0} className="field" value={d.order} onChange={(e) => set("order", Number(e.target.value))} />
            </Field>
            <Field label="Price">
              <input maxLength={60} className="field" placeholder="₹ 500 onwards" value={d.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
            <Field label="Duration">
              <input maxLength={40} className="field" placeholder="45 min" value={d.duration} onChange={(e) => set("duration", e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={4} maxLength={600} className="field resize-none" value={d.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-6">
            <Switch checked={d.featured} onChange={(v) => set("featured", v)} label="Feature on home page" />
            <Switch checked={d.active} onChange={(v) => set("active", v)} label="Visible on website" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-5 md:col-span-2">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} {isNew ? "Add service" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
