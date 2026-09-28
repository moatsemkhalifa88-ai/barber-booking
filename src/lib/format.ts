/** Formats an ILS amount as "₪50" or "₪49.90" — no trailing ".00" for whole numbers. */
export function formatPrice(priceIls: number): string {
  const amount = Number.isInteger(priceIls) ? String(priceIls) : priceIls.toFixed(2);
  return `₪${amount}`;
}
