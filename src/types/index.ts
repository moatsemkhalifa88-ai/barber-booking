export type DayId =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface DayHours {
  day: DayId;
  label: string;
  shortLabel: string;
  isOpen: boolean;
  opens?: string;
  closes?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceIls: number;
  image: string;
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  /** CSS object-position for the portrait crop; defaults to "center". */
  imagePosition?: string;
  isLead?: boolean;
}
