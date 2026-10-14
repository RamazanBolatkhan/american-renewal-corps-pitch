import Link from 'next/link';
import { ModelCostChart } from './ModelCostChart';

export type Slide = {
  id: string;
  kicker: string;
  title: React.ReactNode;
  lede: string;
  body: React.ReactNode;
  /** Where to go in the app while talking through this slide. */
  app: { label: string; href: string }[];
};

function Flow({ steps }: { steps: [string, string][] }) {
  return (
    <ol className="deck-flow">
      {steps.map(([title, text], i) => (
        <li key={title}>
          <span className="deck-num">{String(i + 1).padStart(2, '0')}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </li>
      ))}
    </ol>
  );
}

function Card({ title, tone, children }: { title: string; tone?: 'green' | 'orange'; children: React.ReactNode }) {
  return (
    <div className={`deck-card${tone ? ` deck-card--${tone}` : ''}`}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export const slides: Slide[] = [
  {
    id: 'student',
    kicker: 'STUDENT FLOW',
    title: <>ONE BRIEF, <span>FOUR WAYS</span> TO LEARN IT</>,
    lede: 'The learning style changes the order of formats, never the facts. Every format teaches the same key facts from the same brief.',
    body: (
      <>
        <Flow
          steps={[
            ['Start', 'No sign-up. Visitors get an anonymous account; registering later keeps their choices.'],
            ['Pick a style', 'Read, Diagram, Game or Sim. Stored per user and changeable at any time.'],
            ['Module plan', 'The chosen style is every topic’s first format. The other three rotate as second, so all four are seen.'],
            ['Lesson + check', 'One question per key fact, with an explanation for every option.'],
            ['Data hall', 'Game and Sim run on an isometric scene. Break a part and the fact it breaks is marked.'],
          ]}
        />
        <p className="deck-key">Why: the brief is the single source of truth. Formats are four renderings of it, so a student who picks Game learns exactly what a Read student learns.</p>
      </>
    ),
    app: [
      { label: 'Start learning', href: '/start' },
      { label: 'Style picker', href: '/learn/style' },
      { label: 'Module plan', href: '/learn' },
      { label: 'Game on the scene', href: '/learn/topic-containment/game' },
      { label: 'Scene preview', href: '/scene' },
    ],
  },
  {
    id: 'pipeline',
    kicker: 'CONTENT PIPELINE',
    title: <>FROM A PLAN FILE <span>TO LESSONS</span></>,
    lede: 'Staff upload a training plan; people stay in charge of every step that decides what is true.',
    body: (
      <>
        <Flow
          steps={[
            ['Upload', 'PDF, Markdown, text or JSON goes straight from the browser to private storage with a short-lived staff-only token.'],
            ['Extract', 'AI copies module, topics, objectives and key facts. Every fact carries its exact source sentence; a quote not found in the file is flagged.'],
            ['Review', 'An editor corrects the draft. Gaps are listed as issues, never filled in by the model.'],
            ['Approve', 'A publisher approves. Each topic gets a new brief version; nothing is overwritten.'],
            ['Generate', 'Five parallel calls per topic: Read, Diagram, Game, Sim and questions. Then checks and the judge.'],
          ]}
        />
        <div className="deck-stats">
          <div><strong>~16 s</strong><span>to extract a plan</span></div>
          <div><strong>~45 s</strong><span>to generate a 3-topic module</span></div>
          <div><strong>4 roles</strong><span>student, editor, publisher, admin; checked on the server for every page and action</span></div>
        </div>
      </>
    ),
    app: [
      { label: 'Imports', href: '/admin/imports' },
      { label: 'Content', href: '/admin/content' },
      { label: 'Users and roles', href: '/admin/users' },
    ],
  },
  {
    id: 'quality',
    kicker: 'QUALITY',
    title: <>TWO GATES BEFORE A <span>STUDENT</span> SEES IT</>,
    lede: 'Code proves the structure. A second AI call checks the meaning. Editors settle disagreements, and their decisions teach the judge.',
    body: (
      <div className="deck-grid deck-grid--3">
        <Card title="1 · Code checks">
          <ul>
            <li>Only the brief’s facts, and every fact taught</li>
            <li>Read lessons of 150–250 words</li>
            <li>Diagrams inside the canvas, no colliding labels, arrows that connect</li>
            <li>Games that can be solved; exactly one correct answer</li>
            <li>Failed? The problem list goes back to the model, up to 3 tries</li>
            <li>41 Vitest tests prove the checks themselves</li>
          </ul>
        </Card>
        <Card title="2 · AI judge">
          <ul>
            <li>Reads the brief, the content and HQ’s numbered judging guide</li>
            <li>Each finding names a rule: error or warning</li>
            <li>Any error flags it; the verdict is computed in code, not the model’s opinion</li>
            <li>Flagged, or the judge failed: hidden until an editor publishes or rejects</li>
          </ul>
        </Card>
        <Card title="3 · The guide learns" tone="green">
          <ul>
            <li>Every editor decision is stored with exactly what was judged</li>
            <li>HQ drafts a new guide from the disagreements</li>
            <li>The draft re-judges past decisions: “agrees with editors on N of M”</li>
            <li>It only takes effect when HQ approves it</li>
          </ul>
        </Card>
      </div>
    ),
    app: [
      { label: 'Reviews', href: '/admin/reviews' },
      { label: 'Judging guide', href: '/admin/guide' },
    ],
  },
  {
    id: 'stack',
    kicker: 'TECHNOLOGY',
    title: <>CHOICES, <span>IN ONE LINE EACH</span></>,
    lede: 'Picked for the least custom setup on one deployment, with one set of types from the AI output to the screen.',
    body: (
      <div className="deck-table-wrap">
        <table className="deck-table">
          <tbody>
            <tr><th>Next.js 16 + React + TypeScript</th><td>One codebase for the student app, admin and backend. Server components read the database; <code>after()</code> runs AI jobs in the background.</td></tr>
            <tr><th>Vercel</th><td>Next.js without adapters, 300 s functions for ~45 s generation jobs, a preview URL per branch. Cloudflare is cheaper at very high traffic; not our problem yet.</td></tr>
            <tr><th>Neon Postgres + Drizzle</th><td>The data is relational: module → topic → brief version → facts → lessons. Unique (topic, version) means a brief is never overwritten. Plain Postgres, so it moves with a dump.</td></tr>
            <tr><th>Better Auth</th><td>Sessions in the database, so a password reset, role change or deletion works on the next request. Anonymous demo users and roles built in.</td></tr>
            <tr><th>AI SDK + AI Gateway + Zod</th><td>One schema per format is the AI’s output contract, the stored JSON and the renderer’s props. A renamed field fails the build everywhere.</td></tr>
            <tr><th>Vercel Blob (private)</th><td>Uploads go from the browser to storage directly, never through a function’s 4.5 MB body limit.</td></tr>
            <tr><th>SVG from data</th><td>No AI images. The model decides what to draw and where; the app draws it, so every diagram matches the design system.</td></tr>
          </tbody>
        </table>
      </div>
    ),
    app: [
      { label: 'A diagram lesson', href: '/learn/topic-containment/diagram' },
      { label: 'A read lesson', href: '/learn/topic-aisles/read' },
    ],
  },
  {
    id: 'model',
    kicker: 'AI MODEL',
    title: <>THE CHEAP MODEL <span>PLUS CHECKS</span></>,
    lede: 'Claude Haiku 5.5 through AI Gateway. Real numbers from the published Cooling & airflow module (3 topics).',
    body: (
      <>
        <div className="deck-stats">
          <div><strong>15 / 17</strong><span>calls passed every check first try; 2 diagram label collisions fixed on retry</span></div>
          <div><strong>100%</strong><span>fact coverage across all 15 pieces</span></div>
          <div><strong>$0.01</strong><span>per topic for all five pieces; the judge adds about $0.004</span></div>
        </div>
        <div className="deck-split">
          <ModelCostChart />
          <div className="deck-stack">
            <Card title="Why Haiku">
              <ul>
                <li>Every lesson must pass the same checks on any model; Haiku plus 3 tries gets there at 1/20 of Sonnet</li>
                <li>GPT-6 Luna costs the same but isn’t measured yet: one setting (<code>GENERATION_MODEL</code>) and a test run away</li>
              </ul>
            </Card>
            <Card title="Known weakness" tone="orange">
              <p>Diagram arrows sometimes point backwards. Code can’t see direction, so the judge checks it.</p>
            </Card>
          </div>
        </div>
      </>
    ),
    app: [
      { label: 'Runs and tokens (open an import)', href: '/admin/imports' },
      { label: 'Admin overview', href: '/admin' },
    ],
  },
  {
    id: 'facts',
    kicker: 'DISCUSSION · 1',
    title: <>15 KEY FACTS <span>INSTEAD OF 4</span></>,
    lede: 'Nothing caps facts per topic today, so it would still generate. The fixed-size formats are what break.',
    body: (
      <div className="deck-split">
        <div className="deck-table-wrap">
          <table className="deck-table deck-table--compare">
            <thead><tr><th>What</th><th>4 facts</th><th>15 facts</th></tr></thead>
            <tbody>
              <tr><th>Read</th><td>37–62 words a fact</td><td>10–17 words a fact inside 150–250: a list, or a coverage failure and 3 wasted tries</td></tr>
              <tr><th>Diagram</th><td>A few labelled parts</td><td>15+ labels on a 640 × 360 canvas; label collisions were already the only failures at 4</td></tr>
              <tr><th>Game / Sim</th><td>A short sort, a few decisions</td><td>A 15-item sort is a chore; the scene has only 5 fault states to show</td></tr>
              <tr><th>Questions</th><td>4 in one call</td><td>15 in one call; one bad question retries all 15</td></tr>
              <tr><th>Judge / editor</th><td>Short piece</td><td>One error hides the whole lesson; editors read 4× more per decision</td></tr>
              <tr><th>Student</th><td>One sitting</td><td>Too much for one lesson</td></tr>
            </tbody>
          </table>
        </div>
        <Card title="Fix: split by size, keep the limits" tone="green">
          <ul>
            <li>At review, group a topic’s facts into lesson units of 3–5 (the editor can move facts between units)</li>
            <li>Generation, checks, judge and retries run per unit, so a failure costs one unit, not the topic</li>
            <li>Questions generated in batches of 5</li>
            <li>The plan rule then treats units like topics: same style weighting, more steps</li>
          </ul>
        </Card>
      </div>
    ),
    app: [
      { label: 'Review an import', href: '/admin/imports' },
      { label: 'Read lesson (4 facts)', href: '/learn/topic-aisles/read' },
    ],
  },
  {
    id: 'versions',
    kicker: 'DISCUSSION · 2',
    title: <>WHEN A BRIEF <span>CHANGES</span></>,
    lede: 'Lessons are never edited in place. A changed brief is a new version, and its lessons are regenerated from it.',
    body: (
      <div className="deck-grid deck-grid--3">
        <Card title="What keeps it consistent today">
          <ul>
            <li>Approval adds brief version N+1 with its own facts; unique (topic, version)</li>
            <li>Every lesson, question set and judgment points to exactly one brief version, so a lesson can’t mix old and new facts</li>
            <li>The whole topic is regenerated, checked and judged again: about one cent, so patching isn’t worth the risk</li>
            <li>Editor decisions keep a copy of the brief they were made against</li>
          </ul>
        </Card>
        <Card title="Honest gap" tone="orange">
          <ul>
            <li>Students switch to the newest version as soon as it is approved, so the topic is empty for the ~45 s it takes to generate</li>
            <li>A flagged piece of the new version leaves a hole until an editor decides</li>
            <li>Fact keys (f1, f2…) are per version, so “the same fact” isn’t tracked across versions</li>
          </ul>
        </Card>
        <Card title="Next step" tone="green">
          <ul>
            <li>A live-version pointer per topic that moves only when all five pieces of the new version have passed</li>
            <li>A fact diff in review: added, changed, removed</li>
            <li>Stable fact ids across versions, so progress on unchanged facts carries over</li>
          </ul>
        </Card>
      </div>
    ),
    app: [
      { label: 'Content and versions', href: '/admin/content' },
      { label: 'Imports', href: '/admin/imports' },
    ],
  },
  {
    id: 'scale',
    kicker: 'DISCUSSION · 3',
    title: <>50 MODULES <span>INSTEAD OF 3</span></>,
    lede: 'Money and the database are not the problem. Background work, people’s review time and hand-built scenes are.',
    body: (
      <div className="deck-grid">
        <Card title="Scales as it is">
          <ul>
            <li><strong>Cost:</strong> 150 topics ≈ $1.47 to generate + ≈ $0.70 to judge; about half with the batch API</li>
            <li><strong>Data:</strong> same tables, tens of rows per module</li>
            <li><strong>Formats:</strong> renderers and checks are generic and data-driven</li>
            <li><strong>Diagrams:</strong> generated for any trade, no new artwork needed</li>
          </ul>
        </Card>
        <Card title="Needs work" tone="orange">
          <ul>
            <li><strong>Background jobs:</strong> one import fires every topic’s calls at once inside <code>after()</code>. Big plans hit rate and time limits → a queue with one job per topic × format, retried and idempotent</li>
            <li><strong>Review time:</strong> 750 pieces. The judge already narrows it to flagged ones; add a prioritized queue and bulk publish for passed content</li>
            <li><strong>Scenes:</strong> the data hall fits cooling modules only. Electrical or HVAC need their own scene, built once with the same kit</li>
            <li><strong>Judging guide:</strong> one guide today; add per-program rule sections</li>
            <li><strong>Catalog and progress:</strong> cache the catalog, invalidate on publish; real per-fact progress is still a placeholder</li>
          </ul>
        </Card>
      </div>
    ),
    app: [
      { label: 'Admin overview', href: '/admin' },
      { label: 'Module plan', href: '/learn' },
    ],
  },
];

export function AppLinks({ links }: { links: Slide['app'] }) {
  return (
    <ul className="deck-app-links">
      {links.map(l => (
        <li key={l.href + l.label}>
          <Link href={l.href}>{l.label}<span aria-hidden="true">↗</span></Link>
        </li>
      ))}
    </ul>
  );
}
