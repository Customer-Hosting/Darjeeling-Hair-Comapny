"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  Package,
  PackageCheck,
  PackageX,
  Pencil,
  Plus,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ImportSamplesButton } from "@/components/admin/ImportSamples";
import { CategoryManager, type CategoryRow as SharedCategoryRow } from "@/components/admin/CategoryManager";
import { ConfirmDialog, Empty, Field, IconBtn, ImagePicker, Modal, PageTitle, Skeleton, Switch } from "@/components/admin/ui";
import { compressImage } from "@/lib/compress-image";
import { DEFAULT_BRAND } from "@/lib/defaults";
import type { Product, ProductCategory } from "@/lib/types";
import { cn } from "@/lib/cn";

type CategoryRow = ProductCategory & SharedCategoryRow;
type Draft = Omit<Product, "id" | "slug" | "imageUrl" | "customImage">;

const blankDraft = (categoryId: string, order: number): Draft => ({
  name: "",
  categoryId,
  brand: DEFAULT_BRAND,
  size: "",
  price: "",
  description: "",
  featured: false,
  inStock: true,
  active: true,
  order,
});

function draftOf(p: Product): Draft {
  return {
    name: p.name,
    categoryId: p.categoryId,
    brand: p.brand,
    size: p.size,
    price: p.price,
    description: p.description,
    featured: p.featured,
    inStock: p.inStock,
    active: p.active,
    order: p.order,
  };
}

function toForm(d: Draft, file?: File | null, removeImage = false) {
  const fd = new FormData();
  Object.entries(d).forEach(([k, v]) => fd.append(k, String(v)));
  if (file) fd.append("image", file);
  if (removeImage) fd.append("removeImage", "true");
  return fd;
}

export default function ProductsAdminPage() {
  const { api, toast } = useAdmin();
  const [tab, setTab] = useState<"products" | "categories">("products");
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);

  const load = useCallback(
    () =>
      Promise.all([api<Product[]>("/api/admin/products"), api<CategoryRow[]>("/api/admin/product-categories")])
        .then(([p, c]) => {
          setProducts(p);
          setCategories(c);
        })
        .catch((e: Error) => {
          setProducts((x) => x ?? []);
          setCategories((x) => x ?? []);
          toast(e.message, "error");
        }),
    [api, toast],
  );
  useEffect(() => {
    load();
  }, [load]);

  const loading = !products || !categories;

  return (
    <>
      <PageTitle
        title="Products"
        subtitle="Retail products shown on the website's Products page. Customers enquire via WhatsApp — no online checkout."
      />

      <div role="tablist" className="mb-6 inline-flex rounded-full border border-white/10 bg-ink-2 p-1">
        {(
          [
            ["products", `Products${products ? ` (${products.length})` : ""}`],
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
      ) : tab === "products" ? (
        <ProductsTab products={products} categories={categories} reload={load} goToCategories={() => setTab("categories")} />
      ) : (
        <CategoryManager
          endpoint="/api/admin/product-categories"
          categories={categories}
          reload={load}
          itemLabel="product"
          placeholder="Name, e.g. Conditioner"
          emptyText="Create categories like Shampoo, Hair Mask, Serum or Styling, then add products to them."
        />
      )}
    </>
  );
}

/* ────────────────────────────── Products tab ────────────────────────────── */

