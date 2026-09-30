# MOATSEM Design System — "Warm Paper"

A light, editorial boutique style: warm off-white paper, deep charcoal text, and restrained gold details. It is designed mobile-first for Israeli visitors on phones. Hebrew (RTL) is the default language, with English as the alternative.

Tokens live in [`src/app/globals.css`](src/app/globals.css) (`:root` + Tailwind `@theme`). Components use the semantic names below. Never use raw hex values in components.

---

## 1. Principles

1. **Booking first.** The "Book" action is reachable in one tap from anywhere: the hero, the header, the sticky bottom bar and the mobile menu.
2. **One primary action per screen.** Secondary actions are outlined; tertiary actions are plain text.
3. **Readable in daylight.** Every text pair meets WCAG AA (4.5:1). Input borders and focus rings meet 3:1.
4. **Hebrew is not a translation.** RTL layout, no uppercase and no letter-spacing on Hebrew, and native copy.
5. **Calm motion.** Short, meaningful transitions, turned off under `prefers-reduced-motion`.

---

## 2. Color tokens

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `canvas` | `#FAF7F2` | Page background | — |
| `surface` | `#FFFFFF` | Cards, inputs, sheets | — |
| `surface-2` | `#F3EEE6` | Alternate sections, disabled options | — |
| `fg` | `#1C1917` | Primary text | 16.4:1 on canvas · 17.5:1 on surface |
| `muted` | `#57534E` | Secondary text | 7.1:1 canvas · 7.6:1 surface · 6.6:1 surface-2 |
| `disabled-fg` | `#6B655D` | Labels of disabled options ("Booked") | 5.0:1 on surface-2 |
| `accent` | `#8A5A0B` | Gold (darkened) for links, eyebrows, prices, selected borders, focus | 5.5:1 canvas · 5.9:1 surface |
| `accent-soft` | `#F6EDDC` | Selected-option tint | fg 15.0:1 · accent 5.1:1 |
| `gold` | `#E3C47E` | Gold **only on dark** (hero, primary button details) | 10.4:1 on primary |
| `primary` | `#1C1917` | Primary button fill, selected chips | white text 17.5:1 |
| `primary-hover` | `#2E2A26` | Primary hover/pressed | white text 14.2:1 |
| `on-primary` | `#FFFFFF` | Text on primary | — |
| `border` | `#E4DDD2` | Decorative dividers, card outlines | decorative only |
| `border-strong` | `#8C857B` | Input and option outlines | 3.7:1 surface · 3.4:1 canvas |
| `error` / `error-soft` | `#B42318` / `#FEF1EF` | Errors (always with an icon + text) | 6.6:1 surface · 6.0:1 on soft |
| `success` / `success-soft` | `#15703A` / `#ECF7F0` | Success states | 6.2:1 surface · 5.6:1 on soft |
| `focus` | `#8A5A0B` | 2px focus ring, 2px offset | 5.9:1 |

**Hero scrim:** white text on the photo always sits on a `primary` scrim of at least 70% opacity (worst case 6.5:1).

---

## 3. Typography

| Role | Family | Notes |
|---|---|---|
| Display / headings | **Frank Ruhl Libre** (variable, Hebrew + Latin) | Classic Israeli editorial serif |
| Body / UI | **Assistant** (variable, Hebrew + Latin) | Friendly, highly legible sans |

Both are loaded with `next/font/google` using the subsets `hebrew` + `latin`, so switching language never swaps fonts.

| Role | Mobile → Desktop | Line height | Weight |
|---|---|---|---|
| Display (H1) | 34 → 56 px | 1.12 | 700 |
| H2 | 28 → 40 px | 1.2 | 700 |
| H3 / card title | 20 → 22 px | 1.3 | 600 |
| Body | 16 px | 1.65 | 400 |
| Small / helper | 14 px | 1.5 | 400 |
| Label / chip | 15 px | 1.3 | 600 |
| Minimum | 12 px (legal lines only) | | |

- Inputs are **16 px**, which prevents iOS from zooming in on focus.
- Prices, times and references use `tabular-nums`.
- **No `uppercase` and no `tracking-*` on Hebrew.** Latin-only eyebrows may use `tracking-wide` via `ltr:` variants.

---

## 4. Spacing, radius, elevation

**Spacing:** a 4pt scale (4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96).

| Context | Mobile | Desktop |
|---|---|---|
| Page gutter | 16 | 24 (tablet) / 48 |
| Section padding (vertical) | 56 | 96 |
| Card gap | 12 | 16–24 |
| Card padding | 16 | 24 |

