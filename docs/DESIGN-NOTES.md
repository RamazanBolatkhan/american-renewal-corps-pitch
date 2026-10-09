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
- Navigation updates the left-side story with staggered headline reveals and a sliding information card. Reduced-motion users see immediate transitions.
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

## Deployment and future work
The repository is connected to Vercel. This redesign is developed on feature/interactive-mobile-demo for review. A real mobile app, accounts, persistent learner progress, validated curriculum, and enrollment are separate product work. Keep noindex until an approved production release.
