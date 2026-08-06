---
target: the story page, especially given the decision to use more images rather than words
total_score: 27
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
timestamp: 2026-08-06T16-52-49Z
slug: src-pages-lang-story-astro
---
# Design Critique — Story page (`src/pages/[lang]/story.astro`)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Nav active state now marks the current page; slider communicates position; static surface otherwise |
| 2 | Match System / Real World | 4 | Plain, warm language; smia explained inline; no jargon |
| 3 | User Control and Freedom | 4 | Back links top and bottom, no traps, slider fully reversible |
| 4 | Consistency and Standards | 3 | Same system across surfaces, but the support CTA button is py-3.5 here vs py-2.5 on home |
| 5 | Error Prevention | 4 | Static content, no inputs, nothing to break |
| 6 | Recognition Rather Than Recall | 3 | All actions labeled; slider hint says only "drag" — keyboard path invisible |
| 7 | Flexibility and Efficiency | n/a | Static narrative; no power-user task |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and readable, but text-first against the photo-led direction; 11 paragraphs, small images |
| 9 | Error Recovery | 3 | Static page; slider is the only stateful widget and recovers by nature |
| 10 | Help and Documentation | n/a | No help need on a static story |
| **Total** | | **27/32** | **Good** (84%) |

## Design Specificity Verdict

**LLM assessment:** The story page is product-authored in voice — the copy is unmistakably this chapel (smia, "we said yes", the weather-and-stone line, "four people and a stone room"), and the section icons follow the construction arc (forge → lightbulb → group → building site → church). But the *composition* is the generic "our story" template: h1 → intro → one continuous card of five identical icon+heading+paragraph blocks → CTA. Any unrelated project could use the skeleton unchanged; the specificity lives in words and photos, not in structure. Against the site-wide decision that photos do the talking, this page — the one surface the brief assigned construction imagery to — is the most word-heavy page on the site.

**Deterministic scan:** CLI detector: 0 findings on `story.astro`. Browser overlay (no/story + en/story): findings are all known system noise — the theme-switcher Cyan/gradient/bounce cluster (incumbent), the italic serif h1 (the owned Fjord display voice), cream background and Plus Jakarta overuse (pinned incumbent traits), layout-transition (theme panel). One genuine nit: 8 em-dashes in the English copy (em-dash-overuse) — a copy-level item, already on the pending-revision list. All previously fixed issues stayed fixed.

**Visual overlays:** Browser injection succeeded and the detector ran in the rendered page, but this harness is headless — no human-visible `[Human]` overlay tab could be presented. Fallback signal: structured findings extracted from the injected `impeccableScanAsync()` in the page.

## Overall Impression

The story page is the warmest, most human page on the site — the copy genuinely makes you care about an old forge. Technically it is clean (detector: zero). The gap is not quality, it is direction-fit: the site decided photos carry the argument, and the story page — where the construction story lives — still leads with paragraphs. The before/after slider is the strongest moment and is the only large visual. The single biggest opportunity: give the construction imagery the same screen real estate the home page gives the finished chapel, and let the story's emotional arc set the layout rhythm instead of five identical blocks.

## What's Working

1. **The narrative voice.** "He'd heard about the forge his whole life… he had a specific thought: this should be a chapel." "We said yes." The copy is the product's own language — no template voice anywhere.
2. **The emotional arc lands.** Waiting building → idea → friendship → grit → light through stone walls → invitation to help. The peak-end rule is well served: the page ends on hope and a concrete, low-friction ask.
3. **The before/after slider is a genuinely good artifact** — drag the handle and the forge becomes a chapel. It is the strongest visual on the page, fully keyboard-operable (arrows, Home/End), labeled with aria, and its new bg-black/70 labels clear contrast.

## Priority Issues