**Radius:**

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 8 px | Chips, time slots |
| `radius-md` | 10 px | Buttons, inputs |
| `radius-lg` | 12 px | Cards |
| `radius-xl` | 20 px | Hero photo, large panels |
| `radius-full` | — | Avatars, badges |

**Shadows (warm-tinted):**

| Token | Value | Use |
|---|---|---|
| `shadow-card` | `0 1px 2px rgb(28 25 23 / .06), 0 8px 24px rgb(28 25 23 / .06)` | Cards |
| `shadow-raised` | `0 2px 4px rgb(28 25 23 / .08), 0 16px 40px rgb(28 25 23 / .10)` | Sticky bars, the mobile menu, raised cards on hover |

**Layers (z-index):** content 0 · sticky header 40 · sticky bottom bar 50 · back-to-top 45 · mobile menu 60 · toasts 70.

---

## 5. Touch, motion, RTL

- Every interactive element is **≥ 48 px** tall (icon buttons 44 px visual, 48 px hit area), with an **8 px** gap between neighbouring targets.
- **Press feedback within 100 ms.** Enter transitions take 200–250 ms and exits about 150 ms. Only `transform`, `opacity` and `box-shadow` are animated. Movement is disabled under `prefers-reduced-motion` (see Motion below).
- **Logical directions only:** `ms/me/ps/pe`, `start/end`, `text-start`. Directional icons (chevrons, arrows) mirror in RTL (`rtl:-scale-x-100`); checkmarks, clocks and logos do not.
- Times, dates, prices, phone numbers, emails and references are wrapped in `<bdi>` / `Bidi` (LTR), and email and phone inputs use `dir="ltr"`.
- The week starts on **Sunday**.
- All "today" and day-of-week logic uses **Asia/Jerusalem** on both server and client.

### Motion

The card motion is defined in `globals.css` (`.service-card`, `.barber-card`, `[data-reveal]`) and `ScrollReveal.tsx`.

- **Animate only** `transform`, `opacity` and `box-shadow`, so nothing shifts the layout.
- **Timing:** UI transitions take 200–300 ms, image zoom 600 ms, and the scroll reveal 550 ms. All use an ease-out curve, `cubic-bezier(0.22, 0.61, 0.36, 1)`.
- **Hover** applies only inside `@media (hover: hover) and (pointer: fine)`. Keyboard focus triggers the same effects on any device: `:has(:focus-visible)` for service cards, and `:focus-visible` for barber cards, which are focusable.
  - Service card: lifts 4 px with a warm shadow, a 1 px gold outline fades in, the photo zooms to 1.06, the price to 1.05, and the button fills with `primary`.
  - Barber card: lifts 4 px, a gold ring settles in around the photo, the photo zooms to 1.06, and a gold underline grows under the name from the start edge (right in RTL, left in LTR).
- **Touch:** cards scale to 0.98 on `:active` for 120 ms. iOS needs a passive `touchstart` listener for `:active` to work.
- **Scroll reveal:** cards fade in and rise 16 px once, staggered 80 ms, as they enter the screen. Nothing is hidden before JavaScript runs, and cards already on screen at load don't animate.
- **Reduced motion:** no movement, zoom or reveal. Colour changes (outline, button fill) still apply, instantly.

### Formatting

| Value | Hebrew | English |
|---|---|---|
| Date (UI) | `יום ה׳, 1 באוקטובר` | `Thu, Oct 1` |
| Date (email) | `יום חמישי, 1 באוקטובר 2026` | `Thursday, October 1, 2026` |
| Time | `16:00` (24h) | `16:00` (24h) |
| Price | `50 ₪` | `₪50` |

---

## 6. Components

### Header
- Sticky, **56 px** tall on mobile (72 px on desktop), `surface` at 90% opacity with a backdrop blur and a bottom `border`. It respects `env(safe-area-inset-top)`.
- **Mobile:** logo at the start edge, then the language toggle and the menu button at the end edge.
- **Desktop:** logo, nav links, language toggle, and a "הזמינו תור" primary button.

### Mobile menu
- A full-height sheet (`100dvh`) above everything else, with page scroll locked, focus trapped inside, and Esc or the close button to dismiss.
- Rows are 56 px tall, in this order: הזמנת תור · התור שלי · שירותים · הספרים · שעות פעילות · צור קשר. Below them sits the language toggle (segmented), and a primary "הזמינו תור" button is pinned at the bottom.

