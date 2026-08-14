# Adversarial Accessibility Review — Capella Reginae Norvegiae

Audited source directly: `Layout.astro`, `global.css`, `BeforeAfterSlider.astro`, `HotspotImage.astro`, all five `src/pages/[lang]/*.astro`, `i18n/content.ts`, `i18n/ui.ts`, `i18n/utils.ts`. Contrast ratios below are hand-computed from the hex tokens; verify the borderline ones with axe/Lighthouse before shipping.

---

## The worst problems first

### 1. BLOCKER — The skip link is a dead anchor on 4 of 5 pages
`src/layouts/Layout.astro:57` renders `<a href="#main-content" class="skip-link">`, but `id="main-content"` exists **only** on `src/pages/[lang]/index.astro:29`. `plans.astro`, `story.astro`, `ourlady.astro`, and `support.astro` all have `<main>` without the id (verified by grep: one hit in index, one in Layout). Keyboard users on every non-home page press Enter on "Hopp til innhold" and nothing happens — focus doesn't move, the page doesn't scroll. **WCAG 2.4.1 Bypass Blocks fails on 4 of 5 pages.**
Fix: add `id="main-content"` to each page's `<main>`. One-liner per file.

### 2. BLOCKER — Theme switcher kills its own focus indicator
`Layout.astro:193` in `updateActive()`:
```js
btn.style.outline = isActive ? "2px solid currentColor" : "none";
```
An inline `outline: none` **overrides** the stylesheet rule `:focus-visible { outline: 3px solid var(--color-primary) }` (`global.css:6`), because inline styles beat any selector. So every non-active theme button has zero visible focus ring, and after you click a theme, `updateActive()` strips the outline from the button you just focused. **WCAG 2.4.7 fails — keyboard users navigating the 8-theme panel see no focus indicator at all.** There's also no focus retention issue yet, but this makes the panel effectively keyboard-invisible.
Fix: don't use `outline` for selection. Use a visible checkmark + `aria-pressed`, or a `box-shadow`/inset ring for the selected state, and leave the CSS `:focus-visible` outline untouched.

### 3. BLOCKER — Plans lightbox is a fake modal (no focus management)
`src/pages/[lang]/plans.astro:160-179` declares `role="dialog" aria-modal="true"` but:
- On open, focus is never moved into the dialog (stays on the trigger behind the `bg-black/85` overlay).
- No focus trap — Tab walks out into the background page.
- Background is neither `inert` nor `aria-hidden`, so screen-reader users can navigate the page behind the modal while it's open (violates the ARIA modal-dialog authoring practice; **WCAG 4.1.2**).
- On close, focus is not returned to the triggering button.
- The Escape handler closes even when the lightbox was never opened (harmless, but sloppy).
Fix: on open, `lbClose.focus()`; add `inert` to `#main-content` (and the header/footer) while open, or toggle `aria-hidden` on siblings; on close, return focus to the button that was activated.

### 4. BLOCKER — Theme toggle `aria-expanded` goes stale
`Layout.astro:205-210` (toggle click) updates `aria-expanded` correctly, but the outside-click handler (`:233-237`) and the theme-button click handler (`:215-225`) both close the panel **without** resetting `aria-expanded="false"`. After a mouse user clicks away, the toggle still announces "expanded" while the panel is closed. **ARIA state mismatch, WCAG 4.1.2.** Fix: extract one `closePanel()` that hides the panel *and* sets `aria-expanded="false"`, call it from all three places. Also add Escape-to-close while the panel is open.

### 5. BLOCKER — "Solnedgang" theme: primary CTAs at ≈2.75:1
All `bg-primary text-on-primary` buttons (home `visitCta`, story/plans/support "Support the chapel" CTAs, nav "Support us" active state) use white on `--color-primary: #ff7040` in the solnedgang theme (`global.css:218-219`). White on #ff7040 computes to **≈2.75:1** — fails even the 3:1 large-text threshold, catastrophically fails 4.5:1 for the 14px `font-label text-sm` labels. This is the single worst contrast problem on the site and it hits every conversion path.
Fix: make solnedgang's `--color-on-primary` dark (`#2a0a00`-ish) or deepen the primary token so white passes.

### 6. BLOCKER — "Kull" theme: white on #d45828 ≈4.0:1
Same CTA pattern, `--color-primary: #d45828` (`global.css:180-181`). White on it ≈ **4.0:1** — fails 4.5:1 for the text-sm button labels. Also the Kull theme-panel button label itself (`Layout.astro:142`, `#d45828` on `#201c18`) is ≈ **4.2:1** — fails. Fix: darken on-primary, or use a darker primary (`#b8441e`-ish).

