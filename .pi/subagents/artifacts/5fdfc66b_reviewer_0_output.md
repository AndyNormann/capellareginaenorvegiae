## Review — User Journey (adversarial)

I traced the full path: landing → learn → story/ourlady/plans → support, across both languages and both breakpoints. Verified from source. The design intent is documented in `Layout.astro:52-55` (the THESIS/STORY comments) and `PRODUCT.md`; I judge the journey against that intent and against the product's own documented facts. Findings are ordered worst-first.

---

### 1. BLOCKER — There is no mobile navigation, and Plans is unreachable on phones

`src/layouts/Layout.astro:77,86,95` — Story, Our Lady, and Plans are all `hidden sm:inline-flex`, i.e. removed below 640px. There is no hamburger, no drawer, nothing else. The home page inline links reach only Story (`src/pages/[lang]/index.astro:93`) and Our Lady (`index.astro:100`) — **no page anywhere links to Plans except the desktop nav** (verified: only `Layout.astro:93` and the page itself reference it). The footer (`Layout.astro:276-315`) contains only Instagram and language links.

Consequence: on any phone, Plans is a dead URL (unless typed by hand), and the story/ourlady content is hidden two taps deep behind the home page. The "inform visitors" primary mission from `PRODUCT.md` fails on the device most of the audience uses.

Fix: add a real mobile menu (hamburger → sheet with Story / Our Lady / Plans / Support), or at minimum add a Plans link on home next to `index.astro:93-103` and site nav links in the footer. There is no scenario where a public page is unreachable by navigation on the primary device class.

### 2. BLOCKER — The home page never makes the support argument, and the EN copy claims the chapel is finished — which kills the donation motive outright

`src/i18n/content.ts:4` (EN): *"An old forge … opened as a quiet chapel for everyone."* — past/present, sounds done. `content.ts:264` (NO): *"En smie i Gudbrandsdalen som omgjøres til kapell"* — being converted, ongoing. The two languages tell different stories on the same page.

The entire fundraising premise lives in the story/plans CTAs ("The chapel isn't finished yet", `content.ts:73-74`, `content.ts:191-192`). But the English home — the entry point for any English-speaking Instagram follower — states the chapel already exists and is open. A visitor who believes the chapel is done has no reason to donate. Meanwhile the designed-but-dropped copy strings `idx.whatHeading` ("A quiet room, for everyone." — `content.ts:11`) and `idx.support` ("Support us" — `content.ts:30`) are **never rendered anywhere**; the home was designed to carry a "what it is" headline and a support CTA, and both were removed. The only CTAs on home are Google Maps (twice) and Instagram (twice) (`index.astro:48,57,119,130`).

Fix: rewrite the EN intro to the ongoing-build framing (mirror the NO copy), and add a support card to the visit section (`index.astro:111-140`) — e.g. "The chapel isn't finished yet — help us build it out" with a `Support us` button. This is the single change with the largest conversion upside because home is the funnel entry for every mobile visitor.

### 3. HIGH — Site copy contradicts the product's own documented facts; donors are being told things the maintainers know are unverified

`PRODUCT.md` (Operating Context) states: **"walls and roof are complete, with windows, floor, stained glass, and seating still to come"** and "All current site copy is AI-generated and not fully accurate," and explicitly instructs: *"must flag unverified claims (e.g., 'every krone goes straight to the building, no overhead') rather than propagate them."*

The site propagates exactly that claim verbatim in three places: `content.ts:74` (story cta.body), `content.ts:192` (plans cta.body), `content.ts:210` (support.body). It also claims *"The inside is done and the chapel is already in use"* (`content.ts:65-66`, story EN intro; `content.ts:123`, plans EN intro) and *"Kapellet er alltid åpent"* (`content.ts:129`) — against a documented reality of no windows, no floor, no stained glass, no seating, and no published visiting logistics. A visitor who reads "always open / inside is done" and drives to Ledum will find an unfinished shell — the fastest way to destroy donor trust in a small, personal fundraiser.

Fix: rewrite all copy to match the documented build state (interior under construction; roof/walls complete; stained glass in production), strip the "no overhead/no admin" claim unless it is verified, and qualify the "always open" claim (or drop it until visiting logistics are published). This is a factual-integrity issue, not just copy polish.

### 4. HIGH — Language switching and logo clicks destroy context and can bounce English users into Norwegian

`Layout.astro:103-110` — the header switcher hardcodes `/capellareginaenorvegiae/no` and `/capellareginaenorvegiae/en` (the home pages). `Layout.astro:308-311` — the footer duplicates this. So a user reading the English story who taps "NO" lands on the Norwegian homepage, losing their place mid-narrative. `Layout.astro:64` — the logo links to `/capellareginaenorvegiae`, which meta-refreshes to `/no/` (`src/pages/index.astro:1`); an English visitor clicking the logo mid-journey is dumped into Norwegian.

Fix: compute the sibling-URL for the current path (`/${targetLang}${currentPathWithoutLang}`) for the switcher, and have the logo point to the current language home.

### 5. HIGH — The support page is a single-action QR wall with no desktop path, no context, and a dead end after donating

