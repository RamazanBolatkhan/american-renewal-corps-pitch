# American Renewal Corps — interactive pitch

An independent interview concept for a mobile learning app focused on skilled-trades retraining. The website is a single-screen interactive product demo: an animated story on the left and a working phone prototype on the right.

## Run locally
Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite (normally http://127.0.0.1:5173).

## Verify and build

```sh
npm run build
npm run preview
```

The build includes TypeScript checking and produces static files in `dist/`.

## Try the demo

- Navigate Home, Trades, Learn, Practice, and Progress through the phone or numbered story buttons.
- Choose electrical, building systems, or industrial; each has its own three-card lesson and three practice questions.
- Complete a lesson to earn 30 demo XP and practice to earn 60. Replaying does not award duplicate XP.
- Incorrect answers offer a retry; correct answers explain the concept.
- Progress is kept in memory for this visit. Refresh or Reset Demo starts over.
- On mobile, Enlarge App hides the surrounding story temporarily for a larger phone view. Show the Story restores it.
- The outer page stays within the viewport. Phone content allows overflow as an accessibility fallback, but tested standard screens fit without scrolling.

## Structure

- `src/main.ts` — app shell, illustrations, screen rendering, navigation, demo state, analytics
- `src/demo-data.ts` — story copy, trades, lesson cards, and practice questions
- `src/styles.css` — layout, responsive phone sizing, typography, animations
- `public/` — local fonts, font licenses, favicon, and retained original photo
- `docs/DESIGN-NOTES.md` — design decisions and verification
- `index.html` — document metadata and application entry

## Scope

This is a browser prototype, not a released native app or verified training program. There are no accounts, cloud-saved learner records, payments, certificates, or enrollment forms. No credentials are needed locally. Educational content is conceptual and does not instruct visitors to work on real equipment.

Vercel Web Analytics is initialized with `inject()`; collection requires Web Analytics to be enabled on the connected Vercel project. The site remains marked `noindex` while under development.
