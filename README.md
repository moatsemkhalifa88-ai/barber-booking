# MOATSEM — Barber Shop Website & Booking

Website and online booking system for the MOATSEM barber shop. It is available in English and Hebrew (RTL).

- **Book an appointment:** choose a service, date, time and barber. Availability is live, and the database prevents double-booking.
- **Manage a booking:** look up or cancel a booking at `/manage-booking` using the booking reference and email.
- **Contact form:** messages are stored in the database and emailed to the shop.
- Confirmation and cancellation emails go to both the customer and the shop.

Built with Next.js 16 (App Router, Server Actions), React 19, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL) and Resend (email).

## Requirements

- Node.js 20.9 or newer (22 LTS recommended) and npm
- A [Supabase](https://supabase.com) project
- A [Resend](https://resend.com) account with a verified sending domain

## Setup

```bash
npm ci
cp .env.local.example .env.local   # then fill in the values
npm run dev                        # http://localhost:3000
```

### Database

Run the SQL files in `supabase/migrations/` against your Supabase project **in filename order**. You can paste them into the SQL Editor, or use `npx supabase link` followed by `npx supabase db push`. They create the tables, Row Level Security policies, the double-booking constraint and the availability function, and add the starting barbers, services and working hours.

### Environment variables

Set these in `.env.local` for local development, and in your hosting provider's settings for production. Never commit real values.

| Variable | Secret? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No | Supabase publishable (anon) key |
| `SUPABASE_SERVICE_ROLE_KEY` | **Yes. Server only.** | Server-side database access for bookings and contact messages |
| `RESEND_API_KEY` | **Yes. Server only.** | Sending email |
| `RESEND_FROM_EMAIL` | No | Sender address on your verified Resend domain |
| `CONTACT_RECEIVER_EMAIL` | No | Shop inbox for booking and contact notifications |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run lint` | Lint with ESLint |

## Deployment

The recommended host is Vercel. Import the repo, add the environment variables above, and deploy. Set the function region close to your Supabase region. See [AUDIT.md](AUDIT.md) for full deployment notes and the launch checklist.
