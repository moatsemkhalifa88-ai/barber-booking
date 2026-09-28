import type { ReactNode } from "react";

/**
 * Isolates numbers, prices, dates, times, and booking references so they
 * stay in reading order (e.g. "12:00–13:00", not reversed) when embedded in
 * Hebrew/RTL surrounding text.
 */
export function Bidi({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={`inline-block ${className}`}>
      {children}
    </span>
  );
}
