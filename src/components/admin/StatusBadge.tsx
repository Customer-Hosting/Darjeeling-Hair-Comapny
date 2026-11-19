import type { BookingStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const STYLES: Record<BookingStatus, string> = {
  pending: "bg-champagne/15 text-champagne ring-champagne/30",
  confirmed: "bg-emerald/15 text-emerald ring-emerald/30",
  completed: "bg-white/10 text-white/70 ring-white/20",
  cancelled: "bg-rose/15 text-rose-soft ring-rose/30",
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1", STYLES[status])}>
      {status}
    </span>
  );
}
