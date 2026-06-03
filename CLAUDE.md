# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the website for **Capella Reginae Norvegiae**, a community chapel-building project in the Gudbrandsdalen valley in Norway. It is a static site deployed to GitHub Pages at `https://andynormann.github.io/capellareginaenorvegiae`.

## Commands

```bash
npm run dev       # Start local dev server at localhost:4321
npm run build     # Build production site to ./dist/
npm run preview   # Preview the production build locally
npm run astro     # Run Astro CLI commands (e.g. astro check)
```

There is no test suite. There is no linter configured (Prettier is present as a dev dependency but no config or lint script exists).

The CI pipeline (`.github/workflows/deploy.yml`) uses **pnpm** — the local lockfile is `bun.lock`, so use `npm` or `bun` locally and note the discrepancy when touching the CI config.

## Architecture

**Tech stack:** Astro 6 + Tailwind CSS v4 (via `@tailwindcss/vite`) + TypeScript strict mode. Experimental features enabled: Rust compiler (`@astrojs/compiler-rs`) and queued rendering.

**Routing:** All real pages live under locale subdirectories. `src/pages/index.astro` is a meta-refresh redirect to `/capellareginaenorvegiae/no/`. The two supported locales are `no` (default) and `en`, each with their own page subtree under `src/pages/no/` and `src/pages/en/`.

**i18n system (`src/i18n/`):**
- `ui.ts` — the single source of truth for all translated strings, keyed by `lang` then translation key. Add new strings here for both `en` and `no`.
- `utils.ts` — exports `getLangFromUrl(url)` (reads the last path segment and falls back to `"no"`) and `useTranslations(lang)` (returns a `t()` helper). Every page and the shared layout imports these to derive the current locale.

**Layout (`src/layouts/Layout.astro`):** The single shared layout wraps all pages. It imports `global.css`, renders the sticky nav with translated links, a `<slot />` for page content, and a footer with language switcher links. The full-page background image (`dalen1.jpg`) is set via a CSS class on `<body>`.

**Styling (`src/styles/global.css`):** Tailwind v4 is configured entirely in this file using `@theme { ... }`. The design system uses **Material Design 3** color tokens (e.g. `surface-bright`, `on-primary`, `secondary-container`) and four font families exposed as Tailwind utilities:
- `font-sketch` → Caveat (handwritten feel)
- `font-headline` → Newsreader (serif)
- `font-body` → Plus Jakarta Sans (sans-serif)
- `font-label` → Epilogue (sans-serif)

**Path aliases** (defined in `tsconfig.json`):
- `@/*` → `./src/*`
- `@assets/*` → `./src/assets/*`

**`old/` directory:** A legacy plain HTML version of the site. Not imported anywhere; can be ignored.

## Conventions

- When adding a new page, create it under both `src/pages/no/` and `src/pages/en/`, add its nav label to `src/i18n/ui.ts` for both locales, and link it from `Layout.astro`.
- All internal links must include the `/capellareginaenorvegiae` base path prefix (configured in `astro.config.mjs`). Use relative links where Astro resolves them, or prefix explicitly.
- Use `<Image>` from `astro:assets` (not plain `<img>`) for all images so Astro can optimise them at build time.
- The site deploys automatically from `main` via GitHub Actions on every push.
