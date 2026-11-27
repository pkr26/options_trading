# Options Academy application

A complete beginner learning app for U.S. stock and ETF options. The course contains 64 short lessons, 8 module checkpoints with 2 quiz forms, daily recall reviews, notes, an educational expiration-payoff chart and a reference library. Default study time is 15 minutes. Course completion does not establish trading profitability.

## Advanced Academy

Open **Advanced academy** in the classroom navigation. The advanced program brings the 26-module curriculum into the app with teaching sections, original staged decision cases, portfolio mandates, exhibits, submission examples, analytic rubrics, assignments, defense prompts, and primary references. Module 10 is the flagship Trade Design seminar. Beginner and advanced module numbers identify separate pathways.

The learning loop is: prepare → make an initial recommendation → save the initial submission → consider new information → revise → compare with the debrief → practice on a changed case → return for a later check. Numeric checks are server-graded practice. Written submissions are preserved for rubric review; saving writing does not automatically grade its reasoning or certify mastery. Generated practice variants exercise known question families and do not constitute an independently administered unseen examination. The program has not yet been validated in a learner pilot.

Advanced records use separate user-scoped D1 tables. Every save appends an immutable draft/submission revision and the course packet it used. Unique owner/module/revision indexes prevent competing tabs from silently replacing work. Practice stores the response, expected result, explanation and question version, with a unique owner/module/sequence key preventing replayed submissions. The advanced evidence JSON export includes historical course snapshots. These records are separate from beginner JSON/CSV exports.

The laboratories cover equal-budget portfolio comparisons, European theoretical prices and sensitivities, a short-leg assignment ledger and a supplied partial-fill/cancellation episode. Inputs and episodes are fictional teaching assumptions. Model prices, local sensitivities, expiration values and supplied fills have distinct meanings. All labs provide readable tables and explanations.

The canonical advanced teaching source is `content/graduate.json`. Source changes require incrementing `GRADUATE_VERSION` in `lib/graduate.ts`; changes to question interpretation or keys require a distinct question release and issued item IDs for the affected modules. The November 14 bank is retained for in-flight attempts and frozen pilot enrollments. Existing records preserve their prior versions. `content:import` renders the full advanced Markdown download and inserts it into the library and offline ZIP. The ordinary source freshness check detects stale rendered copies.

Advanced API contracts:

| Route | Behavior |
| --- | --- |
| GET /api/graduate | Read only the current learner's submission history and numeric practice |
| PUT /api/graduate | Append a draft or submitted revision with optimistic concurrency checking |
| GET /api/graduate/practice?moduleId=10 | Request the next module-specific numeric practice variant without answer keys |
| POST /api/graduate/practice | Validate, independently derive answers, and atomically save feedback |
| GET /api/graduate/export | Export the learner's advanced evidence and historical content packets |

Run `node --experimental-strip-types tests/graduate-api.integration.mjs` against a local authenticated development service after applying migrations. It exercises isolation, immutable first attempts, concurrent requests, validation, answer-key handling and exports, then restores portable test records. Run this separately from other tests that write the portable learner's records.

## Application design

### Adaptive teaching, review and pilot

Open **Advanced academy → Teaching studio**. The tutor uses saved error evidence, prerequisites and due checks to recommend study. It provides a single question, specific diagnosis, hints, worked correction and a changed transfer check. Assistance and original answers remain in immutable event history. It is a deterministic instructional system; it does not make an external language-model call.

Writing feedback evaluates an exact saved submission against its module's rubric. It quotes detectable argument evidence, identifies missing working/alternatives/uncertainty, flags selected explicit contradictions and provides module-specific revision questions. Detected evidence is not an academic grade. The review desk downloads the original packet and records actual criterion scores, exact quoted evidence, reviewer challenge and learner response. External reviews are attributed reports, not credential verification.

The pilot enrolls with explicit consent and prior-experience context, fingerprints the question/answer/grading blueprint, records an actual baseline and schedules server-enforced day-7 and day-30 forms. Day-7 closes at elapsed day 14 and day-30 at day 45; late/missing measurements are visible. Forms are parallel numerical practice; the full written-case/reviewer protocol lives in the teaching library. Confidence and assistance are retained with every new assessment. All reviewers’ original ratings remain visible, with a distinct-rater calibration view. No cohort outcomes are invented. Normal teaching reads load latest cumulative snapshots, and the full export streams historical records in bounded batches.

