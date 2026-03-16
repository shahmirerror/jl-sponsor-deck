# Jinnah League Sponsorship Deck: Page Content (Punctuation-Polished)

This document consolidates the content and messaging of every routed page in the current Next.js application.

## Public Pages

### /
- Core positioning: ACM MAJU Jinnah League '26 is presented as Pakistan's largest university tech and gaming summit.
- Hero emphasis: large-scale event identity with strong visual branding and marquee language.
- Proof points: 2,000+ expected participants, nationwide university reach, 2 days, and 8 announced competitions.
- Mission narrative: student-led innovation, national reach, and academia-industry bridge.
- Sector preview: Banking and Finance, Technology and IT, Software Houses, BPOs, Property and Real Estate, Car Dealerships, Healthcare and Pharma, Education and EdTech, Retail and FMCG, Media and PR.
- Tier teaser: Silver, Gold, Platinum, Co-Title, and Title packages with PKR pricing.
- Social proof: sponsor logo strip featuring media, fintech, education, and technology partners.
- CTA: invites organizations to become sponsors.

### /about
- Page goal: introduce the executive team behind Jinnah League '26.
- Team positioning: student leaders focused on innovation, excellence, and collaboration.
- Director spotlight cards: role, description, and LinkedIn profile for each leadership member.
- Visual message: "Student leaders building Pakistan's future."

### /career-fair
- Positioning: dedicated recruitment and networking ecosystem connecting companies with student talent.
- Key stats: 1,500+ students, 488.7K digital views, core age range, 2 days.
- Why exhibit section: talent access, targeted engagement, performance amplification, recruitment readiness.
- Sponsor highlights: premium activation opportunities and brand touchpoints.
- Booth tiers: Elite, Executive, Corporate, and Standard booth options tied to sponsorship packages.
- Recruitment features: CV drop zones, product activation, branded giveaways, tech talk integration.
- Talent profile: skill distribution, degree split, and represented institutions.
- CTA: booth booking for career-fair sponsors.

### /contact
- Objective: convert sponsor interest into direct inquiry.
- Messaging: custom arrangements and tier guidance via partnership team.
- Contact channels: email, phone/WhatsApp, and campus address.
- Contact persons: leadership contacts with WhatsApp quick action.
- Form fields: name, company, designation, email, phone, sector, tier, and message.
- Confirmation flow: success message after inquiry submission.
- Location support: embedded campus map for Mohammad Ali Jinnah University.

### /events
- Theme: legacy of innovation across previous Jinnah League editions.
- Annual timeline: event edition cards with year, participants, prize pool, and highlights.
- Sub-events: Survival League, Final Boss Challenge, and ACM Fiesta highlights.
- Cumulative impact: 1,800 participants, PKR 460K combined prize pool, 24 competitions, and nationwide reach.

### /partners
- Focus: current sponsors and official media partner presentation.
- Hero language: organizations supporting student tech talent.
- Featured partner: PTV Sports as official media partner.
- Supporting copy: national broadcast and digital distribution value.
- CTA: encourages new partnership signups.

### /previous-sponsors
- Focus: historical sponsor recognition and trust signaling.
- Sponsor grid: partner name, tier, year, and sector metadata.
- Sector spread: banking, fintech, software, education, and digital services.
- Message: continued brand confidence in ACM MAJU platforms.

### /sectors
- Goal: industry-specific sponsorship value articulation.
- Structure: each sector includes tailored pitch plus three concrete benefits.
- Covered segments: Banking and Finance, Technology and IT, Software Houses, BPOs, Property and Real Estate, Automotive, Healthcare and Pharma, Education and EdTech, Retail and FMCG, Media and PR.
- Route behavior: hash-based smooth scroll to targeted industry blocks.
- CTA: sector-specific contact intent routing.

### /social-insights
- Positioning: data-backed social reach and sponsor amplification.
- Primary metric signal: 488.7K views in 90 days.
- Platform cards: Instagram, LinkedIn, and Facebook with followers, reach, and engagement indicators.
- Content performance: top content formats and average reach benchmarks.
- Sponsor outcomes: announcement posts, reels/stories visibility, thank-you reels, and spotlight posts.
- Visual proof: social screenshot preview gallery.

### /tiers
- Purpose: detailed sponsorship package comparison and conversion.
- Pricing ladder: Silver (Rs. 1,50,000), Gold (Rs. 2,00,000), Platinum (Rs. 4,50,000), Co-Title (Rs. 7,00,000), Title (Rs. 10,00,000).
- Package depth: each tier includes explicit perk lists and booth associations.
- Comparison table: Silver, Gold, and Platinum benefit matrix.
- Premium section: naming-rights packages with expanded media and stage exposure.
- CTA: tier-prefilled inquiry links.

### /terms
- Purpose: legal terms for usage of the sponsorship deck and related website pages.
- Includes scope, information usage, intellectual property, external links, and contact section.

### /privacy
- Purpose: privacy policy for sponsorship inquiry and contact data handling.
- Includes collected data categories, usage, sharing boundaries, security note, and contact section.

## Internal Admin Portal Pages

### /portal
- Auth gate for internal team members.
- Email and password login with role-aware access (Admin or Editor).
- On success, redirects to dashboard.

### /portal/dashboard
- Financial summary cards: total budget, spent, remaining, active sponsors.
- Budget utilization progress indicator.
- Recent activity feed with sponsorship and finance updates.

### /portal/sponsors
- Sponsor directory table: company, sector, tier, amount, status, and commit date.
- Quick action button to add sponsor records.

### /portal/budget
- Total budget overview and allocation breakdown.
- Pie-chart visualization by category.
- Per-category progress tracking and editable allocation fields for admin users.
- Full budget table with totals.

### /portal/expenditures
- Expenditure logbook with date, category, description, amount, and receipt link.
- Quick action button to log an expense.

### /portal/reports
- Monthly spend velocity chart.
- CSV export action.
- Custom PDF report and compliance audit export actions.

### /portal/settings
- Organization-level configuration fields.
- Team member access table with role visibility.
- Admin-only role management controls.
- Access-level definitions for Admin and Editor permissions.

## Sponsor Portal Pages

### /sponsor-portal
- Sponsor login screen and authentication entry point.
- Messaging emphasizes transparent partnership tracking.
- Demo credentials shown for test access.

### /sponsor-portal/dashboard
- Partnership overview: tier, committed amount, received amount, remaining balance, payment status, partner since date.
- Dedicated partnership manager card with direct WhatsApp contact.

### /sponsor-portal/deliverables
- Tier-aware checklist of sponsor deliverables.
- Progress counter showing completed versus total commitments.
- Status labels for each deliverable item.

### /sponsor-portal/documents
- Central repository layout for agreement, invoice, payment proof, brochure, and post-event report.
- Status placeholder for pending uploads.

### /sponsor-portal/social-proof
- Placeholder gallery for published social coverage proof.
- Intended for post links, screenshots, impressions, and reel metrics.

### /sponsor-portal/event-info
- Event-day logistics and operations reference.
- Includes dates, venue, setup guidance, contacts, parking, and entry instructions.

## Notes
- Source wrappers under pages map routes to components under src/pages.
- _app applies global styling and does not contain standalone page copy.
- Global footer content now follows the jinnahleague.com pattern: Quick Links, Resources, Connect With Us, flagship initiative copy, and Terms/Privacy links.