- **[P1] The story under-invests in the imagery the brief assigned it.** What: 11 paragraphs vs 3 images. `alle_fire.jpg` (4032×3024) and `klem.jpg` (3072×4096, portrait) render at 256px in fixed `object-cover` boxes — the portrait is heavily cropped — and only the slider gets real scale. Why it matters: the user's direction is "images rather than words," and this is the page meant to carry construction evidence; at current scale the photos read as thumbnails in a text wall. Fix: give the construction photos the same large-band treatment the home page gives the finished-state photos (full-width or tall two-up), make the slider a full-width band, and leave slots ready for the incoming photo batch. Suggested command: `$impeccable layout`.

- **[P2] Uniform card rhythm flattens the emotional arc.** What: five identical icon+heading+paragraph blocks in one continuous rounded card; the layout doesn't change as the story rises. Why it matters: the arc (hope → grit → light) is the point of the page, but visually every section weighs the same. Fix: let the two photo moments and the slider alternate with text bands (or break the card), so construction evidence lands with weight at the "what we've done" turn. Suggested command: `$impeccable layout`.

- **[P2] Dead styling hook: `prose-custom`.** What: story.astro line 49 applies `prose-custom` to the opening section, but the class is defined nowhere in the CSS — the intended authored treatment (likely a drop cap on "The building") doesn't exist. Fix: define it (a drop cap is a classic Read-mode touch and would give the opening section presence) or remove the reference. Suggested command: `$impeccable typeset`.

- **[P3] Section icons leak into the accessibility tree.** What: `<span class="material-symbols-outlined">{section.icon}</span>` has no `aria-hidden` — screen readers read the ligature text ("lightbulb", "construction", "church"…) before every h2 (the CTA icons already have `aria-hidden`). Fix: add `aria-hidden="true"` to the section icon spans. Suggested command: `$impeccable audit`.

- **[P3] Slider hint hides the keyboard path.** What: the hint says only "Drag to see before and after", but the component fully supports keyboard (arrows, Home/End, role=slider). Fix: extend the hint ("drag or use arrow keys") — cheap and true. Suggested command: `$impeccable audit`.

- **[P3] Primary-CTA padding drift.** What: the support button on story is `py-3.5` while the home primary CTAs are `py-2.5` — the same action (support) renders slightly differently per surface. Fix: unify. Suggested command: `$impeccable polish`.

## Persona Red Flags

**Jordan (First-Timer):** No major failures — arrives from Instagram, h1 is clear, the story reads in order, the end CTA is explicit. The only stumble: the slider's "drag" hint assumes touch before the keyboard path is offered; on a desktop Jordan may never discover the handle is a control. Low risk.

**Casey (Distracted Mobile):** The whole story is one long card — 11 paragraphs of scrolling text with two small photos interrupting. Interruption risk is high: Casey leaves mid-scroll, returns, and has no anchor to resume (no section markers, no progress cue). The support CTA requires reaching the very bottom; interrupted readers may never see it. Higher-risk than the page's clean look suggests.

**Sam (Accessibility):** Icon ligatures are read aloud before every heading ("lightbulb The building"), adding noise to every section. The slider is otherwise exemplary (role=slider, keyboard, labels). The section icons are the concrete failure.

## Minor Observations

- The English copy uses 8 em-dashes (detector: em-dash-overuse) — part of the authored voice, but trimming a few will tighten it; copy is already on the revision list.
- No temporal anchor in the copy ("since 2022", "three years of weekends") — orientation aid for first-timers; leave for the copy revision.
- Images all have meaningful alts (alleFireAlt, klemAlt, slider alt) — good.
- The font-sketch slider hint is the only Caveat voice on the page; if the site's sketches are a signature, the header could borrow one more (small, e.g. "From forge to chapel") for continuity.
- The h1 divider (w-16 hairline) matches the support page; consistent.

## Questions to Consider

- "The story page is the one place construction imagery belongs — why is it the most word-heavy surface on the site?"
- "What if the story was told as alternating image bands — every other block a full-width construction photo, words receding to captions?"
- "When the new photo batch lands, which section does each shot belong to — and is the current layout ready to receive them at scale?"
