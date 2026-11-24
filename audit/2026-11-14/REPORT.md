# Options course audit

**Date:** November 14, 2026, America/Phoenix. **Scope:** the complete local course, assessments, Python laboratories, downloadable teaching package, and learning application.

The course's financial mechanics and worked arithmetic are sound under the stated classroom assumptions. No critical or high-severity financial-mechanics error was identified. The audit found **14 actionable issues: nine medium and five low**, plus a separate dependency advisory register. The most consequential defects affect request limits, concurrent learning updates, review visibility, readability, and laboratory input validation. The advanced course also has inconsistent research requirements and one promised skill without worked teaching or assessment.

The application passes its existing tests, type check, production build, and local API/browser exercises. Those checks do not cover all the failures reproduced here. This is an internal technical and content audit, not independent accreditation or evidence of trading profitability. Course and application source were left unchanged; this directory contains the audit deliverables.

## Prioritized findings

P2 means a medium defect worth correcting in the next maintenance pass. P3 means a lower-impact consistency, edge-case, or engineering issue. No P0/P1 application exploit was established. Dependency advisory severity is reported separately from demonstrated application reachability.

| ID | Priority | Finding | Source location |
| --- | --- | --- | --- |
| F01 | P2 | Missing Content-Length bypasses the intended request-size limit | [lib/api.ts](../../course-app/lib/api.ts), line 12 |
| F02 | P2 | Concurrent checkpoint submissions duplicate attempts and break form alternation | [quiz route](../../course-app/app/api/quiz/route.ts), lines 29–33 |
| F03 | P2 | Concurrent recall updates lose an acknowledged result | [progress route](../../course-app/app/api/progress/route.ts), lines 12–17 |
| F04 | P2 | Newly due reviews remain hidden in an already open app | [course-app.tsx](../../course-app/components/course-app.tsx), line 93 |
| F05 | P2 | Retry clears a resource error without retrying its failed request | [course-app.tsx](../../course-app/components/course-app.tsx), error notice handler, line 163 |
| F06 | P2 | Important assumptions and limitations have insufficient text contrast | [globals.css](../../course-app/app/globals.css), lines 29 and 40 |
| F07 | P2 | Ledger initialization accepts fractional contracts and nonfinite cash | [options_lab.py](../../labs/options_lab.py), lines 84–90 and 109–127 |
| F08 | P2 | Research-path requirements demand unavailable fills from published-index evidence | [MASTERY_TRACKS.md](../../MASTERY_TRACKS.md), lines 26–29 |
| F09 | P2 | The preserved learning record points to a repurposed assessment page | [MY_LEARNING_RECORD.md](../../MY_LEARNING_RECORD.md), lines 15, 21, and 30 |
| F10 | P3 | Calendar-arbitrage checks are promised without a worked lesson or pass task | [COURSE.md](../../COURSE.md), line 84 |
| F11 | P3 | Blanket zero-quote rejection conflicts with the detailed data-quality lesson | [COURSE.md](../../COURSE.md), line 70 |
| F12 | P3 | Directly constructed quotes accept invalid displayed sizes and fractional fills | [options_lab.py](../../labs/options_lab.py), lines 246–274 and 318 |
| F13 | P3 | The advertised note length and byte limit disagree for Unicode | [notes route](../../course-app/app/api/notes/route.ts), line 4; [lib/api.ts](../../course-app/lib/api.ts), line 12 |
| F14 | P3 | The configured lint check fails with 13 errors and 11 warnings | [course-app.tsx](../../course-app/components/course-app.tsx); [package.json](../../course-app/package.json), line 13 |

### F01 Enforce request size using measured bytes

The shared mutation guard checks only the Content-Length header and treats an absent header as zero. Routes then call `request.json()` on the entire body. A 100,050-byte headerless request containing a valid short note and a large ignored property passed the actual route code in an isolated execution. Against localhost, the same 100,045-byte invalid-lesson payload returned 413 with Content-Length, but reached schema validation and returned 400 when streamed without it. The HTTP check used lesson ID 0 and made no database write.

