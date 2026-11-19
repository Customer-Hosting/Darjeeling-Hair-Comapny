"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, FolderPlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useAdmin } from "./AdminProvider";
import { ConfirmDialog, Empty, IconBtn } from "./ui";
import { CategoryIcon, CATEGORY_ICON_LABELS } from "@/components/icons/CategoryIcon";
import { CATEGORY_ICONS, type CategoryIcon as IconKey } from "@/lib/types";
import { cn } from "@/lib/cn";

export type CategoryRow = {
  id: string;
  name: string;
  description: string;
  order: number;
  itemCount: number;
  icon?: IconKey;
};

type Props = {
  /** e.g. "/api/admin/service-categories" */
  endpoint: string;
  categories: CategoryRow[];
  reload: () => void;
  /** singular noun for the things inside a category, e.g. "service" */
  itemLabel: string;
  /** show the icon picker (service categories) */
  withIcon?: boolean;
  placeholder?: string;
  emptyText?: string;
};

function IconSelect({ value, onChange, id }: { value: IconKey; onChange: (v: IconKey) => void; id?: string }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-rose">
        <CategoryIcon icon={value} className="size-4" />
      </span>
      <select id={id} aria-label="Icon" className="field !pl-10" value={value} onChange={(e) => onChange(e.target.value as IconKey)}>
        {CATEGORY_ICONS.map((ic) => (
          <option key={ic} value={ic}>{CATEGORY_ICON_LABELS[ic]}</option>
        ))}
      </select>
    </div>
  );
}

/** Add / rename / reorder / delete categories — shared by Services and Products. */
export function CategoryManager({ endpoint, categories, reload, itemLabel, withIcon, placeholder, emptyText }: Props) {
  const { api, toast } = useAdmin();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState<IconKey>("scissors");
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);

  const body = (c: { name: string; description: string; order: number; icon?: IconKey }) =>
    JSON.stringify(withIcon ? c : { name: c.name, description: c.description, order: c.order });

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAdding(true);
    try {
      await api(endpoint, { method: "POST", body: body({ name, description, order: categories.length, icon }) });
      setName("");
      setDescription("");
      setIcon("scissors");
      toast("Category added");
      reload();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setAdding(false);
    }
  }

  async function swap(i: number, dir: -1 | 1) {
    const a = categories[i];
    const b = categories[i + dir];
    if (!a || !b) return;
    try {
      // normalise order to list position, then swap the pair
      await Promise.all([
        api(`${endpoint}/${a.id}`, { method: "PATCH", body: body({ ...a, order: i + dir }) }),
        api(`${endpoint}/${b.id}`, { method: "PATCH", body: body({ ...b, order: i }) }),
      ]);
      reload();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="rounded-3xl border border-white/10 bg-ink-2 p-6">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <FolderPlus className="size-5 text-rose" /> Add a category
        </h2>
        <div className={cn("mt-4 grid gap-3", withIcon ? "md:grid-cols-[1fr_11rem_2fr_auto]" : "md:grid-cols-[1fr_2fr_auto]")}>
          <input className="field" maxLength={60} placeholder={placeholder ?? "Category name"} value={name} onChange={(e) => setName(e.target.value)} aria-label="Category name" />
          {withIcon && <IconSelect value={icon} onChange={setIcon} />}
          <input className="field" maxLength={200} placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Category description" />
          <button type="submit" className="btn-primary" disabled={adding || !name.trim()}>
            {adding ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add
          </button>
        </div>
      </form>

      {categories.length === 0 ? (
        <Empty title="No categories yet" text={emptyText ?? `Create categories, then add ${itemLabel}s to them.`} />
      ) : (
        <ul className="space-y-3">
          {categories.map((c, i) => (
            <CategoryItem
              key={`${c.id}-${c.order}-${c.name}`}
              c={c}
              endpoint={endpoint}
              itemLabel={itemLabel}
              withIcon={withIcon}
              first={i === 0}
              last={i === categories.length - 1}
              onMove={(dir) => swap(i, dir)}
              onDelete={() => setDeleting(c)}
              onSaved={reload}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete category?"
        message={`The "${deleting?.name}" category will be removed from the website.`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await api(`${endpoint}/${deleting!.id}`, { method: "DELETE" });
            toast("Category deleted");
            reload();
          } catch (e) {
            toast((e as Error).message, "error");
          }
        }}
      />
    </div>
  );
}

function CategoryItem({
  c,
  endpoint,
  itemLabel,
  withIcon,
  first,
  last,
  onMove,
  onDelete,
  onSaved,
}: {
  c: CategoryRow;
  endpoint: string;
  itemLabel: string;
  withIcon?: boolean;
  first: boolean;
  last: boolean;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onSaved: () => void;
}) {
  const { api, toast } = useAdmin();
  const [name, setName] = useState(c.name);
  const [description, setDescription] = useState(c.description);
  const [icon, setIcon] = useState<IconKey>(c.icon ?? "scissors");
  const [busy, setBusy] = useState(false);
  const dirty = name.trim() !== c.name || description.trim() !== c.description || (withIcon && icon !== c.icon);

  async function save() {
    setBusy(true);
    try {
      const payload = withIcon ? { name, description, order: c.order, icon } : { name, description, order: c.order };
      await api(`${endpoint}/${c.id}`, { method: "PATCH", body: JSON.stringify(payload) });
      toast("Category updated");
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  const plural = c.itemCount === 1 ? itemLabel : `${itemLabel}s`;

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-ink-2 p-4 lg:flex-row lg:items-center">
      <div className={cn("grid flex-1 gap-2", withIcon ? "md:grid-cols-[1fr_11rem_2fr]" : "md:grid-cols-[1fr_2fr]")}>
        <input className="field" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} aria-label="Category name" />
        {withIcon && <IconSelect value={icon} onChange={setIcon} />}
        <input className="field" maxLength={200} placeholder="Short description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Category description" />
      </div>
      <div className="flex shrink-0 items-center justify-end gap-1">
        <span className="mr-2 rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/60">
          {c.itemCount} {plural}
        </span>
        {dirty && (
          <button type="button" className="btn-primary !px-4 !py-2 text-xs" disabled={busy || !name.trim()} onClick={save}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Save
          </button>
        )}
        <IconBtn label="Move up" onClick={() => !first && onMove(-1)}>
          <ArrowUp className={cn("size-4", first && "opacity-30")} />
        </IconBtn>
        <IconBtn label="Move down" onClick={() => !last && onMove(1)}>
          <ArrowDown className={cn("size-4", last && "opacity-30")} />
        </IconBtn>
        <IconBtn
          label={c.itemCount ? `Move or delete its ${plural} first` : "Delete category"}
          danger
          onClick={() => (c.itemCount ? toast(`Move or delete the ${c.itemCount} ${plural} in “${c.name}” first.`, "error") : onDelete())}
        >
          <Trash2 className="size-4" />
        </IconBtn>
      </div>
    </li>
  );
}
