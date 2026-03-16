# Jinnah League Sponsorship Deck (Next.js)

This project is now a Next.js (Pages Router) application for the ACM MAJU sponsorship deck and internal portal views.

## Run

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run start
```

## Email Setup (Resend)

The contact form now posts to `POST /api/contact` and sends inquiries via Resend.

Create a `.env.local` file with:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
CONTACT_RECEIVER_EMAIL=acm@jinnah.edu
```

Notes:

- Replace `RESEND_FROM_EMAIL` with a verified sender/domain in production.
- `CONTACT_RECEIVER_EMAIL` is optional and defaults to `acm@jinnah.edu`.

## Routes

Public pages:

- /
- /about
- /tiers
- /career-fair
- /sectors
- /events
- /partners
- /previous-sponsors
- /social-insights
- /contact

Portal pages:

- /portal
- /portal/dashboard
- /portal/sponsors
- /portal/budget
- /portal/expenditures
- /portal/reports
- /portal/settings

Sponsor portal pages:

- /sponsor-portal
- /sponsor-portal/dashboard
- /sponsor-portal/deliverables
- /sponsor-portal/documents
- /sponsor-portal/social-proof
- /sponsor-portal/event-info

## Project Notes

- Global CSS is imported in pages/_app.js, as required by Next.js.
- Legacy Vite entry files were removed during migration cleanup.
