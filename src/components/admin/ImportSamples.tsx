"use client";

import { useState } from "react";
import { DatabaseZap, Loader2 } from "lucide-react";
import { useAdmin } from "./AdminProvider";
import { cn } from "@/lib/cn";

type Report = {
  hero: number;
  services: number;
  gallery: number;
  productCategories: number;
  products: number;
  settings: boolean;
  skipped: string[];
};

/**
 * Imports the website's built-in sample content (hero slides, services with
 * photos, gallery photos, contact settings) into MongoDB. Only empty sections
 * are filled, so it never duplicates or overwrites the admin's own content.
 */
export function ImportSamplesButton({
  onDone,
  className,
  label = "Import sample content",
}: {
  onDone?: () => void;
  className?: string;
  label?: string;
}) {
  const { api, toast } = useAdmin();
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      const r = await api<Report>("/api/admin/seed", { method: "POST" });
      const parts = [
        r.hero && `${r.hero} hero slides`,
        r.services && `${r.services} services`,
        r.gallery && `${r.gallery} gallery photos`,
        r.products && `${r.products} products`,
        r.productCategories && `${r.productCategories} product categories`,
        r.settings && "contact settings",
      ].filter(Boolean);
      toast(parts.length ? `Imported ${parts.join(", ")} — you can now edit them.` : "Nothing to import — your content is already in the database.");
      onDone?.();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button type="button" onClick={run} disabled={busy} className={cn("btn-primary", className)}>
      {busy ? <Loader2 className="size-4 animate-spin" /> : <DatabaseZap className="size-4" />}
      {busy ? "Importing… (uploading photos)" : label}
    </button>
  );
}
