---
target: the homepage
total_score: 28
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 2
timestamp: 2026-08-05T13-12-47Z
slug: src-pages-lang-index-astro
---
# Critique: Home page (src/pages/[lang]/index.astro)

Target: the home page (plus the story/about/support surfaces of the same restructure, which share the system).

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No active-state marker on the current page in the nav; otherwise a static page with no async state to report |
| 2 | Match System / Real World | 4 | Plain Norwegian/English, no jargon; "Mariaslæen", "Ledum", Vipps are the user's own language |
| 3 | User Control and Freedom | 4 | Back links on every subpage, external links open in new tabs, no traps |
| 4 | Consistency and Standards | 3 | The same action (map CTA) appears with three button treatments (white hero, primary panel, white close); system otherwise consistent |
| 5 | Error Prevention | 2 | Primary CTA points at an unpinned Google Maps search query — the core promise ("how to get here") is not anchored to the actual listing |
| 6 | Recognition Rather Than Recall | 4 | All actions visible and text-labeled; Instagram handle explicit |
| 7 | Flexibility and Efficiency | n/a | Persuade landing page; no expert accelerators expected |
| 8 | Aesthetic and Minimalist Design | 3 | Genuinely minimal text; two actions in the hero and a below-fold reassurance dilute the single-decision ideal; photo assets are currently below the scale they're shown at |
| 9 | Error Recovery | 3 | Static page; support data falls back to Spleis gracefully at build |
| 10 | Help and Documentation | 2 | Instagram message is the only help channel and isn't framed as help; no visiting details beyond "always open" |
| **Total** | | **28/36** | **Good** (77.8%; heuristic 7 n/a) |

## Design Specificity Verdict

**LLM assessment:** The composition is a familiar landing template (photo hero → gallery → map panel → CTA close), but it is product-authored: the interior light, the stained glass, the Ledum farm facts, and Instagram-as-contact are this chapel's specifics, and the visual language is the incumbent identity (Newsreader italic display, warm Fjord tokens, rounded-2xl frames). Differentiation currently rides entirely on the photography, which is placeholder-grade at the scales used — the honest constraint is the pending photo batch. Missed product character: the forge/smie heritage (iron, fire, the blacksmith's open door) is unused as texture, and the Caveat sketch voice (font-sketch) that exists in the system appears nowhere on the home page.

**Deterministic scan (CLI):** 2 warnings, both in Layout.astro and incumbent: `overused-font` (Plus Jakarta Sans — the system body face) and `flat-type-hierarchy` (12/14/16/20 steps). Preserved per the pinned brief.

