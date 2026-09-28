import type { SlotAvailabilityStatus } from "@/types/booking";

const statusStyles: Record<SlotAvailabilityStatus, string> = {
  available: "border-gold/50 bg-gold/10 text-gold-light",
  booked: "border-line bg-charcoal-light text-muted",
  unavailable: "border-line bg-charcoal-light text-muted",
};

export function StatusBadge({ status, label }: { status: SlotAvailabilityStatus; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide uppercase ${statusStyles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === "available" ? "bg-gold" : "bg-muted"}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
