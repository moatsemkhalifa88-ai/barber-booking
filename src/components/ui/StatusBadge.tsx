import type { SlotAvailabilityStatus } from "@/types/booking";

const statusStyles: Record<SlotAvailabilityStatus, string> = {
  available: "bg-success-soft text-success",
  booked: "bg-surface-2 text-disabled-fg",
  unavailable: "bg-surface-2 text-disabled-fg",
};

/** Status pill: a dot plus text, so the state never relies on colour alone. */
export function StatusBadge({ status, label }: { status: SlotAvailabilityStatus; label: string }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold ${statusStyles[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </span>
  );
}