### Buttons
| Variant | Style |
|---|---|
| Primary | `primary` fill, `on-primary` text, `radius-md`, 48 px (52 px in sticky bars) |
| Secondary | `surface` fill, 1 px `border-strong` outline, `fg` text |
| Ghost | Text only, `accent`, underline on hover |
| Danger | 1 px `error` outline + `error` text; filled `error` only inside a confirmation step |

- Buttons are full width on mobile.
- Loading state: disabled, with a spinner and a progressive label ("מאשרים…").
- Disabled state: 45% opacity, `cursor-not-allowed`, and the native `disabled` attribute.

### Service card
- A `surface` card with `radius-lg` and `shadow-card`: 16:10 photo, name, duration, and the **price visible without scrolling** (`accent`, tabular).
- In the booking flow the whole card is a radio option. When selected it gets a 2 px `accent` border, the `accent-soft` tint **and a check icon**.
- On the homepage it has a "הזמינו את השירות" button that pre-selects the service in the booking flow.
- On mobile the cards sit in a horizontal scroll-snap row, each 80% of the screen wide.

### Date strip + time grid
- **Date strip:** a horizontal scroll-snap row of chips for the next 14 days. Each chip shows the weekday (`יום ה׳`) and the date (`1 באוק׳`). Closed days are disabled and labelled **"סגור"**. The selected chip uses the `primary` fill.
- **Time grid:** 3 columns on mobile and 5 on desktop, with 48 px chips.
  - Taken slots are disabled and labelled **"תפוס"**; slots with no barber working are labelled **"לא זמין"**.
  - Slots that have already passed are hidden.
- **"Earliest available" shortcut:** a ghost button above the grid that jumps to the first free date and time.
- **Empty state:** when a day is fully booked, a message plus the earliest-available button.

### Barber card
- A 56 px round photo, name, role, and a status badge with a dot **plus text**.
- **"Any available barber" is always first.** It is enabled whenever at least one barber is free, and the server assigns one.
- Unavailable barbers are disabled, with the badge text explaining why.

### Form fields
- Label above (14 px, 600 weight), a 48 px input, a `border-strong` outline, and `radius-md`.
- The correct keyboard and autofill: `type="tel"` + `autocomplete="tel"`, `type="email"` + `autocomplete="email"`, and `autocomplete="name"`.
- Helper text below the field (e.g. `050-1234567`).
- Errors appear under the field with an icon and `aria-describedby`, after the field loses focus or on submit. On submit, focus moves to the first invalid field.

### Sticky bottom action bar (mobile)
- **While browsing:** "הזמינו תור" (primary) + "התור שלי" (secondary). It is hidden while the hero buttons or the booking section are on screen, and on desktop.
- **During booking:** the selection summary (service · day · time), the price, and the next-step button. It is sticky **inside** the booking section only.
- The bar is 72 px tall plus `env(safe-area-inset-bottom)`, uses `shadow-raised`, and the page reserves matching bottom padding so the bar never covers content.

### Booking flow
- Four steps: **service → date & time → barber → details**, with "שלב 2 מתוך 4" progress and a back button.
- Each step change scrolls the step into view and moves focus to its heading.

### Confirmation
- A success icon and a heading that is announced to screen readers.
- The **reference** is shown large (tabular) with a **Copy** button that confirms with "הועתק".
- A summary card, **Add to calendar (.ics)**, and a link to *התור שלי* with the reference pre-filled.

### Manage booking
- Two large fields (reference, email) and a primary "חיפוש התור" button.
- Cancelling needs a **confirmation step** ("לבטל את התור?" → "כן, לבטל" in danger style / "לא, להשאיר").

### Status badge
- `radius-full`, 13 px text, a leading dot, and **always text**, never colour alone:
  - Available: `success-soft` background + `success` text.
  - Booked / unavailable: `surface-2` background + `disabled-fg` text.

---

## 7. Accessibility checklist

- [ ] Text contrast ≥ 4.5:1; input borders, icons and focus rings ≥ 3:1.
- [ ] A visible 2 px `focus` ring on every interactive element.
- [ ] Hebrew `aria-label`s come from the dictionary, never hardcoded English.
- [ ] Icon-only buttons have accessible names; decorative icons use `aria-hidden`.
- [ ] Sticky UI never hides the focused element (`scroll-padding` on `html`).
- [ ] Reduced motion is respected; there is no horizontal page scroll at 320–1440 px.
