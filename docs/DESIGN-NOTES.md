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

### Accounts and roles (Better Auth + Neon)
- Neon Postgres (free plan, iad1) provisioned through the Vercel Marketplace; one database serves production, previews and local development. Drizzle manages the schema; migrations live in `drizzle/`.
- Better Auth 1.7 with email and password (no email verification yet), the anonymous plugin for demo visitors, and the admin plugin with custom roles: student (default), editor, publisher, admin. `ADMIN_EMAIL` (admin@americanrenewalcorps.com) is given the admin role when it registers; that account was created during setup.
- Choosing a learning style without an account creates an anonymous user and a `learner_profile` row. Registering while in the demo links the session; `onLinkAccount` moves the profile to the new account before the anonymous user is deleted.
- The admin area is checked three times: `src/proxy.ts` redirects requests without a session cookie, the admin layout and every admin page call `requireStaff`, and role changes call `requireAdmin`. Students see `/no-access`; editors and publishers can open admin but cannot list or manage accounts; admins cannot remove their own admin role.
- The header shows Log in / Create account for visitors and demo users, and the member's name, Log out, and an Admin link for staff. The demo banner shows only for visitors without an account.
- Verified locally against the shared database with a production build: demo style choice → style switch → registration keeps the style → student blocked from admin → log out → wrong-password and duplicate-email messages → log in. Admin: logged-out redirect to login with `next`, admin login, users list, promoting a user to editor, and the editor seeing admin without the accounts list. Sign-in rate limiting triggered after rapid attempts. Test and anonymous users were deleted afterwards.

### Plan imports (Blob + AI Gateway)
- Staff upload a plan from `/admin/imports`. The browser sends it straight to a private Vercel Blob store using a short-lived token from `/api/admin/uploads` (editor role or above, PDF/Markdown/text/JSON, 10 MB). Word files are not accepted; the Word parser pulled in a package with an open advisory.
- `createImportJob` confirms the file exists in the store, records an `import_job`, and runs extraction after the response. The server reads the text (unpdf for PDFs), stores it, and asks `anthropic/claude-sonnet-5.5` through AI Gateway for an `ExtractedPlan` (Zod). Instructions require copying source wording, keeping fact numbering, quoting the source for every fact, and listing gaps as issues instead of inventing content.
- After the AI step, deterministic checks confirm each source quote exists in the file and fact keys are unique. The review page shows each fact with its quote (orange if not found), the issues list, and the extracted text. Editors save changes; publishers approve.
- Approval writes `module`, `topic`, and a new `brief` version with `brief_fact` rows per topic in one transaction. Re-importing a module adds version 2, 3, and so on. The Content page reads the latest brief version per topic and falls back to the sample module when nothing is approved.
- The learner pages still use the built-in sample module; switching them to approved database content comes with lesson generation.
- Verified locally with `cooling-airflow-module.pdf` (Appendix B): upload, extraction in about 16 seconds, 3 topics and 12 facts with every source quote found, one correct issue raised ("hot hot aisle" copied as written), approval creating brief v1 for each topic, and the Content page showing them. The first attempt failed because AI Gateway's free tier blocks Claude models; the job showed the reason and a retry button. Test imports, the module and uploaded files were deleted afterwards.

### Lesson formats: schemas, sample lessons, Read and Diagram renderers
- `src/lib/content/lessons.ts` turns Appendix C into Zod schemas. Every paragraph, key term, diagram shape, caption, game item and sim decision carries `facts`. Games use the assignment's `kind / items / answer` shape with an exact answer per kind (pairs, sequence, item-to-group). Diagrams are data: rects, zones, arrows and labels with tones and optional label placement, drawn by the app.
- `checkLesson` adds rules the schema can't: only brief facts, every brief fact taught, declared facts match, Read 150–250 words, diagram shapes inside the canvas, games solvable, one correct choice per sim decision. `checkQuestion` requires exactly one correct option. The AI generator will have to pass the same checks.
- `src/content/cooling-airflow.ts` holds hand-written lessons for all 3 topics × 4 formats and one question per fact, written only from the brief. Temperatures in diagrams and sims are labelled as example readings.
- Read renderer: one paragraph per fact with fact chips, key terms, a common-mistake callout and a quick-check question with feedback (the trap option is the brief's common mistake). Diagram renderer: SVG drawn from the data; selecting a caption or a shape highlights the parts that belong together and dims the rest. Game and Sim show a placeholder until the data-hall scene is built.
- Verified: `npm test` (34 tests: every sample lesson and question passes, and deliberately broken lessons are rejected), `npm run build`, browser checks of Read and Diagram on desktop and 390px mobile (no sideways scroll), quick-check right/wrong/retry, and caption and shape highlighting.