Authenticated clients can therefore bypass the application's intended input budget. No availability outage was attempted or demonstrated. A platform body limit may still apply, but it does not implement this 25,000-byte application limit.

**Correction:** use a shared JSON reader that counts streamed bytes and stops at a documented bound. Keep Content-Length as an early check. Bound checkpoint answer keys before validating an arbitrary record. Apply the reader to every mutation route and reconcile it with F13.

### F02 Consume checkpoint submissions atomically

The checkpoint route reads the attempt count, checks variant parity, then inserts a fresh UUID row. Two concurrent variant-0 requests can both observe zero previous attempts and both succeed. Controlled execution of the unchanged route code returned two HTTP 200 results, stored variants `[0, 0]`, and selected variant 0 again for the next form. This bypasses the promised stale-form protection and alternation, while server grading and user scoping remain intact.

**Correction:** issue a persisted attempt token or revision and atomically consume it using a database constraint or conditional operation. A repeated submission should return its existing result or a conflict, without adding a second attempt. Verify with a controlled concurrent-submission test. The reproduction uses an injected in-memory database boundary; it is not a production concurrency test.

### F03 Make recall updates atomic or idempotent

The recall route reads `reviewCount`, calculates a new value, then replaces the stored count. Two concurrent successes starting from zero both acknowledge success but leave a count of one. A concurrent success and miss can also overwrite one another according to completion order.

**Correction:** define whether repeated submissions represent the same scheduled recall, then use an idempotency token or optimistic revision check. If separate recalls are accepted, update the count and schedule atomically. The existing serial integration test does not exercise this interleaving; the isolated real-source reproduction does.

### F04 Refresh the due-review calculation as time passes

The due-review list is memoized only on `data`. Time passing and navigation do not change that dependency, and the app does not refresh learning state on focus or review navigation. In Chrome with a controlled clock, a completed lesson was due November 15. After advancing the open app to November 16 and navigating to reviews, the app still showed zero reviews and said the learner was caught up. Reloading immediately showed the one due review.

**Correction:** update a clock state at an appropriate interval or next due time, and recompute or refresh when the tab regains focus or the review view opens. Verify a due-time transition without reloading. See [ui-evidence.json](ui-evidence.json).

### F05 Retry the failed resource operation

The shared Retry button always refreshes `/api/learning`. It does not retry a failed reference-document fetch. With the first resource request forced to return 503 and the next configured to succeed, clicking Retry cleared the error but left the document missing. The resource request count stayed at one. Returning to the library and reopening the resource made the second request and displayed it.

**Correction:** retain an operation-specific retry callback or resource failure state, and retry the selected resource. Use accurate recovery actions for failed writes rather than a generic Retry that only reloads unrelated learning state. See [ui-evidence.json](ui-evidence.json).

### F06 Increase contrast for educational caveats

Chrome computed-style measurements show that three visible, meaningful text elements fall below the 4.5:1 contrast required for normal text by [WCAG 2.2 contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html). These are active explanatory text, rather than disabled controls or decoration.

| Text | Foreground | Background | Size | Contrast |
| --- | --- | --- | --- | --- |
| Chapter assumptions and study notes | `#8da174` | `#f9fbf5` | 10px | 2.69:1 |
| Standard contract, multiplier, fictional prices, taxes | `#a5b193` | `#ffffff` | 9px | 2.26:1 |
| Payoff-model limitations and exercise warning | `#a5af96` | `#f8f9f5` | 9px | 2.17:1 |

The small type makes these omissions particularly consequential for learners who need the assumptions to interpret a calculation. The main lesson body is more legible; the finding concerns these measured elements and related muted UI text.

**Correction:** darken explanatory text to at least 4.5:1, increase the small caveat text for comfortable reading, and check the shared muted styles across reader, practice, preferences, and dashboard screens. Contrast alone is not a complete accessibility assessment.