Additional labs cover joint portfolio shocks/funding and research-evidence critique. **My evidence** includes a capstone artifact manifest with immutable revisions for protocols, data audits, models, execution, stress and defenses.

The additive `drizzle/0003_workable_whirlwind.sql` migration creates owner-scoped teaching events. Apply it once after migrations 0000–0002 in a local database; hosted publication applies pending tracked migrations. The new routes are `/api/teaching`, `/api/teaching/tutor`, `/api/teaching/feedback`, `/api/teaching/review`, `/api/teaching/pilot`, `/api/teaching/artifact` and `/api/teaching/export`. Mutations authenticate, validate a measured JSON body and preserve optimistic revisions. Run `tests/teaching-api.integration.mjs` separately from other tests that write the portable learner's records.

| Layer | Technology | Purpose |
| --- | --- | --- |
| UI | React 19 and TypeScript | Responsive dashboard and focused lesson reader |
| Styles | Tailwind CSS 4 and custom CSS | Accessible typography, mobile layouts and clear states |
| Runtime | Vinext, Vite and Cloudflare Workers | Next.js compatible server rendering and API route handlers |
| Database | Cloudflare D1 and Drizzle ORM | Persistent user-scoped progress, notes, preferences and quiz attempts |
| Authentication | Sites ChatGPT sign-in | Platform-managed identity and private access |
| Validation | Zod | Server validation of every write |
| Content | Markdown imported to committed JSON | Reviewable lessons and source references without a runtime filesystem |
| Tests | Node test runner and Playwright | Independent quiz mathematics, scheduling, content checks and browser/API exercises |

Vinext implements the Next.js API surface on Vite. It is not the Next.js production runtime. Cloudflare documents it for full-stack Workers applications: [official framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/). Versions are pinned by package-lock.json.

Signed-in learning records are stored in D1. Unsubmitted lesson-note drafts are also retained in the current tab’s session storage, separately for guests and each signed-in account. A refresh or sign-in return can recover a draft. Explicit note saves use a revision check and offer conflict resolution. Local previews and the hosted app use separate databases. User keys come from trusted platform identity, and each read and write filters by that user. Notes are rendered as text; course Markdown does not enable raw HTML. Mutation requests validate origin and JSON content type. The streaming reader enforces 64 KiB by default and 384 KiB for advanced memo saves, including requests without Content-Length. Each of the five memo fields accepts up to 6,000 Unicode code points, including fully JSON-escaped supplementary characters. Initial submissions require 20 trimmed Unicode code points each for the recommendation, analysis and risks. Notes accept up to 10,000 JavaScript string code units, including Unicode and JSON-escaped controls within that request budget.

The server calculates quiz scores, checks completion order and module prerequisites, and stores attempts. A unique per-user/module attempt sequence atomically accepts each issued quiz revision once; stale or concurrent duplicate submissions receive 409. New attempts retain selected answers, graded feedback, and course/question versions in learning records and exports. Older attempts keep their original scores, with unavailable historical answer evidence left empty. The two quiz forms alternate; once seen, they are review practice rather than unseen assessment. Recall updates use a separate revision check so two tabs cannot overwrite an acknowledged review.

## Run locally

Install Node.js 22.13 or newer. Node24 was used during development. From this directory:

```sh
npm run install:ci
npm run lint
npm run typecheck
npm test
npm run build
```