`src/pages/[lang]/support.astro:40-47` — the entire conversion is a static PNG QR code (`capella_vipps_qr.png`). Desktop users (the majority on a desktop-built site) must fetch a phone mid-page; there is no Vipps payment link, no bank-transfer fallback, no amount suggestions, no recurring option. The page contains zero links to Story/Plans ("what the money buys" is never stated on the page itself — `support.astro` only links back home, line ~118). The "Raised so far" figure is formatted with the `nb-NO` locale even on the English page (`src/lib/vipps.ts:29` — `toLocaleString("nb-NO")`), and if the hourly GitHub Actions rebuild loses Vipps credentials the total silently drops to the 413 800 kr baseline with no "last updated" timestamp anywhere on the page.

Fix: add a "Donate via Vipps" button linking to a Vipps payment URL, an anchor to the Plans page ("what your money builds"), and locale-aware amount formatting; show a "last updated" line.

### 6. MEDIUM — The footer is a journey dead-end

`Layout.astro:276-315` — on a story page with seven sections (`content.ts` story.sections) or plans with six blocks, a scrolled-to-bottom visitor finds only Instagram, language links, and "© 2026". No navigation to the other content pages, no support CTA. Every long page terminates in a brick wall except where a mid-page CTA exists.

Fix: add Story / Our Lady / Plans / Support links (or a support CTA button) to the footer, matching the nav.

### 7. MEDIUM — Story buries its strongest conversion argument behind a very long scroll

`src/pages/[lang]/story.astro:96-115` — the "The chapel isn't finished yet" CTA appears only after seven text-heavy sections. The before/after slider (`story.astro:23-35`) is the strongest visual proof but sits below the header fold on mobile. Also `story.astro:18` applies `reveal` (opacity 0 until JS runs — `global.css:332-338`), with **no noscript fallback**; if the IntersectionObserver script fails or JS is disabled, the entire story header is invisible.

Fix: insert a support CTA after the "What the money goes to" section (mid-page), and add a `<noscript>` rule making `.reveal` visible without JS.

### 8. MEDIUM — Ourlady ends in a conversion and narrative dead end

`src/pages/[lang]/ourlady.astro:118-125` — the page ends with "Back to home" only. Its final content block is "Visiting — message us on Instagram" (`content.ts:240-244` EN), which is itself a funnel to a private channel instead of an on-site next step. A visitor emotionally engaged by the dedication story has no path to support or to the build story.

Fix: end with the same support CTA block used on story/plans, plus a link to the story page.

### 9. MEDIUM — Home's "what it is" section is textless

`src/pages/[lang]/index.astro:67-110` — three full-bleed photos with alt text only, no captions, no heading (the designed `whatHeading` string is dead). For the primary audience ("learn what the chapel is and how to visit"), the definition of Mariaslæen, the project, and the current build state is entirely absent from the home page's middle; only the hero one-liner and the visit card carry prose.

Fix: restore `whatHeading` plus one or two sentences (build state, open to everyone, no entry fee) over/under the photo band.

### 10. LOW — Miscellaneous journey friction

- **No 404 page** (`src/pages` contains only the five routes) — mistyped URLs get GitHub's generic English 404, an English-language dead end on a Norwegian-default site.
- **Theme switcher noise** (`Layout.astro:128-226`) — a fixed bottom-right palette button with eight themes floats over every page, including the support page, competing with the conversion CTA; it's a toy bolted onto a small trust-driven fundraiser.
- **Before/after labels read backwards** (`BeforeAfterSlider.astro:36-49`) — "After" is pinned top-left, "Before" top-right, opposite of LTR reading order; users must decode the slider before it persuades them.
- **Duplicate `class` + `class:list`** on the language links (`Layout.astro:103-104`) — works, but is fragile and confusing.

---

### Weakest link and the highest-leverage fix

The weakest link is the **home page**, not any single CTA: it is the funnel entry for essentially all mobile traffic (the only way into story/ourlady on phones), it never states the chapel is unfinished and needs help, and its English copy actively asserts the opposite. Every downstream conversion page is fine; almost nobody reaches it with a reason to donate. Fixing the home messaging (truthful under-construction framing + an inline support CTA + a Plans link) would do more for conversion than anything else. Fixing the missing mobile navigation is the second priority.

## Acceptance Report

**criterion-1 (concrete findings with file paths and severity): satisfied** — ten findings above, each with file, line/selector, mechanism, and a concrete fix; two blockers, three high, four medium, and low-severity notes. Evidence includes dead-copy verification via grep (`whatHeading`, `idx.support`, `nav.plans` referenced only in the desktop nav) and product-truth cross-check against `PRODUCT.md`.

**Residual risks:** copy/factual accuracy is unverifiable from the repo alone (PRODUCT.md itself flags all copy as provisional AI text; physical build state, "always open" claim, and the "no overhead/no admin" claim require owner confirmation). Vipps QR validity, YouTube embed availability, and donation-total freshness depend on external services/credentials not reviewable here. Mobile-nav and home-copy fixes are recommendations; none were applied (review-only task).

**Commands:** none run (read-only review; shell use is outside reviewer tooling). `noStagedFiles: true` — no files modified or staged.