### F07 Validate opening ledger state

Trade methods validate contract quantities, but the dataclass constructor does not. `Ledger(Contract('C100', 100, 'call'), cash=10000, option_qty=0.5).settle(110)` creates 50.0 shares and leaves $5,000 cash. Boolean quantity `True` acts as one contract, and NaN cash propagates into equity. This contradicts the lab README's general claim that fractional option quantities are rejected. Python annotations do not enforce that invariant.

**Correction:** validate finite cash, non-boolean integer option quantities, and appropriate share quantities in `__post_init__`. Protect mutation/settlement boundaries if fields remain publicly mutable. Check that rejected operations leave state unchanged. Update the hosted copy through the importer after fixing the source. The supplied fixtures and ordinary lab tests do not trigger this defect.

### F08 Branch advanced requirements by available evidence

The independent-research path accepts synthetic, published-index, and licensed historical-contract projects, then unconditionally demands trade/portfolio ledgers, quote-side fills, nonfills, assignments, and later frozen-rule evaluation. Published-index observations cannot supply their constituent option fills. In contrast, [RESEARCH_LAB.md](../../RESEARCH_LAB.md), lines 61, 69, and 75, explicitly substitutes published-series reconciliation for level B and synthetic system checks for level A.

**Correction:** carry the A/B/C distinctions into items 3–4 of the path: simulator cases for A, source/index reconciliation and publication tracking for B, and contract execution/ledger/forward evaluation for C. Keep any separate hypothetical operations exercise explicitly labeled. A learner should be able to satisfy the accepted evidence level without inventing unavailable data.

### F09 Restore the advanced assessment destination

The personal learning record still describes `START_HERE.md` as the seven-day introduction and requires its ten questions. That file now contains a beginner first-day lesson and no ten-question exam. [ADVANCED_FIRST_WEEK.md](../../ADVANCED_FIRST_WEEK.md) contains the intended introduction and assessment. All targets exist, so an existence-only link checker misses the problem.

**Correction:** retarget the three references and the gate's literal filename to `ADVANCED_FIRST_WEEK.md`. Preserve the learner's existing entries, dates, and pending statuses. The personal record was not copied into this audit directory or the published course package.

### F10 Supply the promised calendar check

Module 19 lists calendar and butterfly arbitrage checks. [Teaching Volume 4](../../LESSONS_04_RESEARCH.md), lines 17–21 and 41, demonstrates forward-variance arithmetic and same-expiry strike monotonicity/convexity, but provides no calendar-check condition, violating two-expiry example, or assessment. A search of the course found no separate lesson filling that gap.

**Correction:** add a qualified two-expiry European-option example with explicit rates, dividends, and moneyness/forward assumptions, plus a fresh pass task; or narrow the syllabus promise. Falling annualized implied volatility across expiries is not by itself a valid arbitrage test.

### F11 Preserve valid zero-bid illiquidity in data QA

The course map says to reject crossed, zero, and stale quotes. [Teaching Volume 3](../../LESSONS_03_QUANT.md), lines 215–217 and 221, correctly explains that a zero bid can be real and should be retained or flagged when investigating whether an exit was possible. A learner following only the map could delete illiquid outcomes from a study.

**Correction:** distinguish impossible observations from valid zero-bid conditions. Apply prespecified executable-price rules, report exclusions, and preserve held positions and unresolved exits. The audit did not find that the bundled lab currently erases such positions.

### F12 Validate quote sizes before modeling a fill

Direct `Quote` construction or `dataclasses.replace` accepts fractional, boolean, and nonfinite sizes. Replacing a fixture's ask size with 0.5 produces no quote flag and models a fill of 0.5 contracts. A NaN ask size also passes validation and can yield a full modeled fill. The CSV loader's `int()` conversion protects the supplied fixture path, so this finding concerns direct use of the public helper.

