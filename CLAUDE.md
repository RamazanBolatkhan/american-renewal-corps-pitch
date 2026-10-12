# American Renewal Corps landing page

Independent interview pitch project; not the organization's official production website.

## Stack and commands
- Next.js 16 (App Router) + React + TypeScript + plain CSS. No database, auth backend, or environment secrets yet.
- Use Node.js 22.12+.
- Install reproducibly: `npm ci`.
- Validate and produce the production build: `npm run build` (includes TypeScript checking). `npm run check` runs TypeScript alone.
- Local development: `npm run dev`. Production preview: `npm run preview` (build, then `next start`).
- Generated `.next/` and `node_modules/` are ignored. `vercel.json` sets the Vercel framework, build command and output folder to Next.js values, overriding the project's original Vite settings.

## Files
- `src/landing/`: the original framework-free landing experience (`main.ts`, `demo-data.ts`, `phone-intro.ts`, `contact.ts`, `styles.css`), mounted once on `/` by `LandingMount.tsx`. Link to and from `/` with plain `<a>` (full page load), not `next/link`.
- `src/app/`: App Router pages. `layout.tsx` (metadata, noindex, analytics), `system.css` (shared design system for every page except the landing, scoped under `.ui`), `start`, `(auth)/register`, `(auth)/login`, `learn` (style picker, module plan, lesson), `admin` (overview, imports, content, users).
- `src/components/`: shared UI (`PageShell`, `Icon`, `FormatArt`, `AuthForm`, `AdminNav`, `UploadPanel`, `LearnShell`).
- `src/lib/module.ts`: the Cooling & airflow sample module from the ARC assignment. `src/lib/plan.ts`: the learning-style plan rule.
- `public/`: locally hosted images and fonts, font licenses, favicon.
- `docs/DESIGN-NOTES.md`: design direction, asset sources, and prior verification.
- `docs/PROJECT-BRIEF.md`: original setup brief; later direction is recorded in design notes and this file.

## Design and content
- Preserve primary green #06402B with cream #F3F2E9 and orange #FF6B35 unless asked to change them.
- Preserve the bold condensed type, editorial grid, technical illustrations, and framed cards.
- The landing page (`/`) is a single-screen, no-page-scroll experience: animated story on the left and a clickable phone prototype on the right. Keep phone navigation and story content synchronized. Other pages scroll normally and use `src/app/system.css`.
- Demo XP on the landing phone is earned once per lesson/practice per trade and resets on refresh. Sign-up, log-in and admin pages are skeletons until Better Auth and the database are connected: they must say so, and must not send or store data. Never imply certifications.
- Focus on retraining for skilled trades serving data infrastructure, electrification, building systems, and industry.
- Training pathways are proposed concepts. Do not invent partnerships, credentials, tuition, start dates, statistics, testimonials, or placement guarantees.
- Keep responsive behavior, keyboard-operable controls, focus states, mobile enlargement, and reduced-motion support.
- Keep noindex while this remains an interview concept. Deployment or official-site replacement is a separate task.

## Working agreement
Make focused changes on a task branch and run `npm run build` before handing off. For visual changes, check desktop and mobile when browser tooling is available. Describe any verification limits accurately. Never commit secrets or generated dependency/build folders.
