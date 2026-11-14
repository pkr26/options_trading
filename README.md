# Options Academy application

A complete beginner learning app for U.S. stock and ETF options. The course contains 64 short lessons, 8 module checkpoints with 2 quiz forms, daily recall reviews, notes, an educational expiration-payoff chart and a reference library. Default study time is 15 minutes. Course completion does not establish trading profitability.

## Application design

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

All learning records are stored in D1, not browser storage. Local previews and the hosted app use separate databases. User keys come from trusted platform identity, and each read and write filters by that user. Notes are rendered as text; course Markdown does not enable raw HTML. Mutation requests validate origin, content type and payload. The server calculates quiz scores, checks completion order and module prerequisites, and stores attempts. The two quiz forms alternate; once seen, they are review practice rather than unseen assessment.

## Run locally

Install Node.js 22.13 or newer. Node24 was used during development. From this directory:

```sh
npm ci
npm run typecheck
npm test
npm run build
```

The tracked hosting manifest declares the DB binding. Apply pending local schema migrations in filename order once per local database. For the initial migration:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_loving_thanos.sql
npm run dev -- --port 5173
```

Visit the printed loopback URL. Select **Sign in with ChatGPT**. Portable development simulates sign-in with a local test user; no external account or secrets are required. Production does not include that mock identity. The dev server and local migrations share .wrangler/state. Do not apply a migration again to the same database.

Builds and local preview require network access when dependencies are not cached. The app itself does not request a market data feed or connect to a brokerage.

## Backend endpoints

| Method and path | Behavior |
| --- | --- |
| GET /api/learning | Authenticated profile, progress, notes and attempts |
| POST /api/progress | Complete the next lesson or log a recall review |
| PUT /api/notes | Save one lesson note, up to 10,000 characters |
| PUT /api/profile | Save daily study minutes and an IANA timezone |
| GET /api/quiz?moduleId=1 | Get the next checkpoint form after completing its lessons |
| POST /api/quiz | Validate and grade answers on the server, persist the attempt |
| GET /api/export | Download the current user's learning record as JSON |
| GET /api/export?format=csv | Download a spreadsheet-safe CSV learning record |
| GET /api/health | Check runtime database readiness without revealing user data |

A new account has no completions or quiz results. Lessons may be previewed freely. Completion requires the preceding lesson and the preceding module's checkpoint. A checkpoint passes at 5/5. Review intervals are 1, 3, 7, 14 and 30 days after successive recalls; a miss schedules another review in one day. The app supplies an illustrative self-study schedule, not notifications or automated trading.

## Update the course

The source lessons live in the parent beginner directory. After editing source material, regenerate the committed content snapshot from this checkout:

```sh
npm run content:import
npm test
npm run typecheck
npm run build
```

An independently deployed checkout can build from the committed content JSON without the parent repository. Regeneration needs the parent Markdown files. The importer requires exactly 8 modules and 64 ordered lessons and copies the reference library for in-app reading.

When changing the database, edit db/schema.ts and run npm run db:generate. Inspect and retain the generated SQL and Drizzle metadata. Migrations change schema only; content is bundled with the application. Sites applies pending hosted migrations during publication. Never edit an applied migration.

## Verification and deployment

See the parent [verification report](../VERIFICATION_REPORT.md) for the exact checks and their limits. Browser tests use an installed Chromium-compatible browser; development used Google Chrome on macOS. The source includes test scripts; screenshots and local runtime state are ignored and are not production user data.

Publishing uses the Sites workflow and the exact project_id in .openai/hosting.json. Preserve the private audience, push the source corresponding to the built artifact, save that version, and deploy it. Never commit credentials, .env files, local databases or .sites-runtime. Production database backups and organizational retention are platform operations; JSON/CSV export gives the learner a portable copy of their own record.
