# Adversarial Design Review — Capella Reginae Norvegiae

Read everything: `Layout.astro`, `global.css`, all five pages, both components, i18n content, product doc, dead files. No images could be viewed (no image support in this session), so photography judgment below is confined to what the containers and crop logic do to images, not the pixels themselves. Everything else is verified from source.

---

## BLOCKERS (must fix)

### 1. Mobile navigation collapses; the Plans page is unreachable on mobile
**Layout.astro:77, 86, 95** — all three primary links carry `hidden sm:inline-flex`. There is no hamburger, no mobile menu, no fallback nav. The footer (Layout.astro:299–311) only contains Instagram and the two language links. Below 640px, Story / Our Lady / Plans have **zero** navigation paths. And on desktop, Plans is reachable *only* through this header — no page links to Plans anywhere (home links only Story and Our Lady, index.astro:90–102).

This is not a minor cosmetic gap: it is the primary navigation of the site disappearing on the exact devices pilgrims will use at the roadside. Fix: add a proper mobile menu (off-canvas or a compact row), and/or add the four page links to the footer. Don't ship this.

### 2. The hotspot photo frame is broken at the CSS level — the Our Lady image has square corners
**global.css:576** — `.hotspot-image { border-radius: inherit; overflow: visible; }` is unlayered author CSS. Tailwind v4 puts utilities in `@layer utilities`; **unlayered rules beat layered rules regardless of order**. So on the figure in ourlady.astro:59 (`rounded-2xl shadow-xl overflow-hidden`), both utilities lose:
- `border-radius: inherit` replaces the `rounded-2xl` radius (the figure inherits `0` from `<main>`), and
- `overflow: visible` cancels the clipping, so the square-cornered `<Image>` pokes out of the intended frame.

The comment on the same line claims the opposite of what it does ("Keep hotspot dots from overflowing the rounded image corners" — this code *guarantees* overflow). The pulse ring (global.css:465, `inset: -7px` scaled 1.7×) and tooltips bleed past the photo edge. Fix: delete line 576 entirely, put the radius on the `<img>` itself or rely on `overflow-hidden` on the figure. Then actually verify the rounded frame renders.

### 3. Hotspot tooltip and label are invisible on 5 of the 8 themes
**global.css:522–523** — `.hotspot-card { background: var(--color-on-surface); color: var(--color-inverse-on-surface); }`. Every dark theme (natt/kull/solnedgang/aurora, and partially is) overrides `--color-on-surface` to a near-white value (e.g. natt `#e8f4ff`) but **none of them override `--color-inverse-on-surface`**, which stays `#f2f1ec` (light). Result: light text on a light card — the tooltip is unreadable in dark themes. Same disease in the label chip at **global.css:500**: hardcoded warm-white `rgba(251,249,244,.92)` background with `color: var(--color-on-surface)` → light-on-light in every dark theme.

Robust fix: flip to `background: var(--color-inverse-surface); color: var(--color-inverse-on-surface)` — both tokens are theme-invariant in this stylesheet (`#30312e`/`#f2f1ec`), so the card becomes dark-with-light-text on *all* themes. This is exactly the class of bug the 8-theme system manufactures.

### 4. Skip link is dead on 4 of 5 pages
**Layout.astro:57** — the skip link targets `#main-content`, which exists **only** on the home page (index.astro:29). story.astro, plans.astro, ourlady.astro and support.astro all render `<main>` without that id. Keyboard users activating "Hopp til innhold" on any interior page get nothing. Fix: add `id="main-content"` to the four `<main>` elements.

---

## HIGH

### 5. Logo and language switcher destroy language context
- **Layout.astro:64** — the wordmark links to `/capellareginaenorvegiae` (no language). pages/index.astro meta-refreshes that to `/no/`. Click the logo from the English page and you land on the *Norwegian* home page. It should be `/${lang}`.
- **Layout.astro:103, 108** — the NO/EN links always point at the language root. Switching from `/en/story` takes you to `/no/` (home), not `/no/story`. On a two-language site this is a daily-user footgun, and it makes the per-page underline/nav state feel like a mockup. Fix: translate the current pathname across languages.

### 6. The 8-theme switcher is a brand multiplier and a QA sink — it is already leaking
Each theme redefines the entire primary/secondary/tertiary identity (global.css:88–260). The site's actual art direction — slate blue + amber on parchment, warm daylight chapel photography — survives in exactly 1 of 8 themes. Natt's electric cyan, Aurora's magenta-on-teal, Solnedgang's neon orange fight the warm photographs (the photos are the argument; the chrome argues back). The maintenance cost is real and has already shipped breakage: Finding #3 above, plus the pulse animation only has variants for 5 of 7 custom themes (global.css:391–395; is and mose silently reuse the Fjord blue pulse — `.btn-pulse` isn't currently used in any page, so it's a latent trap).

