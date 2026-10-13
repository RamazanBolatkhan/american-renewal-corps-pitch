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

### Data-hall scene (Anatomy skill)
- Built with the Anatomy skill's isometric kit, copied into `src/components/iso/` (MIT, from github.com/wheresryan22/anatomy, version 1.1.0). The figure lives in `src/components/figures/hall/`: `model.ts` (states and the illustrative inlet model), `view.ts` (layout and camera, azimuth 52°, elevation 38°), `art.tsx` (server-built static art), `live.tsx` (client: variants, door motion, sensor displays, readout) and `hall.css` (ARC tokens: deep greens, cream lines, orange for the one thing to watch).
- The object: a contained cold aisle between two rows of four racks on a raised floor with pedestals, perforated tiles, containment doors at both ends and a roof panel over the first bay, and a cooling unit whose top grille takes the hot return. The near row is cut away at 18 units (rack B1 stays whole to carry the roof) so the aisle, the server fronts, blanking panels and inlet sensors can be seen.
- States the lessons can set: either door open, any rack in row A reversed (its fan side faces the aisle, exhaust crosses the aisle), any rack missing a blanking panel (empty slot, exhaust curls back through it), and the movable perforated tile in the hot aisle. Every variant is drawn once in its painter's slot and tagged `data-when`; faults are drawn in the lit orange. Sensor displays show each rack's inlet reading and turn orange outside 18–27 °C.
- Temperatures come from a simple illustrative model of the brief's rules and are labelled as example readings, not measurements.
- Preview page: `/scene` (add `?preset=faults` for every fault at once).
- Verified: the skill's line-end check (`scripts/lines.mjs`) reports 0 floating ends in the healthy state (94 ends) and with every fault on (122 ends); close-ups at 4× of the sensor displays and server fronts; painter's order of the sliding door leaves; desktop and 390 px phone (scaled up inside the card, no sideways scroll); reduced motion (flows stop, doors jump to place). The skill's geometry audit (`audit.mjs`) was not used: the scene has no pipes or turned parts.

### Game and Sim lessons on the data-hall scene
- Lesson data gains an optional `scene` state (`SceneState` in `lessons.ts`: doors, reversed rack, missing blanking panel, tile) on game items, sim decisions and sim choices. It is layered over the healthy hall, so the AI generator can bind content to the scene with plain data.
- Game renderer (`GameLesson.tsx`) plays all three assignment kinds from data: sort (a group button per item), order (move up/down buttons) and match (pick left, then right). Checking marks each item right or wrong; wrong ones can be changed and checked again. Starting order is a shuffle seeded by item ids, so server and client agree. When items carry a scene state, the data hall above shows what the hovered or focused statement looks like (for example, the near door open).
- Sim renderer (`SimLesson.tsx`) shows one decision at a time on the scene: each decision sets the scene, a choice can change it (opening the doors raises the inlet readings; fitting the blanking panel brings them back), wrong answers explain and offer Try again, and the end screen counts calls to rethink and lists the facts practised.
- The topic 3 sim uses the scene's own reading (rack A3 at 28.0 °C, example value) so the text and the drawing agree. Duplicated "common mistake" wording was removed from feedback, since the renderer labels it.
- Verified in the browser: sort game wrong then right (3 of 6, then all correct) with scene preview, order game solved with the buttons, the containment sim through all four decisions including the common-mistake choice and its scene consequence, the topic 3 sim's 28.0 °C display, 390 px phone with no sideways scroll, no console or hydration errors. `npm test` (34) and `npm run build` pass.

### Lesson generator (Claude Haiku 5.5)
- Extraction and generation both use `anthropic/claude-haiku-5.5` through AI Gateway (override with `EXTRACTION_MODEL` / `GENERATION_MODEL`).
- Approving an import saves the briefs and starts generation after the response (`runGeneration` in `src/app/actions/imports.ts`). For each topic, `src/lib/content/generate.ts` makes five structured calls in parallel: Read, Diagram, Game, Sim and questions. Each answer is converted into the strict lesson shape and run through `checkLesson` / `checkQuestion`; on failure the problems go back to the model, up to three attempts. Every attempt is logged in `generation_run` with its tokens. Passing lessons are stored in `lesson` and `question` (one per brief version and format).
- Game and sim may bind items, decisions and choices to the data-hall scene only when the module is about data-centre cooling and airflow; other modules play the same games and sims without a scene. Generated games use sort or order (match stays available for hand-written lessons).
- Import statuses now continue past approval: Generating lessons → Published (everything passed) or Partly generated (something failed three times; "Generate missing" retries only the gaps). The import page shows a topics × formats grid that fills in live, the problems behind any failure, and the tokens used.
- Students: `src/lib/content/catalog.ts` lists generated modules (once a topic has lessons) next to the hand-written sample; a generated module with the same id replaces the sample. `/learn` gets a module switcher; lesson pages load generated lessons and show the scene only when the lesson's data uses it.
- Diagram layout checks were added to `checkLesson` because the first generated diagrams had colliding labels and an arrow from nowhere: label boxes may not collide with each other or with other parts, rects may not partly overlap (fully nested parts are fine), every arrow must start or end at a part, and the drawing must use most of the canvas. The hand-written diagrams pass them too.
- Verified end to end locally against the shared database: the Appendix B PDF extracted in 16 s (12 facts, every quote found), approval generated all 15 pieces in 45 s with one retry, 71,732 tokens, about $0.024 for the module. After the layout checks, the three diagrams were regenerated through "Generate missing" and passed (one retry). Generated Read, Diagram, Game (with scene) and Sim (with scene) pages rendered without errors. `npm test` (35) and `npm run build` pass. Test data was deleted afterwards.