### 7. BLOCKER — "Plans" page is unreachable on mobile
`Layout.astro:77,86,95`: Story, Our Lady, and Plans nav links are `hidden sm:inline-flex` — gone below 640px. There is **no hamburger menu**. The home page links only to story and ourlady; the Support button is always visible; the footer has only Instagram and the language switcher. So on any viewport <640px, **the Plans page has no inbound link anywhere in the site**, and from a mobile subpage (e.g. ourlady) the only exits are "Back to home", Instagram, and Support. This is a fundamental navigation/operability failure for a large share of real users (and for anyone using a narrow keyboard-focusable window). Fix: add a proper disclosure/menu button that reveals these links below `sm`, with `aria-expanded`/`aria-controls`.

### 8. BLOCKER — Before/After slider has no accessible name
`BeforeAfterSlider.astro:85-86` fabricates the label from `closest("[aria-label]")` — on the story page there is no such ancestor, so the `role="slider"` (set at `:81`) ends up unnamed. Meanwhile `i18n/content.ts` already defines `slider.ariaLabel: "The chapel before and after"` — **defined and never wired**. **WCAG 4.1.2 fails.** Fix: accept an `ariaLabel` prop, use it, and `aria-describedby` the `#slider-hint` paragraph. While you're in there: the two `<Image>` elements inside the slider carry alts (`"… before"`/`"… after"`) that get announced **on top of** the slider value — hide the images from the a11y tree (`alt=""`/`aria-hidden`) since the slider control now carries the meaning.

### 9. BLOCKER — Slider focus ring is clipped into invisibility
`story.astro:31-34` wraps the slider in `<div class="overflow-hidden rounded-2xl shadow-2xl">`. The slider's `:focus-visible` outline (3px outside its border box, `global.css:6-8`) lies entirely outside the wrapper's clip region → **no visible focus indicator** when the slider is keyboard-focused. **WCAG 2.4.7.** Fix: drop `overflow-hidden` from the wrapper (round the component itself, which it already does via `rounded-sm` on the slider and the wrapper image rounding), or give the slider an inset focus treatment (`box-shadow: inset 0 0 0 3px …`).

### 10. HIGH — Footer copyright at ≈3:1
`Layout.astro` footer: `© 2026 Mathias and his companions.` is `text-xs` (12px) at `text-on-surface-variant/60` — 60% of #43474e over #fbf9f4 ≈ **3.0:1**. Fails 4.5:1 by a mile. Fix: full-strength `text-on-surface-variant` (8.8:1) or at minimum /80.

### 11. HIGH — Home "Read the story" / "Meet Our Lady" links at ≈4.4:1
`index.astro:118,125`: `text-primary/80` at 18px, normal weight (italic, not bold) — #36557b at 80% over #fbf9f4 ≈ **4.41:1**, just under 4.5:1 for normal text. Fix: `text-primary` (7.0:1). No reason to be cute with opacity on navigational links.

### 12. HIGH — Hotspot tooltip content is invisible to screen readers, plus ARIA misuse
`HotspotImage.astro`: each button has `aria-label={h.label}`, which **replaces** the button's content name — so the `role="tooltip"` card inside (`<span class="hotspot-card" role="tooltip">` with `title`/`body`) is dropped from the accessibility tree entirely. A SR user hears only "Kronen", never "Marias krone — i stilen av en bunadskrone". Also:
- `role="tooltip"` on a child of its own trigger is invalid — a tooltip must be referenced via `aria-describedby` from the owning element.
- `aria-expanded` is the wrong semantic for a tooltip; and the CSS shows the card on `:hover` even when `aria-expanded="false"` — the exposed state and the attribute disagree.
Fix: give the card an `id`, put `aria-describedby` on the button, drop `role="tooltip"`/`aria-expanded`, and remove the `aria-label` override (or fold the body text into it).

### 13. HIGH — Hotspot strings are untranslated on the English page
`i18n/content.ts` (en.ourlady.hotspots): `label: "Kronen"`, `title: "Marias krone"`, `body: "i stilen av en bunadskrone"` — Norwegian text announced on an `lang="en"` page. **WCAG 3.1.2 language-of-parts** and a straight localization bug. Fix: localize the hotspot array in the `en` content block.

### 14. HIGH — All 9 lightbox triggers share one name
`plans.astro:113`: every `data-lightbox-btn` gets `aria-label={pl.zoomLabel}` ("View image larger"). Nine identical buttons, and the informative image alt inside is overridden away. Fix: name them `"View image larger: <alt>"` per image (or drop the aria-label and let the inner `<img alt>` become the name).

### 15. MEDIUM — Zoom affordance is hover-only
`plans.astro:118-121`: the zoom chip is `opacity-0 group-hover:opacity-100`. Keyboard users who focus the button see nothing change (no focus-visible equivalent), and touch users have no affordance at all. Fix: add `group-focus-visible:opacity-100`.