Blunt take: either cut the set to 2–3 themes you actually QA in both languages, or accept that every theme adds a full pass of contrast/photo/tooltip work. The current middle state — 8 themes, 2 of them un-verified, 1 broken component — reads as unfinished.

### 7. Inverted display hierarchy: interior pages out-shout the home hero
Home hero H1 (index.astro:40) is `md:text-6xl`. Story (story.astro:30) and Plans (plans.astro:52) headers are `md:text-7xl`. The two interior pages have **larger** headlines than the flagship full-bleed hero. And across the four pages you have three different H1 scales (6xl home/ourlady/support, 7xl story/plans). The page you want to be the loudest is the quietest. Fix: unify — hero should be the max, interior headers one step down.

### 8. Home's second section is an unlabeled photo dump; the closing treatment was cut mid-stream
The gallery section (index.astro:66–105) has no heading, no caption, no context — two photos, then two serif links floating in space. The heading it was supposed to have exists in content and is dead: `whatHeading: "A quiet room, for everyone."` (content.ts:11). Likewise the planned Instagram end-card is gone but its copy survives dead (content.ts:27–29 `closeImgAlt/closeInstagram/closeInstagramLabel`), leaving a bare full-bleed bottom image (index.astro:150–157) with square corners and no caption — the one image that breaks the rounded-2xl photo system for no visible reason. Either restore the end-card or delete the keys; a bare bleed photo as the last statement looks like an abandoned draft.

---

## MEDIUM

### 9. Typography runs on two parallel systems; the header one is fragile
Pages use tokens (`font-headline`/`font-label`/`font-sketch` with fallbacks). The header, nav, and footer use arbitrary values: `font-['Newsreader']` (Layout.astro:67, 77, 86, 95, 116, 289), `font-['Plus_Jakarta_Sans']` (70, 300, 307), `font-['Epilogue']` (102). Arbitrary values compile to `font-family: Newsreader` — **no serif/sans fallback**. If Google Fonts is slow or blocked, the entire chrome renders in the browser default while the pages keep their intended faces. Fix: use `font-headline`/`font-body`/`font-label` in the layout too.

Worse: the Support pill (Layout.astro:116) is Newsreader italic, but the identical CTA role on every page (plans.astro:142, story.astro:102, index.astro:51) is an Epilogue label. Same role, two typefaces, in the same viewport. Pick one for the button role.

### 10. Hero CTA hierarchy is inverted
index.astro:46–65: the primary action "How to get here" is a `text-sm` Epilogue button; next to it, the secondary Instagram link is `text-lg` Newsreader italic with an underline. The *secondary* link is typographically louder than the *primary* CTA — contradicting the thesis comment in the layout ("the primary action 'How to get here'"). The button should dominate; the Instagram link should read as a quiet footnote.

### 11. Footer copyright fails contrast
Layout.astro:313 — `text-xs` + `text-on-surface-variant/60` ≈ `#8d8e90` on `#fbf9f4` ≈ **3.0:1**. Below 4.5:1 for 12px text on the default theme. Either drop the `/60` or bump the size.

### 12. Lightbox is bare-bones interactive furniture
plans.astro:157–190: no focus trap (keyboard focus can walk behind the dialog), focus is not moved into the dialog on open nor returned to the trigger on close, the close button is unreachable by keyboard until tabbed to it. The zoom affordance (`zoom_in` badge, plans.astro:128–130) is `group-hover` only — on touch there is zero hint that sketches open. Captions (plans.astro:190) just repeat the alt text, which is contentless ("Scale drawing of the chapel"). For a page whose sole purpose is looking at drawings, the viewer is the page — it deserves focus management and a visible affordance.

### 13. Before/after slider is theme-blind and JS-dependent
BeforeAfterSlider.astro:65–66 — the handle arrows are hardcoded `#36557b`. On Kull (copper) and Solnedgang (orange) themes the blue arrows visibly clash. The slider's `role="slider"`, `tabindex`, `aria-valuenow` are all attached from JS (BeforeAfterSlider.astro:68–74) — no JS means a static 50/50 crop with no semantics at all. Fine as a progressive enhancement, but the component should render the semantics server-side.

