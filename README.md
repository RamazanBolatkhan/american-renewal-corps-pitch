# American Renewal Corps — pitch project

A complete, responsive landing-page design for an independent interview pitch. Inspired by the supplied editorial reference, using deep green `#06402B`, warm cream, orange accents, technical illustrations, and bold condensed typography.

## Run locally
Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Vite (normally http://127.0.0.1:5173).

## Verify and build

```sh
npm run check
npm run build
npm run preview
```

The production build is written to `dist/`. Its static files can be served by a standard static host. Replacing the existing website will require access to its hosting and any existing form services.

## Structure

- `src/main.ts` — page markup and interactions
- `src/styles.css` — shared styles
- `public/images/` — approved image assets
- `public/fonts/` — licensed font files
- `public/favicon.svg` — provisional development icon
- `docs/PROJECT-BRIEF.md` — current-site findings and pitch direction
- `index.html` — document metadata and application entry

Includes keyboard-accessible trade pathway tabs, native FAQ accordions, mobile navigation, and reduced-motion support. Fonts and photography are served locally.

No backend, analytics, form service, or deployment is configured. No credentials are needed for local development. The pitch is marked `noindex` while under development.
