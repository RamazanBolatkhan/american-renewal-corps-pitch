# Interactive mobile-app landing page

## Current direction
The user requested a single-screen landing page, with no document scrolling: an interactive phone on the right and explanatory text on the left that animates when visitors change app screens. This replaces the initial long-form landing page, which remains in Git history.

Preserved visual language: #06402B green, #F3F2E9 cream, #FF6B35 orange, Barlow Condensed headings, DM Sans copy, technical line drawings, grid backgrounds, and numbered navigation.

## Interaction model
- Home: daily lesson card, selected trade, and current session progress.
- Trades: electrical, building systems, and industrial, each with distinct educational content.
- Learn: three illustrated concept cards with back/next navigation.
- Practice: three questions, answer validation, explanations, retry, and completion.
- Progress: actual demo-session lesson/practice milestones and total XP across trades.
- Once-per-trade rewards: 30 XP for the lesson and 60 XP for practice. Repeats cannot inflate the total.
- Reset Demo clears sample progress. Refresh also resets it; no account or server storage is implied.
- Navigation updates the left-side story with staggered headline reveals and a sliding information card. A traveling orange (#FF6B35) spark and number burst mark chapter changes; no static dash remains. Reduced-motion users see immediate transitions.
- Story panels share CSS subgrid rows sized for the longest content. Headings, descriptions, cards, and chapter navigation keep identical positions across all five screens, including mobile. Inactive panels remain hidden and inert.
- Mobile: compact story above the phone; optional Enlarge App/Show the Story mode.

## Content boundaries
The user supplied the concept of daily skilled-trades retraining for data infrastructure, construction, and industry. Paths, app screens, and learning mechanics are proposed. No invented customers, partnerships, certifications, tuition, dates, testimonials, or job-placement claims. All lesson content is conceptual, not operational instruction for working on equipment.

## Assets
- Barlow Condensed 800 and DM Sans 400: locally hosted Google Fonts, SIL Open Font License files included.
- Technical illustrations and interface icons: inline SVG created for the demo.
- Original stock construction photo retained in public/images but not loaded by this design.
- Concept wordmark and favicon, not verified company branding.

## Verification
- TypeScript checking and Vite production build.
- Chrome: full electrical lesson and quiz, including incorrect-answer retry, correct-answer explanations, and 90 XP completion.
- Both building-systems and industrial lessons/quizzes completed; accumulated 180 XP across those trades in a fresh session.
- Replaying a completed quiz left XP unchanged. Reset returned it to zero.
- Every default screen and every tested building-systems/industrial lesson and answer state fit the 461px phone content viewport without internal scrolling.
- Desktop, 1280x720 laptop, 390x844 mobile, 320x568 small phone, and 844x390 landscape document dimensions matched viewport dimensions without page scrolling.
- Mobile enlargement and return-to-story controls verified.
- Browser warnings/errors absent during interaction checks.
- Fixed-position regression check: all five chapters have identical heading, description, card, and navigation offsets. Laptop and mobile navigation/phone positions remain identical across switches. Desktop navigation stays above the footer, with zero shell scroll.

## Deployment and future work
The repository is connected to Vercel. This redesign is developed on feature/interactive-mobile-demo for review. A real mobile app, accounts, persistent learner progress, validated curriculum, and enrollment are separate product work. Keep noindex until an approved production release.

### Demo contact popup
- Header “Get in touch” opens the cream/green/orange native dialog.
- Automatically opens once per page load after all five screens have been visited and the visitor remains on Progress for 1.8 seconds. Moving away cancels the pending popup.
- User requested a presentation-only form: no backend, network submission, or persistence. Fields are cleared on close/submission and the confirmation explicitly explains demo behavior.
- Verified automatic/manual opening, submission confirmation, Escape dismissal, reopening, desktop and 390×844 mobile layout. `npm run build` passed.

### Worker-to-phone introduction
- Original inline SVG of a worker in a hard hat holding an orange outlined phone; cream technical lines preserve the existing palette.
- 2.4-second opening draws the illustration, zooms the illustrated phone to the measured live phone bounds, and fades into the interactive app.
- Pointer or keyboard interaction or a reduced-motion preference cancels the intro immediately. Actual viewport changes recalculate an active animation; no-change resize events during navigation are ignored. Reduced-motion users get the app directly. The intro starts after fonts and layout settle on every page load or refresh. “Replay intro” also repeats it for presentation.
- Verified desktop and 390×844 mobile, completed animation cleanup, and immediate navigation while skipping the animation. No new dependencies or external assets.

### App skeleton (Next.js)
- The project moved from Vite to Next.js 16 (App Router) on `feature/app-skeleton`. The landing code is unchanged apart from removing the analytics `inject()` call (now `<Analytics />` in the root layout) and adding a **Start learning** header button. On portrait phones the header keeps both buttons on one line and hides the small brand name below 430px.
- New pages use `src/app/system.css`: the same tokens, fonts, 64px grid, framed dark cards, cream form panels with an orange top border (from the contact dialog), orange eyebrow squares, and condensed uppercase headings. Rules are scoped under `.ui`, and base resets use `:where()` so component classes win.
- Learner flow: `/start` → `/learn/style` → `/learn?style=…` → `/learn/[topic]/[format]`. The plan rule makes the chosen style every topic's primary format and rotates the other formats as secondaries. Content is the Cooling & airflow module supplied in the ARC assignment.
- Account forms and the admin area are labelled skeletons: forms show a "not connected" message and send nothing; admin has no access control yet and shows only sample-module counts or empty states.
- Verified: `npm run build`; all routes return 200 and keep noindex; no horizontal scroll at 1440×900 and 390×844 on every new page; landing still fits without page scroll at 390×844, 320×568, 844×390 and 1280×720; register form shows the not-connected message; `/learn` without a style redirects to the style picker; unknown topics return 404. The only console errors were the Vercel Analytics script, which 404s outside Vercel.