### Hands-on scene
- The data hall can now be explored directly, like the Anatomy examples. Every described part (rack, blanking-panel slot, door, perforated tile, cooling unit, roof) highlights on hover or keyboard focus; the card's hint corner names it and the note under the card states the fact behind it.
- Where the scene is interactive (`/scene` and Game lessons), clicking or pressing Enter changes the part: open or close a door, turn rack A1–A4 around, remove or fit a blanking panel, move the loose perforated tile between the aisles (its cool-air flow disappears in the hot aisle). Inlet readings and the readout respond at once. Parts are focusable buttons with labels for screen readers.
- In Game lessons the scene keeps the student's own changes; hovering a statement previews it, and leaving the list returns to the student's version. In Sim lessons the scene stays driven by the decisions and only explains parts on hover.
- The movable tile moved to the floor in front of rack A2, because the near door and the cut-away near row covered its old position on screen; cool flows now start on a tile hole.
- Verified in the browser: hover text for racks, panels, doors, the tile and the cooling unit; clicks on a rack, a door and the tile, Enter on a focused blanking panel; the control panel stays in sync; game preview and return; sim explain-only; 390 px phone tap with no sideways scroll; 0 floating line ends healthy and with every fault on; no console errors.

### Scene changes linked to the brief's facts
- In Game lessons, every problem on the scene is matched to the facts it goes against, using the lesson's own data: game items that show a scene state carry the facts they teach (open door → f2, missing blanking panel → f3, tile in the hot aisle → f4, reversed rack → f4). Both doors count as one kind of problem. Generated games get this for free.
- The Key facts panel marks those facts "Broken now" (orange); hovering or focusing a part softly highlights the facts it relates to, and hovering a statement highlights that statement's facts. A "What's wrong now" box under the scene lists each problem with the fact it breaks, quoting it, or says "This belongs to another topic in the module" when no fact in this topic covers it. When nothing is wrong it says everything is in place.
- In Sim lessons, the current decision's facts are highlighted, and a wrong choice marks them broken.
- Verified in the browser: open door → f2 broken, then removed blanking panel → f2 and f3 broken with both quoted; hovering rack A2 → f4 related, clicking → f4 broken; open door in topic 1 → "another topic"; sim wrong choice → f1 and f2 broken. No console errors; `npm test` and `npm run build` pass.

### Accounts: password management, staff accounts, email and Google
- `/account`: details (email, confirmation, role, sign-in methods, join date), change password (signs out other devices), connect Google when available, and delete account (type the email and password; admins can't delete themselves, which keeps a way into the admin area).
- Admins create staff accounts on Admin → Users & roles: name, email, role; a 14-character temporary password (no look-alike characters) is shown once with a copy button. These accounts are marked email-confirmed and `mustChangePassword`; the person is sent to `/account/password` before any learner or admin page until they choose their own. Admins can also reset anyone else's password the same way, which signs that person out everywhere. This is the fallback while password emails aren't connected.
- Forgot password (`/forgot-password` → emailed link → `/reset-password`) and email confirmation (sent on sign-up, banner on learner pages, resend from `/account`) are built on Better Auth and send through Resend's HTTP API (`src/lib/email.ts`). They switch on when `RESEND_API_KEY` and `EMAIL_FROM` are set; Resend only sends from a domain you own and verify, so until one is added the pages explain that an admin can reset the password instead. The reset answer never reveals whether an email has an account.
- "Continue with Google" (login, register, and connect on `/account`) appears only when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set; Google accounts link to an existing account with the same email.
- New column `user.must_change_password` (migration 0003).
- Verified in the browser against the shared database: admin creates an editor → editor logs in with the temporary password → forced to choose one → reaches `/admin`; wrong current password rejected on `/account`; admin reset → editor forced again; forgot-password fallback text; a student registers, deletes the account, and can't log in afterwards. Found and fixed a form bug where the hidden redirect field and the new-password field shared the name `next`. Test accounts were deleted.
- The learner-facing header no longer links to the admin area, even for staff. Staff open `/admin` directly (logging in from there returns them to it); access is still enforced on the server by role.

## Balanced palette (shadcn preset b6thgqxmK)
- The pages were all dark green. The redesign follows the shadcn "sera" preset (white background, warm olive-grey neutrals, orange primary, Inter, square uppercase buttons, hairline borders) without adding Tailwind: its tokens were carried into `src/app/system.css` and an override block at the end of `src/landing/styles.css`, so no markup or behaviour changed.
- Roles: white/cream surfaces; green for headings, selected tabs and chips, the primary start card, the footer band and technical plates; orange for actions and highlights. Filled primary buttons are #C4481B with white text (4.9:1); large orange headings use #EA5A20 (3.5:1); #FF6B35 is kept for bars, squares and fills, since it is only 2.8:1 on white.
- Landing: white story column, green stage behind the phone, orange "Start learning" button.
- The data-hall scene and diagrams stay on dark green plates; the scene legend joins the plate so its cream swatches stay readable.
- Verified at 1440 and 390 wide on the landing, start, login, style, plan, the four lesson formats and the scene page; 35 unit tests pass; scene line check 0 floating ends (default and faults). Admin pages were restyled by the same tokens but not checked in the browser.
