# American Renewal Corps — interactive pitch

An independent interview concept for a mobile learning app focused on skilled-trades retraining. The website is a single-screen interactive product demo: an animated story on the left and a working phone prototype on the right.

## Run locally
Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Next.js (normally http://127.0.0.1:3000).

## Verify and build

```sh
npm run build     # TypeScript check + production build
npm run preview   # build, then serve the production build
```

## Pages

| Route | What it is |
|---|---|
| `/` | The interactive landing page (unchanged experience) with a new **Start learning** button |
| `/start` | Choose: try the demo, create an account, or log in |
| `/register`, `/login` | Account forms (skeleton: nothing is sent or saved yet) |
| `/learn/style` | Choose a learning style: Read, Picture & diagram, Game, Practice sim |
| `/learn?style=…` | Module plan for Cooling & airflow: each topic's primary and secondary format, with a style switcher |
| `/learn/[topic]/[format]` | Lesson page with format tabs and the topic's key facts (renderer placeholder) |
| `/admin` … | Admin preview: overview, plan imports, content coverage, users & roles (no access control yet) |

## Try the demo

- Navigate Home, Trades, Learn, Practice, and Progress through the phone or numbered story buttons.
- Choose electrical, building systems, or industrial; each has its own three-card lesson and three practice questions.
- Complete a lesson to earn 30 demo XP and practice to earn 60. Replaying does not award duplicate XP.
- Incorrect answers offer a retry; correct answers explain the concept.
- Progress is kept in memory for this visit. Refresh or Reset Demo starts over.
- On mobile, Enlarge App hides the surrounding story temporarily for a larger phone view. Show the Story restores it.
- The outer page stays within the viewport. Phone content allows overflow as an accessibility fallback, but tested standard screens fit without scrolling.

## Structure

- `src/landing/` — original landing experience (`main.ts`, `demo-data.ts`, `phone-intro.ts`, `contact.ts`, `styles.css`)
- `src/app/` — Next.js App Router pages and `system.css`, the shared design system for the new pages
- `src/components/` — shared page shell, icons, format drawings, forms
- `src/lib/` — the sample module from the assignment and the learning-style plan rule
- `public/` — local fonts, font licenses, favicon, and retained original photo
