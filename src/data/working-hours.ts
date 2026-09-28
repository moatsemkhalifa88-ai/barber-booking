import type { DayHours, DayId } from "@/types";

export const bookableDays: DayId[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
];

const OPEN_TIME = "12:00 PM";
const CLOSE_TIME = "10:00 PM";

export const weekHours: DayHours[] = [
  { day: "sunday", label: "Sunday", shortLabel: "Sun", isOpen: true, opens: OPEN_TIME, closes: CLOSE_TIME },
  { day: "monday", label: "Monday", shortLabel: "Mon", isOpen: true, opens: OPEN_TIME, closes: CLOSE_TIME },
  { day: "tuesday", label: "Tuesday", shortLabel: "Tue", isOpen: true, opens: OPEN_TIME, closes: CLOSE_TIME },
  { day: "wednesday", label: "Wednesday", shortLabel: "Wed", isOpen: true, opens: OPEN_TIME, closes: CLOSE_TIME },
  { day: "thursday", label: "Thursday", shortLabel: "Thu", isOpen: true, opens: OPEN_TIME, closes: CLOSE_TIME },
  { day: "friday", label: "Friday", shortLabel: "Fri", isOpen: false },
  { day: "saturday", label: "Saturday", shortLabel: "Sat", isOpen: false },
];

export const bookableWeekHours: DayHours[] = weekHours.filter((day) =>
  bookableDays.includes(day.day),
);
