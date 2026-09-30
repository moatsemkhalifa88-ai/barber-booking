export const SHOP_TIMEZONE = "Asia/Jerusalem";

// 0 = Sunday ... 6 = Saturday, matching working_hours.day_of_week and the
// database's EXTRACT(DOW) convention.
export const BOOKABLE_DAYS_OF_WEEK = [0, 1, 2, 3, 4] as const;

// Candidate appointment start times. A given slot is only offered for a
// service if the service's duration fits before closing time.
export const TIME_SLOTS = [
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
] as const;

export const SHOP_OPEN_TIME = "12:00";
export const SHOP_CLOSE_TIME = "22:00";

/** Sent as `barberId` when the customer picks "Any available barber"; the server assigns one. */
export const ANY_BARBER = "any";
