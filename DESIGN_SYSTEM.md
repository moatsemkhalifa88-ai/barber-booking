# MOATSEM Design System — "Barbershop Warm"

A warm barbershop look: near-black and chocolate bands alternating with beige and off-white sections, condensed display headings, flat shapes, and a single orange accent. It is designed mobile-first for Israeli visitors on phones. Hebrew (RTL) is the default language, with English as the alternative.

Tokens live in [`src/app/globals.css`](src/app/globals.css) (`:root` + Tailwind `@theme`). Components use the semantic names below. Never use raw hex values in components.

---

## 1. Principles

1. **Booking first.** The "Book" action is reachable in one tap from anywhere: the hero's quick-booking card, the header, the sticky bottom bar and the mobile menu.
2. **One accent.** Orange is used only for primary buttons and key highlights (the hero's second line, eyebrows on dark grounds, the demo banner). Everything else uses neutrals.
3. **Readable everywhere.** Every text pair meets WCAG AA (4.5:1). Input borders and focus rings meet 3:1. Orange text on light grounds uses the darkened `accent`.
4. **Hebrew is not a translation.** RTL layout, native copy, and no letter-spacing on Hebrew.
5. **Flat and calm.** 1px dividers instead of shadows, with short, meaningful motion that turns off under `prefers-reduced-motion`.

---

## 2. Color tokens

### Section grounds

| Token | Hex | Used for |
|---|---|---|
| `ink` | `#1B1714` | Hero, header, mobile menu, footer |
| `cocoa` | `#4B3F38` | "About" band, final call to action |
| `canvas` | `#EFE6D8` | Main beige sections (price list, gallery, opening hours, My Booking) |
| `surface` | `#FBF8F3` | Off-white: barbers, booking and contact sections; cards on beige |
| `surface-2` | `#E4D7C4` | Deeper beige: chips, disabled options |

**Page rhythm:** hero `ink` → about `cocoa` → prices `canvas` → barbers `surface` → gallery `canvas` → booking `surface` → hours `canvas` → contact `surface` → final CTA `cocoa` → footer `ink`.

### Text and UI

| Token | Hex | Use | Contrast |
|---|---|---|---|
| `fg` | `#1B1714` | Text on light grounds | 14.4:1 canvas · 16.8:1 surface · 12.6:1 surface-2 |
| `muted` | `#5C4F45` | Secondary text on light grounds | 6.4:1 canvas · 7.5:1 surface · 5.6:1 surface-2 |
| `disabled-fg` | `#625548` | Labels of disabled options ("תפוס") | 5.1:1 on surface-2 |
| `accent` | `#924506` | Orange **darkened** for text, links, eyebrows and selected borders on light grounds; the focus ring on light grounds | 5.5:1 canvas · 6.4:1 surface · 4.8:1 surface-2 |
| `on-ink` | `#F5EEE4` | Text on `ink` / `cocoa` | 15.5:1 ink · 8.8:1 cocoa |
| `on-ink-muted` | `#D8CBBB` | Secondary text on dark grounds | 9.4:1+ ink · 6.4:1 cocoa |
| `line-dark` | `#3A322C` | Dividers on dark grounds | decorative |
| `brand` | `#F59E4C` | **The one accent**: primary button fill and highlights on dark grounds; the focus ring on dark grounds | dark text on it 8.4:1 · as text: 8.4:1 ink, 4.8:1 cocoa |
| `brand-hover` | `#F8B26E` | Primary hover | dark text 9.8:1 |
| `brand-edge` | `#B85E14` | 1px edge on orange buttons so they read on light grounds | 4.3:1 surface · 3.7:1 canvas |
| `on-brand` | `#1B1714` | Text on orange | 8.4:1 |
| `brand-soft` (alias `accent-soft`) | `#FCE3C9` | Selected-option tint, today's row | fg 14.4:1 · accent 5.5:1 |
| `primary` | `#1B1714` | Strong neutral: selected chips, progress bar, badges | `on-primary` 16.8:1 |
| `border` | `#D9CCBA` | 1px dividers, card outlines | decorative |
| `border-strong` | `#85766A` | Input and option outlines | 4.1:1 surface · 3.5:1 canvas |
| `error` / `error-soft` | `#B42318` / `#FBE9E5` | Errors (always with an icon + text) | 5.3:1 canvas · 5.6:1 on soft |
| `success` / `success-soft` | `#15703A` / `#E3F1E7` | Success states | 5.0:1 canvas · 5.3:1 on soft |

**Tones:** dark sections carry `.tone-dark`, which switches the focus ring to `brand`. Light cards inside them (the quick-booking card) carry `.tone-light` to switch it back.

---

## 3. Typography

| Role | Family | Notes |
|---|---|---|
| Display / headings (Hebrew) | **Karantina** 700 | Bold, condensed Hebrew |
| Display / headings (English) | **Bebas Neue** 400 | Matching condensed Latin |
| Body / UI | **Heebo** (variable, Hebrew + Latin) | |

All are loaded with `next/font/google`. The display face is chosen per language through `--font-display-face` (`html[lang="en"]` switches to Bebas Neue), so `font-display` always gives the right one.

| Role | Size | Line height | Weight |
|---|---|---|---|
| Hero (H1) | 56 px mobile · 64 px desktop (72 px xl) | 0.95 | 700 |
| Section title (H2) | 44 px mobile · 48 px desktop | 0.95 | 700 |
| Card / step title | 34 px | 0.95 | 700 |
| Price (display) | 40 px, the ₪ sign 20 px in Heebo | 1 | 700 |
| Body | 16 px | 1.6 | 400 |
| Small / helper | 14 px | 1.5 | 400 |
| Eyebrow | 14 px | — | 700 |

- Inputs are **16 px**, which prevents iOS from zooming in on focus.
- Prices, times and references use `tabular-nums`.
- Karantina's ₪ glyph is very heavy, so prices put the amount in the display face and the ₪ in Heebo (`priceParts()`).

---

## 4. Shapes, spacing, elevation

**Radius:** 12 px for buttons, inputs and chips (`radius-sm`, `radius-md`); 16 px for cards, photos and panels (`radius-lg`, `radius-xl`); full for badges and icon circles.

**Flat:** `shadow-card` is `none`. Surfaces are separated by ground colour and 1px `border` lines. `shadow-raised` (`0 8px 24px rgb(27 23 20 / .12)`) is only for floating UI (the sticky bars) and the barber-card hover lift.

**Spacing:** a 4pt scale.

| Context | Mobile | Desktop |
|---|---|---|
| Page gutter | 16 | 24 (tablet) / 48 |
| Section padding (vertical) | 56 | 96 |
| Card padding | 16 | 20–24 |

**Layers (z-index):** content 0 · sticky header 40 · back-to-top 45 · sticky bottom bar 50 · mobile menu 60.

---

## 5. Touch, motion, RTL

- Every interactive element is **≥ 48 px** tall (icon buttons 44 px visual, 48 px hit area), with an **8 px** gap between neighbouring targets.
- **Logical directions only:** `ms/me/ps/pe`, `start/end`, `text-start`. Directional icons mirror in RTL (`rtl:-scale-x-100`).
- Times, dates, prices, emails and references are isolated with `<bdi>` / `Bidi`. Email and phone inputs use `dir="ltr"`. Never put a time range like `12:00–22:00` inside a Hebrew string; render it separately in an LTR span.
- The week starts on **Sunday**. All "today" and day-of-week logic uses **Asia/Jerusalem** on server and client.

### Motion

Defined in `globals.css` (`.price-row`, `.barber-card`, `[data-reveal]`) and `ScrollReveal.tsx`.

- **Animate only** `transform`, `opacity` and `box-shadow`.
- **Timing:** UI 200–300 ms, image zoom 600 ms, scroll reveal 550 ms, all with the ease-out curve `cubic-bezier(0.22, 0.61, 0.36, 1)`.
- **Hover** applies only inside `@media (hover: hover) and (pointer: fine)`. Keyboard `:focus-visible` triggers the same effects on any device.
  - Price row: a `surface` highlight fades in, the thumbnail zooms to 1.06, the price scales to 1.05, and the arrow nudges 4 px toward the reading direction.
  - Barber card (focusable): lifts 4 px with `shadow-card-lift`, a 1px `brand-edge` outline fades in, the photo zooms to 1.06, and an orange underline grows under the name from the start edge.
- **Touch:** rows and cards scale to 0.98 on `:active` for 120 ms (iOS needs the passive `touchstart` listener in `ScrollReveal`).
- **Scroll reveal:** rows and cards fade in and rise 16 px once, staggered 80 ms, as they enter the screen. Nothing is hidden before JavaScript runs.
- **Reduced motion:** no movement, zoom or reveal. Colour changes still apply, instantly.

### Formatting

| Value | Hebrew | English |
|---|---|---|
| Date (UI) | `יום ה׳, 1 באוקטובר` | `Thu, Oct 1` |
| Date (email) | `יום חמישי, 1 באוקטובר 2026` | `Thursday, October 1, 2026` |
| Time | `16:00` (24h) | `16:00` (24h) |
| Price | `50 ₪` | `₪50` |

---

## 6. Components

### Demo banner
- A full-width `brand` bar with `on-brand` text: one short line on phones and the full sentence from `sm` up. It has a 40 px dismiss button.

### Header and mobile menu
- **Header:** `ink` ground, sticky, 56 px tall (72 px desktop), with `on-ink` links and a `brand` "הזמינו תור" button on desktop. It respects `env(safe-area-inset-top)`.
- **Language switch:** an outlined segmented control; the active language is an `on-ink` chip with `ink` text.
- **Mobile menu:** full-height `ink` sheet (portalled), with 56 px rows: הזמנת תור · התור שלי · שירותים · הספרים · שעות פעילות · צור קשר. Below them sit the language switch and a pinned `brand` button. It traps focus, closes on Esc, and locks page scroll.

### Hero
- `ink` ground.
- **Phones:** a large photo (`27svh`), then the headline (first line `on-ink`, second line `brand`), the short subtitle, the quick-booking card and the stats line. The card's button sits on the first screen.
- **Desktop:** text and card on the start side, a tall photo on the end side.
- **Quick-booking card** (`.tone-light`, `surface`): service and day as native `<select>`s side by side, then a `brand` "הזמינו תור" button. It dispatches the book-service event with both choices, so the booking flow opens at step 2 with them pre-selected.

### About band
- `cocoa` ground: an eyebrow in `brand`, the title in `on-ink`, and the description in `on-ink-muted`.
- Icon rows separated by 1px light dividers: opening hours (days and an LTR-isolated time range, plus the closed days) and the email as a `mailto:` link. There is no address or phone.

### Price list
- `canvas` ground, centred, max 768 px wide, with 1px dividers above and below each row.
- **Row:** thumbnail 64–80 px (16 px radius) · name (bold) + duration (and the description from `sm` up) · price in the display face · "הזמינו" + arrow (arrow only on phones).
- The whole row is a link with a full accessible name ("הזמינו תספורת גברים, 45 דק׳, 50 ₪"). It pre-selects the service in the booking flow.

### Barber card
- **Homepage:** portrait photo (3:4), name in the display face (34 px), and role (`accent` for the owner). On phones they sit in a 70%-wide swipe row; on desktop, 3 columns.
- **Booking flow:** a 48 px round photo, name, role and a status badge with a dot **plus text**. "Any available barber" is always first.

### Buttons

| Variant | Style |
|---|---|
| Primary | `brand` fill, `on-brand` text, 1px `brand-edge`, 12 px radius, 48 px |
| Secondary | `surface` fill, 1px `border-strong` outline, `fg` text |
| Outline on dark | 1px `on-ink` outline at 60%, `on-ink` text |
| Ghost | Text only, `accent`, underline on hover |
| Danger | 1px `error` outline + `error` text; filled `error` only inside a confirmation step |

- Loading state: disabled, with a spinner and a progressive label.
- Disabled state: 45% opacity and the native `disabled` attribute.

### Booking flow
- An off-white section with a beige card, four steps (service → date & time → barber → details) and "שלב 2 מתוך 4" progress.
- **Date strip:** 14 days, with closed days labelled "סגור". **Time grid:** taken slots labelled "תפוס".
- Selected chips use `primary` (dark); selected rows use the `brand-soft` tint with an `accent` border **and** a check icon.
- **Step bar:** sticky at the bottom on phones, showing the summary, price and next step.

### Form fields
- Label above, a 48 px field with a 1px `border-strong` outline and 12 px radius, and the error under the field with an icon.
- `.field-select` adds a chevron on the inline-end side for native selects.

### Opening hours, contact, footer
- **Opening hours:** an off-white list on beige, with today's row in `brand-soft` and an "היום" badge.
- **Contact:** a beige form card on an off-white section.
- **Footer:** `ink` ground, `on-ink` and `on-ink-muted` text, `line-dark` divider, and the email link in `brand`.

---

## 7. Accessibility checklist

- [ ] Text contrast ≥ 4.5:1; input borders, icons and focus rings ≥ 3:1 (focus ring `accent` on light grounds, `brand` on dark grounds).
- [ ] A visible 2 px focus ring on every interactive element.
- [ ] Hebrew `aria-label`s come from the dictionary, never hardcoded English.
- [ ] Icon-only buttons have accessible names; decorative icons and images use `aria-hidden` / `alt=""`.
- [ ] Sticky UI never hides the focused element (`scroll-padding` on `html`).
- [ ] Reduced motion is respected; there is no horizontal page scroll at 320–1440 px.
