import { randomInt } from "crypto";

// Unambiguous uppercase alphabet: no 0/O or 1/I.
const REFERENCE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Generates a booking reference like "MOA-7K4P9X2Q". Not a secret by itself
 * — it must be paired with the customer's email to look up or cancel a
 * booking — but it is high-entropy enough to resist guessing. */
export function generateBookingReference(): string {
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += REFERENCE_ALPHABET[randomInt(REFERENCE_ALPHABET.length)];
  }
  return `MOA-${code}`;
}
