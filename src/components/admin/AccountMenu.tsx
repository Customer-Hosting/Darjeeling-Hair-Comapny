"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAdmin } from "./AdminProvider";
import { cn } from "@/lib/cn";

export function initialsOf(name: string | null | undefined, email: string | null | undefined) {
  const src = (name || email || "A").trim();
  const parts = src.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (name && parts[1] ? parts[1][0] : "")).toUpperCase();
}

/** Avatar button in the admin top bar with a Profile / Sign out dropdown. */
export function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { user, signOut } = useAdmin();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const name = user?.displayName || "Super Admin";
  const email = user?.email ?? "";
  const initials = initialsOf(user?.displayName, email);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-full border border-white/10 bg-ink-2 py-1 pr-3 pl-1 transition hover:border-rose/40",
          open && "border-rose/50",
        )}
      >
        <span className="grid size-8 place-items-center rounded-full bg-rose text-xs font-bold text-ink">{initials}</span>
        {!compact && (
          <span className="hidden max-w-40 text-left leading-tight sm:block">
            <span className="block truncate text-sm font-semibold">{name}</span>
            <span className="block truncate text-[11px] text-white/50">{email}</span>
          </span>
        )}
        <ChevronDown className={cn("size-4 text-white/50 transition", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl border border-white/10 bg-ink-2 shadow-[0_24px_60px_-20px_rgba(42,29,23,.35)]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 p-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-rose text-sm font-bold text-ink">{initials}</span>
              <div className="min-w-0">
                <p className="truncate font-semibold">{name}</p>
                <p className="truncate text-xs text-white/55">{email}</p>
                <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-emerald">
                  <ShieldCheck className="size-3" /> Super Admin
                </p>
              </div>
            </div>
            <div className="p-1.5">
              <Link
                role="menuitem"
                href="/admin/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition hover:bg-white/5"
              >
                <UserRound className="size-4 text-rose" /> Profile & password
              </Link>
              <button
                role="menuitem"
                type="button"
                disabled={signingOut}
                onClick={async () => {
                  setSigningOut(true);
                  await signOut();
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-blush transition hover:bg-blush/10 disabled:opacity-60"
              >
                <LogOut className="size-4" /> {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