function ProductsTab({
  products,
  categories,
  reload,
  goToCategories,
}: {
  products: Product[];
  categories: CategoryRow[];
  reload: () => void;
  goToCategories: () => void;
}) {
  const { api, toast } = useAdmin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);

  const catName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const term = q.trim().toLowerCase();
  const list = products.filter(
    (p) =>
      (cat === "all" || p.categoryId === cat) &&
      (!term || [p.name, p.brand, catName.get(p.categoryId) ?? ""].some((v) => v.toLowerCase().includes(term))),
  );

  async function quick(p: Product, patch: Partial<Draft>, msg: string) {
    try {
      await api(`/api/admin/products/${p.id}`, { method: "PATCH", body: toForm({ ...draftOf(p), ...patch }) });
      toast(msg);
      reload();
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }

  if (!products.length) {
    return (
      <>
        <Empty
          title="No products yet"
          text="The website is currently showing a sample L'Oréal Professionnel catalogue. Import it to edit names, sizes, prices and photos — or add your real products from scratch."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <ImportSamplesButton onDone={reload} label="Import sample products" />
              <button className="btn-ghost" disabled={!categories.length} onClick={() => setEditing("new")}>
                <Plus className="size-4" /> Add manually
              </button>
            </div>
          }
        />
        {!categories.length && (
          <p className="mt-3 text-center text-xs text-white/50">
            To add products manually, first{" "}
            <button className="cursor-pointer text-rose underline" onClick={goToCategories}>create a category</button>.
          </p>
        )}
        <ProductForm target={editing} categories={categories} nextOrder={0} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); reload(); }} />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35" />
          <input className="field !pl-11" placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
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
          <Plus className="size-4" /> Add product
        </button>
      </div>

      <ul className="space-y-3">
        {list.map((p) => (
          <li key={p.id} className={cn("flex items-center gap-4 rounded-2xl border border-white/10 bg-ink-2 p-3 pr-4", !p.active && "opacity-55")}>
            <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-ink-3">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.imageUrl} alt="" className="size-full object-cover" />
              ) : (
                <Package className="absolute top-1/2 left-1/2 size-7 -translate-x-1/2 -translate-y-1/2 text-white/25" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate font-semibold">{p.name}</p>
                {p.featured && <Star className="size-3.5 fill-champagne text-champagne" />}
                {!p.inStock && <span className="rounded-full bg-blush/10 px-2 py-0.5 text-[10px] font-semibold text-blush">Out of stock</span>}
                {!p.active && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px]">Hidden</span>}
                {p.imageUrl && !p.customImage && <span className="rounded-full bg-champagne/15 px-2 py-0.5 text-[10px] text-champagne">Sample photo</span>}
              </div>
              <p className="text-xs text-white/50">
                {catName.get(p.categoryId) ?? "No category"} · {p.brand || "No brand"}
                {p.size && ` · ${p.size}`} · {p.price || "No price"}
              </p>
              <p className="mt-1 line-clamp-1 hidden text-sm text-muted sm:block">{p.description}</p>
            </div>
            <div className="flex shrink-0 flex-wrap justify-end gap-1">
              <IconBtn label={p.featured ? "Remove bestseller badge" : "Mark as bestseller"} onClick={() => quick(p, { featured: !p.featured }, p.featured ? "Bestseller badge removed" : "Marked as bestseller")}>
                <Star className={cn("size-4", p.featured && "fill-champagne text-champagne")} />
              </IconBtn>
              <IconBtn label={p.inStock ? "Mark out of stock" : "Mark in stock"} onClick={() => quick(p, { inStock: !p.inStock }, p.inStock ? "Marked out of stock" : "Back in stock")}>
                {p.inStock ? <PackageCheck className="size-4 text-emerald" /> : <PackageX className="size-4 text-blush" />}
              </IconBtn>
              <IconBtn label={p.active ? "Hide from website" : "Show on website"} onClick={() => quick(p, { active: !p.active }, p.active ? "Product hidden" : "Product is live")}>
                {p.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </IconBtn>
              <IconBtn label="Edit" onClick={() => setEditing(p)}><Pencil className="size-4" /></IconBtn>
              <IconBtn label="Delete" danger onClick={() => setDeleting(p)}><Trash2 className="size-4" /></IconBtn>
            </div>
          </li>
        ))}
        {list.length === 0 && <p className="py-10 text-center text-sm text-muted">No products match your search.</p>}
      </ul>

      <ProductForm
        target={editing}
        categories={categories}
        nextOrder={products.length}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          reload();
        }}
      />
      <ConfirmDialog
        open={!!deleting}
        title="Delete product?"
        message={`"${deleting?.name}" and its photo will be permanently removed from the website.`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await api(`/api/admin/products/${deleting!.id}`, { method: "DELETE" });
            toast("Product deleted");
            reload();
          } catch (e) {
            toast((e as Error).message, "error");
          }
        }}
      />
    </>
  );
}

function ProductForm({
  target,
  categories,
  nextOrder,
  onClose,
  onSaved,
}: {
  target: Product | "new" | null;
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

  // reset when a different product is opened (render-phase update)
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
      const img = file ? await compressImage(file, 1400) : null;
      await api(isNew ? "/api/admin/products" : `/api/admin/products/${existing!.id}`, {
        method: isNew ? "POST" : "PATCH",
        body: toForm(d, img, removeImage && !img),
      });
      toast(isNew ? "Product added" : "Product updated");
      onSaved();
    } catch (err) {
      toast((err as Error).message.replace(/^\w+: /, ""), "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={!!target} onClose={() => !busy && onClose()} title={isNew ? "Add product" : "Edit product"} wide>
      <form onSubmit={save} className="grid gap-5 md:grid-cols-[220px_1fr]">
        <div className="space-y-2">
          <span className="label">Photo</span>
          <ImagePicker
            value={file}
            onChange={(f) => {
              setFile(f);
              setRemoveImage(false);
            }}
            existingUrl={removeImage ? null : existing?.imageUrl}
            aspect="aspect-square"
            hint="Square photos work best"
          />
          {existing && !existing.customImage && !file && existing.imageUrl && (
            <p className="text-[11px] leading-snug text-white/45">Showing a sample photo. Upload a real product photo to replace it.</p>
          )}
          {(file || (existing?.customImage && !removeImage)) && (
            <button type="button" className="cursor-pointer text-xs text-rose hover:underline" onClick={() => { setFile(null); setRemoveImage(true); }}>
              Remove uploaded photo
            </button>
          )}
        </div>
        <div className="space-y-4">
          <Field label="Product name *">
            <input required maxLength={100} className="field" placeholder="e.g. Absolut Repair Shampoo" value={d.name} onChange={(e) => set("name", e.target.value)} />
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
            <Field label="Brand">
              <input maxLength={60} className="field" value={d.brand} onChange={(e) => set("brand", e.target.value)} />
            </Field>
            <Field label="Size">
              <input maxLength={40} className="field" placeholder="e.g. 300 ml" value={d.size} onChange={(e) => set("size", e.target.value)} />
            </Field>
            <Field label="Price">
              <input maxLength={60} className="field" placeholder="e.g. ₹ 850 or Ask in salon" value={d.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={3} maxLength={600} className="field resize-none" value={d.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Display order">
              <input type="number" min={0} className="field" value={d.order} onChange={(e) => set("order", Number(e.target.value))} />
            </Field>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <Switch checked={d.inStock} onChange={(v) => set("inStock", v)} label="In stock" />
            <Switch checked={d.featured} onChange={(v) => set("featured", v)} label="Bestseller badge" />
            <Switch checked={d.active} onChange={(v) => set("active", v)} label="Visible on website" />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-white/10 pt-5 md:col-span-2">
          <button type="button" className="btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy && <Loader2 className="size-4 animate-spin" />} {isNew ? "Add product" : "Save changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
