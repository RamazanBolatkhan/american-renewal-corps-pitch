# American Renewal Corps landing page

Independent interview pitch project; not the organization's official production website.

## Stack and commands
- Vite + TypeScript + plain CSS. No framework, backend, or environment secrets required.
- Use Node.js 22.12+.
- Install reproducibly: `npm ci`.
- Validate and produce static output: `npm run build` (includes TypeScript checking).
- Local preview: `npm run dev`. Production preview: `npm run preview`.
- Generated `dist/` and `node_modules/` are ignored.

## Files
- `src/main.ts`: page markup, inline SVG illustrations, trade tabs, mobile navigation.
- `src/styles.css`: all layout, typography, colors, and responsive styling.
- `public/`: locally hosted images and fonts, font licenses, favicon.
- `docs/DESIGN-NOTES.md`: design direction, asset sources, and prior verification.
- `docs/PROJECT-BRIEF.md`: original setup brief; later direction is recorded in design notes and this file.

## Design and content
- Preserve primary green #06402B with cream #F3F2E9 and orange #FF6B35 unless asked to change them.
- Preserve the bold condensed type, editorial grid, technical illustrations, and framed cards.
- Focus on retraining for skilled trades serving data infrastructure, electrification, building systems, and industry.
- Training pathways are proposed concepts. Do not invent partnerships, credentials, tuition, start dates, statistics, testimonials, or placement guarantees.
- Keep responsive behavior, accessible tab keyboard navigation, focus states, FAQ disclosures, and reduced-motion support.
- Keep noindex while this remains an interview concept. Deployment or official-site replacement is a separate task.

## Working agreement
Make focused changes on a task branch and run `npm run build` before handing off. For visual changes, check desktop and mobile when browser tooling is available. Describe any verification limits accurately. Never commit secrets or generated dependency/build folders.