**Browser overlay (headless injection):** detector injected and ran on all four routes (11/12/8/17 findings). Real findings: home — `cramped-padding` on the two map CTAs; story — `nested-cards` (my slider wrapper is a card inside the article card), `hero-eyebrow-chip` above the h1, `low-contrast` 3.9:1 on the slider Før/Etter labels; support — `tiny-text` 10px donor messages, `tight-leading`, and `text-overflow` up to 536px on truncated donor-message spans. False positives: hero h1/intro `low-contrast` 1.1:1 (detector sampled the photo-gradient text against the body background #fbf9f4 instead of the image), `italic-serif-display` (the pinned Newsreader voice), all `ai-color-palette`/`gradient-text`/`bounce-easing`/`layout-transition` (incumbent theme switcher swatches). No human-visible overlay tab could be presented in this harness (no browser-presenting tool); the fallback signal is the headless injection result above.

## Overall Impression

The right page for the brief: photo-led, minimal text, and the action hierarchy is correct. The single biggest opportunity is the first viewport — it should answer the visitor's actual question ("can I just walk in, and where is it?") in one breath. Right now the map CTA is unpinned and the always-open reassurance sits below the fold.

## What's Working

1. **The photo-led sequence with minimal text** — the brief's core demand, executed faithfully; the gallery now reads as a wall, not cards, and text recedes exactly as steered.
2. **One clear primary action per viewport** (map CTA at hero and panel; support demoted to the close) — a Persuade page that knows its one job.
3. **The close** — full-bleed best-light photo with the Instagram handle and a quiet support link is a strong peak-end finish.

## Priority Issues

- **[P1] The primary CTA points at an unpinned Google Maps search query.** The hero and the getting-here panel both link to a search query (`query=Ledum+Gård+Gudbrandsdalen`), not the chapel's pinned listing. Why it matters: the page's core promise is "how to get here"; a generic search page can show the wrong place or nothing, and first-timers (and Google Maps discoverers) lose trust instantly. Fix: replace with the pinned listing URL from the client. Suggested command: `$impeccable harden` (after the URL arrives) — this is the single most important input the client must supply.
- **[P1] The "always open" reassurance is below the fold.** The barrier-lowering fact ("Kapellet er alltid åpent.") lives in the getting-here panel, one full section after the visitor decides. Why it matters: the deciding question at the first viewport is "can I just go?" — the answer should sit next to the invitation, not after it. Fix: move the fact into the hero microcopy under the intro (and keep the panel line). Suggested command: `$impeccable layout` or `$impeccable polish`.
- **[P2] Photo assets are below the scale they're shown at.** The hero is a 768×1024 portrait upscaled across a 92vh full-bleed frame; the gallery feature (1304×602) and aerial (1200×864) soften at 68vh/48vh widths. Why it matters: photography is the entire argument; soft pixels read as unprofessional on a Persuade page. Fix: prioritize high-resolution captures for the hero, feature, and close slots in the incoming batch; keep the composition fixed. Suggested command: `$impeccable polish`.
- **[P2] Support page donor rows: 10px text, tight leading, broken truncation (detector-caught).** Donor messages render at 10px with `leading-tight` (1.25×) and their `truncate` fails — spans overflow their rows by up to 536px, blowing out the layout at long strings. Why it matters: the support page is the product's honesty surface; cramped, overflowing donor copy undermines it. Fix: bump to 11-12px, `leading-snug`, and constrain the message span with `min-w-0`. Suggested command: `$impeccable polish` (or `$impeccable typeset`).
- **[P2] Story page: card-in-card slider wrapper (detector-caught).** The before/after slider I added is wrapped in `bg-surface-container-lowest p-3 shadow-md` inside the article card — nested cards, which the craft floor bans. Fix: drop the wrapper (the slider already frames itself). Suggested command: `$impeccable polish`.

## Persona Red Flags

**Jordan (Confused First-Timer):** The first viewport says what it is and offers the map — good. But Jordan never learns "free, no entry, always open" until scrolling past the whole gallery; at the deciding moment the reassurance is absent. The hero's second action ("Questions? Message us on Instagram") also competes with the map CTA when Jordan wants one clear next step. Moderate abandonment risk.

**Riley (Deliberate Stress Tester):** Clicks "Slik finner du hit" → lands on a generic Google Maps search page, not the chapel — the pinned location is the entire point and it's missing. On the support page, a long donor message ("Kjære alle, «Vår Frue av Gudbrandsdalen» bli…") overflows its row by 536px — Riley finds broken layout at long strings immediately. Two concrete, reproducible breaks.

**Casey (Distracted Mobile User):** The photo-heavy page is heavy but optimized (webp); the hero CTA sits in the thumb zone (bottom of the 88vh hero). No severe flags; the main cost is vertical scroll before practical info — acceptable for a Persuade surface.

## Minor Observations

- No meta description in the layout (only title) — a real gap given the stated Google-search traffic goal.
- No active-state marker on the current nav item.
- The getting-here panel is the page's only utilitarian beat — a soft valley after the visual peaks (acceptable, but a map-first treatment would keep the momentum).
- The story page's eyebrow chip ("Gudbrandsdalen, Norge" above the h1) is a craft-floor ban carried over from the incumbent page.
- The Caveat sketch voice is unused on the home page — one small annotation could add product character without text volume.
- Hero text readability depends on the dark gradient staying strong over the incoming photo batch — verify with the new hero.

## Questions to Consider

- What if the first viewport answered "can I just walk in?" — always open paired directly with the map action?
- What if the forge's open-door heritage became one authored detail (a sketch annotation, a line of microcopy) instead of only the photos speaking?
- What would the page look like if the getting-here panel were map-first rather than text-first?