### 14. Dead code and unfinished artifacts ship in every page
- Layout.astro:28–38: a 700-word authorial THESIS essay in an HTML comment — shipped to every visitor, inflating every page.
- Dead CSS: `.btn-pulse` + 5 keyframes (global.css:380–395), `.timeline-line` (410), `.progress-bar-fill` (423–427 — Layout.astro:258–265 still queries it), `.reveal-delay-*` (341–343), `.btn-touch` (24).
- `Welcome.astro` is an empty shell.
- The comment (Layout.astro:55) promises "the finish review, the verdict, and DESIGN.md" — no DESIGN.md exists in the repo.

### 15. Scroll-reveal has no no-JS fallback
global.css:332–336 — `.reveal` starts `opacity: 0`; story and plans page headers are `.reveal` (story.astro:24, plans.astro:26). With JS disabled or IntersectionObserver unavailable, the entire page header never appears. `prefers-reduced-motion` (global.css:402) fixes the animation, not the missing JS. Gate the `opacity: 0` behind a `.js` class on `<html>`.

---

## LOW (worth noting)

- **Viewport meta** (Layout.astro:24) lacks `initial-scale=1`; **`<title>`** (Layout.astro:15) is identical on all five pages; no `theme-color`; themes don't sync `color-scheme` so scrollbars/inputs stay light in dark themes.
- **Support donor grid** (support.astro:63–85): `md:grid-cols-2` with a conditionally rendered second column — if "Recent activity" is empty the grid renders one lopsided column with an empty right half.
- **Plans sketch grid** (plans.astro:113–119): the "scale" group puts 5 images in `grid-cols-2 md:grid-cols-3` → ragged 3+2 final row, tiles at natural aspect → uneven row heights. Give the tiles a uniform aspect and `object-contain` on a neutral panel.
- **Hotspot hit target** is 36px (global.css:437) vs. the 44px floor used everywhere else.
- **Hero section label** `aria-label="The chapel"` (index.astro:32) duplicates the H1 context — harmless but noisy.
- The **"What it is" photo crops** are aggressive: `h-[44vh] md:h-[68vh]` object-cover on the side altar, 2:3 forced frames on closeup/chapelside, `h-[60vh]` bottom bleed — worth a human crop-check since object-cover will silently cut faces/candles.
- **Fundraiser amount** set in Caveat (support.astro:43) at 60px bold — the handwriting face works as an accent (slider hint, donor amounts) but anchoring the single most important number on the support page in a casual script undercuts "money must stay honest."

---

## What is genuinely right (with evidence)

- The token system is coherent where it's complete: M3-style surface hierarchy, primary/secondary/tertiary, per-theme `fundraiser-panel` overrides (global.css:160–260) — the most finished themed component on the site.
- Focus-visible styling (global.css:17–22), consistent 44px touch targets, skip link, and reduced-motion handling across reveal/pulse/slider/hotspot (global.css:400–405, 579) — the a11y *foundations* are above average.
- The before/after slider is genuinely keyboard-operable with live `aria-valuenow` (BeforeAfterSlider.astro:68–74) — better than most.
- The editorial stagger on story (story.astro:78, `md:mt-16`) and the 7/5 column split on ourlady (ourlady.astro:64–77) is well-considered art direction.
- Newsreader italic as the display voice is consistent across hero and every interior header — when the sizes are unified, that voice will hold.
- The single-hotspot interaction (tap-to-toggle with close-others) is simple and correct in behavior.

---

## Residual risks

1. **Images not visually verified.** I could not render the photos in this session. The aggressive object-cover frames (2:3 forced portraits, 44vh/68vh crops, full-bleed hero and bottom) can silently destroy compositions; the hotspot's crown position (49%, 18%) needs a human eye on the actual artwork.
2. **No interactive run.** Lightbox, hotspot, slider, and theme switching were verified from source only. A click-through in both languages across all 8 themes is required before calling this finished — especially finding #2 and #3, which are invisible in static inspection of a single theme.
3. **Theme count vs. QA budget.** The review found one component already broken in dark themes; there will be more. Budget a full theme × component matrix or shrink the set.

Suggested commands for the supervisor (not run here — read-only review): `bun run build` and `bun run astro check`.

---

## Review
- Correct: token architecture, focus/reduced-motion foundations, keyboard-operable slider, editorial image staggering, consistent Newsreader display voice.
- Fixed: none applied — this is a review-only task, no files were changed.
- Blocker: (1) mobile nav collapse + unreachable Plans; (2) broken hotspot photo frame (global.css:576); (3) invisible hotspot tooltip/label on dark themes (global.css:500, 522–523); (4) skip link dead on 4/5 pages.
- Note: 8-theme switcher, language-context bugs, inverted H1 scale, unlabeled home gallery, dual typography systems, dead code/design-doc drift — see prioritized list above.