**Correction:** require non-boolean integer displayed sizes and define zero/missing-size behavior before calling `min(quantity, size)`. Add fractional, boolean, NaN, and infinity cases. The [OCC's standard equity-option specifications](https://www.theocc.com/clearance-and-settlement/clearing/equity-options-product-specifications) distinguish whole contract counts from the deliverable adjustments taught in the course.

### F13 Make note limits consistent across encodings

The UI and note schema allow 10,000 JavaScript string code units. A note containing 10,000 Chinese characters satisfies that schema but produces a 30,027-byte JSON body, so a normal Content-Length request receives 413. An equal-length ASCII note fits the byte limit. The UI does not describe this difference.

**Correction:** choose compatible measured-byte and string limits and state them accurately. Allow for JSON escaping as well as UTF-8 encoding; simply increasing the cap to 30,000 bytes would still exclude some otherwise valid inputs. Resolve this with the bounded reader in F01.

### F14 Restore a passing lint gate

`npm run lint` exits 1 with 13 errors and 11 warnings. Errors include state updates in effects, `Date.now()` during render, assignment to a variable named `module`, and unescaped JSX apostrophes. Warnings include unused imports and intentionally stripped properties. This does not invalidate the passing TypeScript or build results, and individual lint diagnostics are not all runtime failures.

**Correction:** address the meaningful state/clock issues, tidy the remaining diagnostics, and make the configured lint policy deliberate. Include lint in the release check if it is intended to be a required gate. Raw diagnostics are preserved in [lint.json](lint.json).

## Dependency advisory register

`npm audit --omit=dev --json` exited 1 and flagged **six installed packages: one critical, three high, and two moderate** at the package level. This is a dependency-version finding; no critical application exploit was established. The app runs on Vinext/Cloudflare Workers, and several flagged Next.js features are unused or replaced by that runtime.

| Package | Installed version | Registry severity | Reachability and next action |
| --- | --- | --- | --- |
| next | 16.3.4 | Critical | No application `next/og`, `ImageResponse`, `use cache`, Server Actions, or Next Node image-optimizer path was found. Review compatible patched versions with Vinext, update the lockfile, and rerun app checks. |
| sharp | 0.35.4 | High | No native sharp decoder was found in the built course server. The explicit Miniflare override also pins this version for local tooling. Review/remove that pin and use a compatible patched version. |
| zod | 3.25.76 | High | The cited advisory concerns oversized array validation; these API schemas use scalar/object/record forms. F01 is independently confirmed. The registry's suggested fix crosses a major version, so assess all schemas and connector compatibility before migrating. |
| source-map-js | 1.2.1 | High | Present in Next/PostCSS/build-tool chains; no application source-map ingestion endpoint identified. Update compatible transitive dependencies. |
| fast-uri | 3.1.7 | Moderate | Present through AJV/resolver dependencies; course routes use Zod and WHATWG URL. No affected authorization comparison identified. Update compatible transitive dependencies. |
| baseline-browser-mapping | 2.10.30 | Moderate | Build-target tooling; no course-user-controlled invocation identified. Update compatible transitive dependencies. |

The [Next.js typed-array cache advisory](https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr) requires a particular cache feature. The [sharp maintainer advisory](https://github.com/lovell/sharp/security/advisories/GHSA-wq5f-xc86-pv6w) describes runtime-specific SVG decoding conditions and identifies 0.35.5 as patched. Those conditions must not be inferred merely from installed package names. The [Zod advisory](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) and complete registry output are retained for maintenance review.

**Action:** perform a compatibility-aware dependency update before the next publication. Avoid `npm audit fix --force` without review. See [npm-audit.json](npm-audit.json) and [api-review.txt](api-review.txt) for the full advisory and reachability analysis.

## Verification results

| Check | Result and scope |
| --- | --- |
| Beginner content | All 64 lessons, worked examples, questions, checkpoint keys, and capstone ledgers reviewed; no numerical defect found. |
| Foundation bank | All 40 cases independently recomputed with Decimal arithmetic; all 200 checked fields matched. |
| Advanced content | Four teaching volumes, 104-week map, risk/research/operations/hedging/execution material reviewed. Both embedded Python demos and 23 additional cross-volume numerical checks passed. |
| Generated payoff bank | 1,200 cases across three seeds reconciled independently. |
| Python laboratory | All 20 supplied tests passed; fixture hashes matched. Synthetic assumptions remain explicit. |
| App unit/content/export/quiz tests | All 13 tests passed, including the canonical answers for 80 quiz instances. |
| TypeScript | `npm run typecheck` passed. |
| Production build | `npm run build` passed all five build stages and generated all app/API routes. |
| Lint | Failed: 13 errors and 11 warnings; F14. |
| Local API integration | 39 HTTP status checks plus persistence, grading, reviews, export, and two-user isolation assertions passed. Original portable test-user rows restored. |
| Browser integration | 14 smoke stages passed in headless Google Chrome: notes, reload, completion, quizzes, recall, resources, payoff arithmetic, preferences, attachments, and mobile layout. Original local test-user rows restored. |
| Additional browser cases | Reproduced F04/F05 with controlled time/network and measured F06 using computed styles. These cases mock learning responses and make no learning-data writes. |
| Additional API cases | Reproduced F01/F02/F03/F13 against actual route source with injected DB/auth boundaries; F01 additionally verified through read-only localhost HTTP requests. |
| Local references | All 344 original local Markdown file links passed; after adding the audit, all 381 links in 40 scanned Markdown files passed. Semantic destination mismatch F09 remains despite link existence. |
| Content/package freshness | Fresh importer output in an isolated temporary tree exactly matched both committed JSON snapshots and the ZIP. Source/public Python and fixture copies matched. |
| Offline download | 49 entries; valid CRCs and internal Markdown targets; personal record replaced by a blank template; no application state included. |
| External destinations | All 115 URLs from the 38 course documents checked for availability: 94 accessible by HTTP, two FRED pages verified through the web tool after timeouts, 19 restricted/challenged. Zero confirmed broken destinations. |

The existing [verification report](../../VERIFICATION_REPORT.md) is broadly consistent with the successful ordinary-path checks. Its passing tests should not be interpreted as coverage of concurrency, streamed request limits, temporal review transitions, or full accessibility. The current browser script reported 14 stages; the earlier report's historical count is 13.

## Content and source coverage

All **38 course Markdown documents** were read: every root course document, all 12 beginner documents, the lab README, and the app README. The audit covered assessments and answer keys, learning guides and records, all four advanced volumes, the source library, and both verification records. File hashes are in [scope.json](scope.json).

Executable coverage includes Python code/tests/generators, all supplied CSV/JSON fixtures, first-party application routes, authentication and database code, quiz/scheduling/export helpers, reader/payoff UI, custom styles, importer/download packaging, migrations, and the existing integration/test workflows. Vendored UI dependencies and hosting internals were inspected only where needed for the app behavior and advisory analysis; this is not an audit of every third-party dependency's implementation.

Primary financial checks independently confirmed the course's treatment of exercise-by-exception and broker exceptions, one-leg assignment and after-hours risk, adjusted deliverables versus premium multipliers, Greek units, and current reference dates. See [OIC exercise](https://www.optionseducation.org/referencelibrary/faq/options-exercise), [FINRA assignment](https://www.finra.org/investors/insights/trading-options-understanding-assignment), [OIC contract adjustments](https://www.optionseducation.org/news/splits-happen), and [OIC delta](https://www.optionseducation.org/advancedconcepts/delta).

The margin-transition dates agree with [FINRA Notice 26-10](https://www.finra.org/rules-guidance/notices/26-10). The quote-size convention change agrees with [Cboe DataShop](https://datashop.cboe.com/option-quote-intervals), and the dated tax reference agrees with the available [IRS Publication 550 page](https://www.irs.gov/publications/p550). The 115-link scan establishes destination availability within its access limits; it does not mean every external course, academic full text, or publisher offering was fully re-audited. Detailed results and referrers are in [external-links.json](external-links.json).

## Further improvements

These are opportunities rather than additional confirmed defects:

- Add an independent beginner retest bank for concepts and operations after both app forms have been seen. The current generator primarily covers payoff arithmetic.
- Preserve checkpoint answer selections and per-attempt course/question versions, rather than only scores. The current schema cannot reconstruct individual mistakes after the feedback screen is gone. The workbook remains the place to retain reasoning manually.
- Add a check-only importer mode to compare source material against committed course/library JSON and ZIP in release checks. They match now, but ordinary content tests do not fully protect future snapshot freshness.
- Explain the distinction between probability zero and impossibility when moving from finite examples into continuous models.
- Add forecast-availability times, outcome definitions, and horizons before extending the invented Brier exercise into point-in-time forecast validation.
- Measure actual lesson duration, retention, and misconception rates with learners. Current pacing and pass thresholds are design choices, with split-session allowances already documented.

## Correction order and acceptance checks

1. Resolve measured request limits and atomic quiz/recall updates. Accept only if bounded streamed inputs and controlled concurrent submissions behave consistently without duplicate or lost records.
2. Correct the review timer, resource Retry action, and low-contrast explanatory text. Re-run the two browser reproductions, check the measured contrast values, then run the existing browser/API suite.
3. Validate Ledger opening state and direct Quote sizes. Add focused regression cases and rerun the existing Python suite and demonstration.
4. Align the research path, learning-record destinations, zero-bid instruction, and calendar-check scope. Regenerate snapshots/downloads only after reviewing source changes; compare the resulting teaching package with the source.
5. Update dependencies with compatibility review, restore lint, and repeat the relevant build, tests, and advisory scan. A dependency scan must retain the distinction between version flags and reachable application behavior.

## Evidence and reproduction

The application Git revision was `d822053ae0016c0ce6c2c61b4e8dcdee078b0aac` and its tracked working tree remained clean. The parent course directory is not a Git repository. No production sign-in, production learning records, publication, dependency update, or course correction was performed.

| Artifact | Contents |
| --- | --- |
| [beginner-review.txt](beginner-review.txt) | Full beginner/foundation coverage and arithmetic/source checks |
| [advanced-review.txt](advanced-review.txt) | Advanced scope, findings, numerical checks, and source access limits |
| [labs-review.txt](labs-review.txt) | Lab/fixture/package checks, exact reproductions, and snapshot hashes |
| [api-review.txt](api-review.txt) | Request, concurrency, Unicode, auth-boundary, and dependency analysis |
| [ui-evidence.json](ui-evidence.json) | Controlled browser results and measured contrast |
| [external-links.json](external-links.json) | All 115 URL availability results and source file/line referrers |
| [npm-audit.json](npm-audit.json) | Raw production-dependency audit response |
| [lint.json](lint.json) | Raw configured lint diagnostics |
| [scope.json](scope.json) | Original document hashes and source revision |

Run `node audit/2026-11-14/reproduce-api.cjs` from the course root for the isolated API cases. It loads the actual app source and uses in-memory substitutes for authentication/database operations. Run `python3 audit/2026-11-14/reproduce-labs.py` for the laboratory cases.

For the browser and read-only HTTP reproductions, start the documented local app at `http://127.0.0.1:5173`, then run `node audit/2026-11-14/reproduce-ui.mjs` or `node audit/2026-11-14/reproduce-http.mjs`. Browser reproduction requires an installed Chrome-compatible executable; `CHROME_EXECUTABLE` can select it. HTTP reproduction uses the documented portable local mock identity and invalid lesson ID 0, so it cannot update a learning record.

Live execution quality, licensed historical-contract data, gated external lessons, personal suitability/tax treatment, production edge configuration, backup/restore operations, and measured learning outcomes remain outside the verified scope. Synthetic calculations and short paper records cannot establish a live trading edge.
