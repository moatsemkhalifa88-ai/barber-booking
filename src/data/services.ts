import type { Service } from "@/types";

export const services: Service[] = [
  {
    id: "mens-haircut",
    name: "Men's Haircut",
    description:
      "A precision cut tailored to your face shape and style, finished with a sharp lineup.",
    durationMinutes: 45,
    priceIls: 50,
    image: "/images/services/mens-haircut.jpg",
  },
  {
    id: "kids-haircut",
    name: "Kids' Haircut",
    description:
      "A patient, friendly cut for younger guests, in a comfortable and welcoming chair.",
    durationMinutes: 30,
    priceIls: 30,
    image: "/images/services/kids-haircut.jpg",
  },
  {
    id: "facial-treatment",
    name: "Facial Treatment",
    description:
      "A refreshing grooming treatment that leaves skin clean, calm, and revitalized.",
    durationMinutes: 30,
    priceIls: 100,
    image: "/images/services/facial-treatment.jpg",
  },
];