### 16. MEDIUM — `.reveal` hides content when JS fails
`global.css` `.reveal { opacity: 0; … }` with `.visible` added only by the IntersectionObserver (`Layout.astro:252-263`). Story and Plans page headers carry the `reveal` class — without JS (or if the observer throws), **the h1 and intro never appear**. The `prefers-reduced-motion` override rescues reduced-motion users but not no-JS users. Fix: gate on a `js` class on `<html>` (only then apply `opacity: 0`), or add a `<noscript>` stylesheet forcing `opacity: 1`.

### 17. MEDIUM — Language switcher nits
- `Layout.astro:104`: `role="group" aria-label="Language"` — hardcoded English, announced on the Norwegian page; should be `Språk`/`Language` per locale.
- Header links do set `lang="no"`/`lang="en"` (good), but the **footer** language links (`:318-320`) don't — a Norwegian screen reader will voice "English" with Norwegian pronunciation. Add `lang` attributes. Add `hreflang` on both.
- Neither switcher marks the current language with `aria-current="page"`.
- The header switcher navigates to the *home page* of the other language, losing the current page — from `/no/plans` you land on `/en`. Preserve the page path.

### 18. MEDIUM — Minor ARIA/name pollution in theme panel
- The `✓` check (`Layout.astro:134` etc.) is visible text inside the buttons → button names announce as "Fjord ✓". Add `aria-hidden="true"`.
- No `aria-pressed` on theme buttons (selection is conveyed only visually). Either add it or `aria-checked` with `role="radio"` in a labelled group.

### 19. LOW — Hotspot touch target 36px
`global.css` `.hotspot { width: 36px; height: 36px; }` — under the 44px target (WCAG 2.5.5 AAA; passes the WCAG 2.2 AA 24px minimum). Bump to 44px and keep `-webkit-tap-highlight-color` intact (currently `transparent`, which also suppresses the tap focus cue on iOS).

### 20. LOW — Hero white-text contrast is a gamble
`index.astro:37-46`: the scrim is `to-black/75 via-black/25 to-black/15` — at the top of the h1 block (which spans `max-w-3xl` up into the image) the overlay is only ~25%, so white 4xl text over a bright sky/stone area can dip below 3:1 despite `drop-shadow-lg`. The bottom-anchored paragraph is fine (black/75 zone). Fix: strengthen the mid-scrim to ≥40% and verify against the actual hero image's brightest region.

### 21. LOW — Focus order for the floating theme switcher
The fixed bottom-right switcher sits in the DOM between `<slot />` and the footer (`Layout.astro:118`), so keyboard users tab through the entire page content before reaching it. Not a failure, but moving it to the header (or DOM end) would match visual hierarchy.

### 22. LOW — Plans lightbox caption duplicates alt
`plans.astro:177-178`: `lbImg.alt = img.alt` *and* the caption `<span>` gets the same text — screen readers hear it twice, and the caption is 85% white over arbitrary image content (risk below 4.5:1 on bright drawings). Give the caption a solid/dimmed backing or set `alt=""` on the dialog image since the caption announces.

---

## What is genuinely correct (keep it)
- `:focus-visible` base rule with 3px/3px offset (`global.css:6-9`) — strong, consistent focus treatment *except* where the findings above override or clip it.
- Skip link is first in DOM, real `main` landmark exists everywhere — just broken targets (finding 1).
- Heading order is clean on every page: exactly one `h1` → `h2`s per section; `<dl>` for amounts, `<figure>/<figcaption>` on Our Lady, real `<nav>`, single `main`/`header`/`footer` landmarks.
- Correct element choice: lightbox triggers and hotspots are `<button>`, nav items are `<a>`; decorative SVGs and Material Symbols are `aria-hidden`; `aria-current="page"` on nav; YouTube iframe has `title`; `rel="noopener noreferrer"` on external links.
- Reduced-motion handling is above average: `.reveal`, `.btn-pulse`, hotspot pulse, header transition, progress bar all covered in `@media (prefers-reduced-motion: reduce)`.
- `<html lang={lang}>` is set correctly per route; viewport doesn't block zoom; nav/touch targets are 44px almost everywhere except the hotspots.
- Alt text quality is generally good and page-specific (hero, side altar, QR code).

## Fixes applied
None — review-only, per instructions.

## Residual risks
- Hand-computed contrast ratios (findings 5, 6, 10, 11) should be re-verified with axe-core or Lighthouse on the actual rendered themes before release; the solnedgang/kull numbers are unambiguous even with rounding error.
- The Before/After slider is fully JS-driven (`tabindex`, `role`, `aria-*` all set at runtime) — if the bundle fails, there's no keyboard path at all and the "after" image stays clipped at 50% by the inline `clip-path`. Consider SSR-side attributes.
- No automated a11y test harness exists in the repo (no `axe` integration, no `astro check` config seen) — every one of these regressions will silently return.
- `dist/` contains a stale build; nothing in this review verified the deployed output, only source.

## Acceptance report