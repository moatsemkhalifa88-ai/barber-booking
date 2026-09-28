export const en = {
  meta: {
    title: "MOATSEM | Premium Barber Shop",
    description:
      "MOATSEM is a premium barber shop offering precision haircuts, kids' haircuts, and facial treatments. Book your chair with Moatsem, Amir, or Ibrahim.",
    manageBookingTitle: "Manage Booking | MOATSEM",
    manageBookingDescription: "Look up or cancel your MOATSEM appointment using your booking reference and email address.",
  },

  nav: {
    home: "Home",
    services: "Services",
    barbers: "Barbers",
    gallery: "Gallery",
    booking: "Booking",
    manageBooking: "Manage Booking",
    contact: "Contact",
    bookNow: "Book Now",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    primaryMenuLabel: "Primary",
    mobileMenuLabel: "Mobile",
    languageLabel: "Language",
    english: "EN",
    hebrew: "עברית",
  },

  logo: {
    ariaLabel: "MOATSEM — home",
  },

  hero: {
    badge: "Premium Barber Shop",
    titleLead: "Precision. Style.",
    titleHighlight: "Confidence.",
    subtitle:
      "MOATSEM is a premium barber shop built around meticulous craftsmanship and personal attention. Every cut, shave, and treatment is delivered to a single standard: exceptional.",
    ctaBook: "Book an Appointment",
    ctaServices: "Explore Services",
    statBarbersLabel: "Barbers",
    statBarbersValue: "3",
    statServicesLabel: "Services",
    statServicesValue: "3",
    statOpenDaysLabel: "Open Days",
    statOpenDaysValue: "Sun–Thu",
  },

  about: {
    eyebrow: "The MOATSEM Experience",
    title: "Grooming, treated as a craft.",
    description:
      "MOATSEM was built on a simple idea: a haircut is a personal experience, not a transaction. Led by owner and lead barber Moatsem, our team brings precision technique and genuine care to every appointment — so you leave looking sharp and feeling confident.",
    pillars: [
      { title: "Precision", description: "Every line, fade, and edge is measured, deliberate, and consistent." },
      { title: "Professionalism", description: "A calm, respectful chairside experience from arrival to finish." },
      { title: "Premium Care", description: "Quality tools, unhurried service, and attention to every detail." },
    ],
  },

  services: {
    eyebrow: "What We Offer",
    title: "Services",
    description: "A focused menu, each service delivered with full attention and precision.",
    minutesSuffix: "min",
    bookThisService: "Book This Service",
    items: {
      "mens-haircut": {
        name: "Men's Haircut",
        description: "A precision cut tailored to your face shape and style, finished with a sharp lineup.",
      },
      "kids-haircut": {
        name: "Kids' Haircut",
        description: "A patient, friendly cut for younger guests, in a comfortable and welcoming chair.",
      },
      "facial-treatment": {
        name: "Facial Treatment",
        description: "A refreshing grooming treatment that leaves skin clean, calm, and revitalized.",
      },
    } as Record<string, { name: string; description: string }>,
    // Fallback lookup for service names sourced dynamically (Supabase rows or
    // the fallback catalog) where only the English name string is available.
    nameByEnglish: {
      "Men's Haircut": "Men's Haircut",
      "Kids' Haircut": "Kids' Haircut",
      "Facial Treatment": "Facial Treatment",
    } as Record<string, string>,
  },

  barbers: {
    eyebrow: "Meet The Team",
    title: "Barbers",
    description: "Three professionals, one shared standard of craftsmanship.",
    items: {
      moatsem: {
        bio: "Founder of MOATSEM. Over a decade of precision cutting and a personal hand in every signature style the shop is known for.",
      },
      amir: {
        bio: "Sharp fades and clean lines, delivered with a calm, detail-first approach every time.",
      },
      ibrahim: {
        bio: "Known for modern textured cuts and a relaxed, welcoming chairside manner.",
      },
    } as Record<string, { bio: string }>,
    roleByEnglish: {
      "Owner & Lead Barber": "Owner & Lead Barber",
      "Professional Barber": "Professional Barber",
    } as Record<string, string>,
  },

  workingHours: {
    eyebrow: "Plan Your Visit",
    title: "Working Hours",
    closedLabel: "Closed",
    hoursLabel: "12:00 PM – 10:00 PM",
    days: {
      sunday: { label: "Sunday", short: "Sun" },
      monday: { label: "Monday", short: "Mon" },
      tuesday: { label: "Tuesday", short: "Tue" },
      wednesday: { label: "Wednesday", short: "Wed" },
      thursday: { label: "Thursday", short: "Thu" },
      friday: { label: "Friday", short: "Fri" },
      saturday: { label: "Saturday", short: "Sat" },
    } as Record<string, { label: string; short: string }>,
  },

  gallery: {
    eyebrow: "Inside The Shop",
    title: "Gallery",
    description: "A look at the MOATSEM space and craft. Full gallery coming soon.",
    alt: {
      1: "A barber trimming a client's beard with scissors in a dim, moody barbershop",
      2: "Overhead view of a barber fading a client's haircut with clippers",
      3: "Barber tools laid out on a wooden counter, including clippers, scissors, and pomade",
      4: "Close-up of a barber's clippers shaping a client's hairline",
      5: "Vintage leather barber chair inside the shop",
      6: "Barber cutting a client's hair at the styling station",
    } as Record<number, string>,
  },

  finalCta: {
    title: "Your chair is waiting. Experience the MOATSEM standard.",
    subtitle: "Sunday through Thursday, 12:00 PM – 10:00 PM. Choose your service, your time, and your barber.",
    cta: "Reserve Your Time",
  },

  contact: {
    eyebrow: "Get In Touch",
    title: "Contact Us",
    description: "Questions about a service or a group booking? Send a message and we'll reply by email.",
    fullName: "Full name",
    email: "Email address",
    phoneOptional: "Phone (optional)",
    subject: "Subject",
    message: "Message",
    send: "Send Message",
    sending: "Sending…",
    receivedTitle: "Message received",
    receivedBody: "Thank you, {name}. We've saved your message and will get back to you soon.",
    emailDelayedNote: " (Note: the email notification is delayed, but your message is safely on file.)",
    fallbackName: "there",
    errors: {
      fullName: "Please enter your full name.",
      email: "Please enter a valid email address.",
      phone: "Please enter a valid phone number.",
      subject: "Subject is too long.",
      message: "Please enter a message.",
      notConfiguredProd: "The contact form is temporarily unavailable. Please email us directly or try again later.",
      databaseError: "We couldn't save your message right now. Please try again shortly.",
    },
  },

  booking: {
    eyebrow: "Reserve Your Chair",
    title: "Book an Appointment",
    description: "Choose your service, date, and time, then pick an available barber.",
    notConfiguredProd: "Online booking is temporarily unavailable. Please contact us directly to schedule your visit.",
    stepChooseService: "1. Choose a Service",
    stepChooseDay: "2. Choose a Day",
    stepChooseTime: "3. Choose a Time",
    stepChooseBarber: "4. Choose a Barber",
    stepYourDetails: "5. Your Details",
    selectServiceGroup: "Select a service",
    selectDayGroup: "Select a day",
    selectTimeGroup: "Select a time",
    selectBarberGroup: "Select a barber",
    continue: "Continue",
    back: "Back",
    confirmBooking: "Confirm Booking",
    confirming: "Confirming…",
    fullNameLabel: "Full name",
    phoneLabel: "Phone number",
    emailLabel: "Email address",
    notesLabel: "Notes (optional)",
    checkingAvailability: "Checking availability…",
    closedDayMessage: "We're closed on the selected day. Please choose Sunday–Thursday.",
    withConnector: "with",
    atConnector: "at",
    confirmedHeading: "Booking confirmed",
    confirmedBody: "A confirmation has been recorded for {name}. Save your booking reference to manage this appointment later.",
    referenceLabel: "Reference",
    serviceLabel: "Service",
    barberLabel: "Barber",
    dateLabel: "Date",
    timeLabel: "Time",
    priceLabel: "Price",
    emailFailedNotice:
      "Your booking is confirmed, but we couldn't send a confirmation email to your address right now. Please save your reference below — it's all you need to manage this appointment.",
    manageBookingHint: "Need to cancel or check this booking later? Use your reference and email on the",
    manageBookingLinkText: "Manage Booking",
    manageBookingHintSuffix: "page.",
    statusLabels: {
      available: "Available",
      booked: "Booked",
      unavailable: "Unavailable",
    },
    errors: {
      completeAllSteps: "Please complete every step before confirming.",
      chooseService: "Please choose a service.",
      chooseBarber: "Please choose a barber.",
      invalidDate: "Please choose a valid date.",
      invalidTime: "Please choose a valid time.",
      fullName: "Please enter your full name.",
      phone: "Please enter a valid phone number.",
      email: "Please enter a valid email address.",
      notesTooLong: "Notes are too long.",
      closedDay: "We're closed on the selected day. Please choose Sunday–Thursday.",
      pastTime: "That time has already passed. Please choose another.",
      serviceUnavailable: "That service is no longer available.",
      barberUnavailable: "That barber is no longer available.",
      slotTaken: "That slot was just taken. Please choose another time or barber.",
      lookupRequired: "Please enter your booking reference and email address.",
      notFound: "No booking found for that reference and email.",
      alreadyCancelled: "This booking has already been cancelled.",
      cannotCancel: "This booking can no longer be cancelled.",
      generic: "Something went wrong. Please try again.",
      invalidRequest: "Invalid request.",
    },
  },

  manageBooking: {
    eyebrow: "Your Appointment",
    title: "Manage Booking",
    description: "Enter your booking reference and the email you booked with to view or cancel your appointment.",
    backToHome: "← Back to Home",
    bookAnotherAppointmentCta: "Book Another Appointment",
    referenceLabel: "Booking reference",
    referencePlaceholder: "MOA-XXXXXXXX",
    emailLabel: "Email address",
    findBooking: "Find Booking",
    lookingUp: "Looking up…",
    statusLabels: {
      confirmed: "Confirmed",
      cancelled: "Cancelled",
      completed: "Completed",
      no_show: "No-show",
    },
    cancelAppointment: "Cancel This Appointment",
    cancelling: "Cancelling…",
    cancelledMessage: "Your appointment has been cancelled. That time is now available again.",
    cancelledMessageEmailFailed:
      "Your appointment has been cancelled and that time is now available again. We couldn't send a cancellation email to your address right now, but the cancellation itself is final.",
    bookAnotherAppointment: "Book Another Appointment",
    backToHomeCta: "Back to Home",
  },

  footer: {
    tagline: "A premium barber shop built on precision, professionalism, and personal care. Every visit, one standard.",
    navigate: "Navigate",
    visitUs: "Visit Us",
    phone: "+1 (000) 000-0000",
    address: "123 Example Street, Your City",
    rightsReserved: "All rights reserved.",
  },
};

export type Dictionary = typeof en;
