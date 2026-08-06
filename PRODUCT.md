# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary audience: people who want to learn about the chapel and how to visit it — pilgrims, hikers, and local residents in and around Gudbrandsdalen, Norway, as well as anyone seeking a quiet, open place. Donors are a secondary audience. The site is maintained by the user (Andreas); the chapel project is owned by an organization created by the four friends.

## Product Purpose

The site's primary job is to inform people about the chapel — Capella Reginae Norvegiae, known locally as Mariaslæen — and how to visit it. Fundraising and donor recognition are secondary.

The chapel itself: an old blacksmith's forge (*smia*) at Ledum Farm, Gudbrandsdalen, converted by four friends into a small chapel open to everyone — no entry fee, no membership, no particular religion required. The project started in 2022; walls and roof are complete, with windows, floor, stained glass, and seating still to come.

## Positioning

A restored blacksmith's forge in the Gudbrandsdalen valley becoming a quiet, open chapel for anyone — pilgrims, hikers, and locals — with no entry fee and no religious requirement. Funding comes directly from donors with no overhead. (Positioning phrasing currently rests on AI-generated site copy under revision; treat as provisional until the copy is corrected.)

## Operating Context

- The chapel project: an old forge at Ledum Farm, Gudbrandsdalen, Norway; conversion started 2022.
- Site languages: Norwegian (default) and English.
- Live data: donation totals from the Vipps ePayment API plus historical Spleis fundraiser data (baseline 413 800 kr); GitHub Actions rebuilds the site hourly to refresh donation figures; Vipps credentials live in repository secrets.
- Deployment: static site on GitHub Pages under `/capellareginaenorvegiae`.

## Capabilities and Constraints

- Astro 6 + Tailwind 4 static site (Node >= 22.12), deployed to GitHub Pages with an hourly rebuild workflow.
- Four routes (index, story, ourlady, support) in two languages; before/after restoration slider; top-donations and recent-activity lists; Vipps QR code; theme switcher; Instagram link.
- All current site copy is AI-generated and not fully accurate; it will be revised soon. Future work must not treat current copy as confirmed product truth and must flag unverified claims (e.g., "every krone goes straight to the building, no overhead") rather than propagate them.
- The original fundraising goal has been met; going forward the site should show total raised, not a percentage toward a goal.
- Open decisions: practical visiting information (location details, access, hours) is not yet published; the organization's legal form is not recorded.
- Confirmed (2026-08): the chapel is dedicated to the Blessed Virgin Mary, in particular to an image called Our Lady of Gudbrandsdalen (Vår Frue av Gudbrandsdalen); the page lives at /ourlady in both languages.

## Brand Commitments

- Name used in header, footer, and Instagram: "Capella Reginae Norvegiae" (Latin: Chapel of the Queen of Norway); the hero welcomes visitors to "Mariaslæen".
- Instagram: @capellareginaenorvegiae.
- Voice of current copy (under revision): conversational, first-person, warm — "We're not done yet — and we'd love to have you."
- Owner: an organization created by the four friends.
- Dedication: the chapel is dedicated to the Blessed Virgin Mary, in particular to an image called Our Lady of Gudbrandsdalen (Vår Frue av Gudbrandsdalen).

## Evidence on Hand

- Real photography: chapel exterior and interior, the Gudbrandsdalen valley, before/after restoration images, photos of the four builders, stained-glass artwork (`src/assets/`).
- Real donation evidence: Spleis donor list with names and messages (`src/data/spleis-donors.json`), Vipps QR code (`src/assets/capella_vipps_qr.png`), live Vipps ePayment totals.
- Absences future work must not fabricate: no testimonials, press, opening dates, or visiting logistics are published; all current site text is provisional AI-generated copy.

## Product Principles

1. Inform before asking — the site's first job is to tell visitors about the chapel and how to visit; donations stay secondary.
2. Money must stay honest — show total raised, keep donation claims accurate, never invent figures.
3. Open to everyone — no denomination, no entry fee, no membership; the site's welcome must match the chapel's.
4. Facts over polish — while copy is AI-generated and under revision, future work flags unverified claims instead of propagating them.
5. Human scale — four friends, first-person, personal; the story is the product's soul.

## Accessibility & Inclusion

The chapel is open to all regardless of religion or background, and the site should keep that welcome. No specific accessibility standard has been established beyond the site's existing foundations (skip link, visible focus states, touch-target sizing).