The tracked hosting manifest declares the DB binding. Apply pending local schema migrations in filename order once per local database. A fresh database needs every migration listed below. After building, `node tests/health.integration.mjs` exercises the release Worker against a separate temporary D1 database through every migration.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_loving_thanos.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_modern_firestar.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_regular_karen_page.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_workable_whirlwind.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0004_note_revisions.sql
npm run dev -- --port 5173
```

Visit the printed loopback URL. Select **Sign in with ChatGPT**. Portable development simulates sign-in with a local test user; no external account or secrets are required. Production does not include that mock identity. The dev server and local migrations share .wrangler/state. Do not apply a migration again to the same database.

Builds and local preview require network access when dependencies are not cached. The app itself does not request a market data feed or connect to a brokerage.

## Backend endpoints

| Method and path | Behavior |
| --- | --- |
| GET /api/learning | Authenticated profile, progress, notes and attempts |
| POST /api/progress | Complete the next lesson, or log a recall using its current reviewRevision |
| PUT /api/notes | Save one lesson note, up to 10,000 JavaScript string code units |
| PUT /api/profile | Save daily study minutes and an IANA timezone |
| GET /api/quiz?moduleId=1 | Get the next checkpoint form and revision after completing its lessons |
| POST /api/quiz | Validate five exact answer keys and the issued revision, grade and atomically persist one attempt |
| GET /api/export/portfolio | Download one indexed JSON portfolio with saved beginner, advanced and teaching records, including historical snapshots and practical attempts |
| GET /api/export | Download the current user's beginner learning record as JSON |
| GET /api/export?format=csv | Download a spreadsheet-safe CSV learning record |
| GET /api/health | Verify the required application schema and uniqueness constraints. Returns HTTP 503 for a partial migration. |

A new account has no completions or quiz results. Lessons may be previewed freely. Completion requires the preceding lesson and the preceding module's checkpoint. A checkpoint passes at 5/5. Review intervals are 1, 3, 7, 14 and 30 days after successive recalls; a miss schedules another review in one day. Due reviews update in an open tab every 30 seconds and on focus, visibility, and navigation. The app supplies an illustrative self-study schedule, not notifications or automated trading.

## Update the course

The source lessons live in the parent beginner directory. After editing source material, regenerate the committed content snapshot from this checkout:

```sh
npm run content:import
npm run content:check
npm run lint
npm test
npm run typecheck
npm run build
```

An independently deployed checkout can build from the committed content JSON without the parent repository. Regeneration and the read-only freshness check need the parent Markdown files. The importer requires exactly 8 modules and 64 ordered lessons and copies the reference library for in-app reading. `content:check` compares the course/library snapshots, hosted Python/data attachments, and offline ZIP without repairing or rewriting a stale artifact.

When changing the database, edit db/schema.ts and run npm run db:generate. Inspect and retain the generated SQL and Drizzle metadata. Migrations change schema only; content is bundled with the application. Sites applies pending hosted migrations during publication. Never edit an applied migration.

## Verification and deployment

See the parent [verification report](../VERIFICATION_REPORT.md) for the exact checks and their limits. Browser tests use an installed Chromium-compatible browser; development used Google Chrome on macOS. The source includes test scripts; screenshots and local runtime state are ignored and are not production user data.

With the local preview running, execute `node --experimental-strip-types tests/api.integration.mjs`, then `node tests/browser.integration.mjs` separately; each restores its original portable test-user records. `node tests/ui-regressions.integration.mjs` uses mocked API responses and tests review time transitions, failed-read retries, contrast, and search focus without database writes. Tests also cover streamed-body cancellation, Unicode notes, concurrent quiz/review submissions, migration preservation, answer evidence, and content freshness.

Security updates pin a compatible React/Vinext/Vite/Cloudflare stack. The transitive overrides in package.json keep known vulnerable parser/build-tool versions out of the lockfile; review them with dependency updates, and validate Drizzle generation, lint, the build, and local runtime behavior after changing them. `npm audit` covers development tooling as well as direct production dependencies.

Publishing uses the Sites workflow and the exact project_id in .openai/hosting.json. Preserve the private audience, push the source corresponding to the built artifact, save that version, and deploy it. Never commit credentials, .env files, local databases or .sites-runtime. Production database backups and organizational retention are platform operations; JSON/CSV export gives the learner a portable copy of their own record.

Validation preparation now includes four checked parallel written cases, a learner ZIP containing separate initial/update packets without instructor keys, an external expert review brief and a rating/report template. Read `VALIDATION_READINESS.md` in the Resource library for the owner’s decision to recruit participants later and the AI-assisted audit scope. No human approval or participant outcome is prefilled.
