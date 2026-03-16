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
