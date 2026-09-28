import type { Barber } from "@/types";

export const barbers: Barber[] = [
  {
    id: "moatsem",
    name: "Moatsem",
    role: "Owner & Lead Barber",
    bio: "Founder of MOATSEM. Over a decade of precision cutting and a personal hand in every signature style the shop is known for.",
    image: "/images/barbers/moatsem.jpg",
    isLead: true,
  },
  {
    id: "amir",
    name: "Amir",
    role: "Professional Barber",
    bio: "Sharp fades and clean lines, delivered with a calm, detail-first approach every time.",
    image: "/images/barbers/amir.jpg",
  },
  {
    id: "ibrahim",
    name: "Ibrahim",
    role: "Professional Barber",
    bio: "Known for modern textured cuts and a relaxed, welcoming chairside manner.",
    image: "/images/barbers/ibrahim.jpg",
  },
];
