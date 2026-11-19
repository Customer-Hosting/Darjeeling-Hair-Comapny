"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Mail, Phone, RefreshCw, Search, Trash2 } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { ConfirmDialog, Empty, IconBtn, PageTitle, Skeleton } from "@/components/admin/ui";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { WhatsAppIcon } from "@/components/icons/Brand";
import { BOOKING_STATUSES, type Booking, type BookingStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export default function BookingsAdminPage() {
  const { api, toast } = useAdmin();
  const [items, setItems] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState<Booking | null>(null);

  const load = useCallback(
    () => api<Booking[]>("/api/admin/bookings").then(setItems).catch((e: Error) => { setItems([]); toast(e.message, "error"); }),
    [api, toast],
  );
  useEffect(() => { load(); }, [load]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (items ?? []).filter(
      (b) =>
        (filter === "all" || b.status === filter) &&
        (!term || [b.name, b.phone, b.service, b.email].some((v) => v.toLowerCase().includes(term))),
    );
  }, [items, filter, q]);

  async function setStatus(b: Booking, status: BookingStatus) {
    setItems((xs) => xs?.map((x) => (x.id === b.id ? { ...x, status } : x)) ?? null);
    try {
      await api(`/api/admin/bookings/${b.id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      toast(`Marked as ${status}`);
    } catch (e) {
      toast((e as Error).message, "error");
      load();
    }
  }

  const waLink = (b: Booking) => {
    const digits = b.phone.replace(/\D/g, "");
    const num = digits.length === 10 ? `91${digits}` : digits;
    const msg = `Hi ${b.name.split(" ")[0]}, this is Darjeeling Hair Company. Your ${b.service} appointment on ${b.date} at ${b.time} is confirmed. See you soon!`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <>
      <PageTitle
        title="Bookings"
        subtitle="Appointment requests from the website. Call or WhatsApp to confirm, then update the status."
        action={<button className="btn-ghost" onClick={() => { setItems(null); load(); }}><RefreshCw className="size-4" /> Refresh</button>}
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-white/35" />
          <input className="field !pl-11" placeholder="Search name, phone, service…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(["all", ...BOOKING_STATUSES] as const).map((s) => {
            const n = s === "all" ? items?.length ?? 0 : items?.filter((b) => b.status === s).length ?? 0;
            return (
              <button key={s} onClick={() => setFilter(s)} className={cn("cursor-pointer rounded-full px-4 py-2 text-xs font-semibold capitalize transition", filter === s ? "bg-rose text-ink" : "bg-white/5 text-white/60 hover:text-white")}>
                {s} <span className="opacity-60">{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {!items ? (
        <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : items.length === 0 ? (
        <Empty title="No bookings yet" text="When customers request an appointment on the Contact page, it will appear here." />
      ) : list.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No bookings match this filter.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((b) => (
            <li key={b.id} className="rounded-2xl border border-white/10 bg-ink-2 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display text-lg font-bold">{b.name}</p>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="mt-1 text-sm text-rose-soft">{b.service}</p>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-white/65">
                    <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-emerald" /> {b.date} · {b.time}</span>
                    <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-white"><Phone className="size-4 text-champagne" /> {b.phone}</a>
                    {b.email && <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 hover:text-white"><Mail className="size-4 text-rose" /> {b.email}</a>}
                  </div>
                  {b.message && <p className="mt-3 rounded-xl bg-white/[0.03] px-3 py-2 text-sm text-white/70">“{b.message}”</p>}
                  <p className="mt-3 text-[11px] text-white/35">Received {b.createdAt ? new Date(b.createdAt).toLocaleString() : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Status"
                    className="field !w-auto !rounded-full !py-2 !text-xs capitalize"
                    value={b.status}
                    onChange={(e) => setStatus(b, e.target.value as BookingStatus)}
                  >
                    {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <a href={waLink(b)} target="_blank" rel="noreferrer" title="Confirm on WhatsApp" aria-label="Confirm on WhatsApp" className="grid size-9 place-items-center rounded-full border border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10">
                    <WhatsAppIcon className="size-4" />
                  </a>
                  <IconBtn label="Delete" danger onClick={() => setDeleting(b)}><Trash2 className="size-4" /></IconBtn>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!deleting}
        title="Delete booking?"
        message={`The booking request from ${deleting?.name} will be permanently deleted.`}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          try {
            await api(`/api/admin/bookings/${deleting!.id}`, { method: "DELETE" });
            toast("Booking deleted");
            load();
          } catch (e) {
            toast((e as Error).message, "error");
          }
        }}
      />
    </>
  );
}
