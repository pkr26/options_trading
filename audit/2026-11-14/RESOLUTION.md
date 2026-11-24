# Options course audit resolution

All 14 findings in the [original audit](REPORT.md) are corrected in the course and application source. The original report, hashes, and failure evidence remain historical records. This follow-up records the fixes, their regression checks, and the additional improvements delivered with them.

## Finding status

| Finding | Status | Correction and evidence |
| --- | --- | --- |
| F01 Streamed request-size bypass | Fixed | A shared reader measures actual bytes and cancels oversized streams at 64 KiB. Headerless, understated-length, and streamed bodies are covered by unit and HTTP tests. |
| F02 Concurrent checkpoint duplication | Fixed | The issued quiz revision becomes a unique per-user/module sequence. Concurrent duplicate requests produce one success and one conflict; form parity and stale-revision rejection remain correct. |
| F03 Lost recall updates | Fixed | A conditional reviewRevision update rejects a competing request instead of overwriting it. HTTP checks cover matching and opposing recall outcomes. |
| F04 Hidden newly due reviews | Fixed | A clock updates every 30 seconds and on focus, visibility, and navigation. Browser tests advance time without reloading or fetching new learning state. |
| F05 Resource Retry | Fixed | Resource and library retries invoke their failed reads. Mutation recovery has explicitly labeled reload actions. Browser tests recover both a failed list and a failed document. |
| F06 Low text contrast | Fixed | Tested assumptions/limitations use 12px text with contrast ratios 6.15:1, 6.41:1, and 6.06:1. Search focus is visible, navigation focuses content, and Escape closes mobile navigation. This is not a claim of full accessibility conformance. |
| F07 Invalid opening ledger state | Fixed | Construction and public method boundaries validate contract, finite cash, and whole nonboolean positions. Candidate balances are validated before state is committed. |
| F08 Conflicting research requirements | Fixed | Preregistration, accounting, execution, and later evaluation now branch by synthetic, published-index, and licensed-contract evidence. |
| F09 Wrong assessment destination | Fixed | Advanced first-week references point to ADVANCED_FIRST_WEEK.md. Personal entries, dates, and pending evidence were preserved. |
| F10 Missing calendar-arbitrage teaching | Fixed | Volume 4 now provides qualified assumptions, a worked price inversion, a cash/share ledger, counterexamples, fresh questions, and a pass gate. Independent Decimal checks cover 84 price paths. |
| F11 Blanket zero-bid rejection | Fixed | Data guidance distinguishes impossible quotes from genuine illiquidity and preserves held exposures and unresolved exits. |
| F12 Invalid displayed quote sizes | Fixed | Fractional, boolean, NaN, and infinite sizes are flagged before fill simulation; whole zero/negative sizes follow the unavailable-liquidity policy. |
| F13 Inconsistent Unicode note limit | Fixed | The 64 KiB wire budget accommodates 10,000 JavaScript string code units, including Unicode and worst-case JSON escaping. The UI/schema and documented limits agree. |
| F14 Failing lint | Fixed | The configured full lint check passes with zero errors and warnings. State effects, clock handling, unused projections, JSX text, and the module variable were corrected. |

## Additional improvements delivered

New checkpoint attempts preserve answer selections, full graded feedback, and course/question versions. JSON export format 2 and CSV carry that evidence. Older attempts retain their original scores and honestly leave unavailable historical evidence empty.

`npm run content:check` compares source lessons and references with committed JSON, hosted attachments, and the offline ZIP. It fails on drift without rewriting outputs. Its regression test deliberately changes a temporary source lesson and attachment, verifies detection, and confirms the artifacts remain untouched.

The dependency update covers the original six flagged packages and additional framework/development alerts found during remediation. The final installed full-tree `npm audit` reports **zero known advisories**, including development dependencies. This is a registry result on November 14, 2026, not a guarantee that dependencies contain no unknown vulnerabilities. The scan is saved in [remediation-npm-audit.json](remediation-npm-audit.json).

The compatible stack uses React/DOM/RSC 19.3.1, Vinext 1.4.5, Vite 8.3.8, Cloudflare Vite plugin 1.69.1, Wrangler 4.162.0, Next compatibility package 16.4.6, Zod 4.6.7, and Drizzle Kit 0.31.11. Scoped transitive overrides avoid vulnerable parser/build-tool releases. Drizzle generation, lint, types, the production build, and local runtime behavior were checked after installation.

## Validation

| Check | Result |
| --- | --- |
| Python | All 24 tests pass. The synthetic demo retains its expected D1 $38 and D2 −$42 results. |
| Node unit/content/quiz/export | All 19 tests pass. |
| Lint and TypeScript | Both pass; lint has zero errors/warnings. |
| Local authenticated API | 49 HTTP status checks plus persistence, concurrency, grading, evidence export, and two-user isolation assertions pass. Original portable test-user rows were restored. |
| Desktop/mobile browser | All 14 smoke stages pass. Original test-user rows were restored; no production learning record was populated. |
| Targeted browser regressions | Review clock/focus, list/document retries, contrast, and search focus pass both in development and against the built Worker artifact. API responses are mocked; no learning-data writes occur. |
| Built artifact HTTP smoke | Home, health, resources, and ZIP return 200; unsigned learning returns 401. |
| Migration | Appended schema-only migration preserves existing scores/counts, leaves historical answer fields nullable, and rejects duplicate new sequences. Local application succeeds; Drizzle reports no additional changes. |
| Content/downloads | Fresh course/library snapshots, hosted Python/data copies, and 49-file ZIP match source. CRCs and local reference checks pass. |
| Dependency audit | Zero advisories across the installed production and development tree. |
| Production build | Passes. Framework sourcemap and chunking notices are build-tool diagnostics; no failed build is being treated as passing. |

The new migration is [0001_modern_firestar.sql](../../course-app/drizzle/0001_modern_firestar.sql); migration 0000 is unchanged. The course parent directory is not a Git repository; application source, snapshots, and migrations are versioned in the app repository. The hosted update uses the existing owner-private Sites workflow and preserves its audience.

The [improvement roadmap](ROADMAP.md) prioritizes fresh skill-based practice, a visible mistake history, recoverable drafts, lesson links, lifecycle simulations, release checks, and measured learning outcomes. Those future milestones are distinct from the fixes implemented here.

## Publication

The private publication succeeded on November 14, 2026. The [updated application](https://options-academy-pradeep.giftedpage.chatgpt.site) retains the existing owner-only audience. The source helper rebuilt, committed, pushed, and packaged source revision `1785410cc3e65cb277db03d44b940d2a1224d432`; the private publication tool returned a terminal success for that artifact. No extra production test completions were created.
