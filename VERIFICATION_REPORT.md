# Options course verification report

**Review date: November 14, 2026.** This report covers the existing course, the new 64-lesson beginner path and the full-stack learning app. Three parallel reviews examined foundations, advanced material and executable labs. These are internal technical reviews, not accreditation or an external audit of trading performance.

**Current update:** a subsequent full audit identified 14 defects and a dependency advisory register. The appended audit-corrections section records the fixes and current verification results. Earlier test counts below retain the scope of the initial review.

## Course findings and corrections

| Area | Finding and action |
| --- | --- |
| Starting from zero | The previous default was 104 weeks at 10 hours weekly and introduced many terms in the first sitting. The main path now has 64 micro lessons for 10–15 minute sessions. The long curriculum remains an optional advanced route. |
| Prerequisites | Removed the unsupported assumption that the learner can already program. Coding and calculus are not required for the beginner path. |
| Purchased options at expiry | Added exercise-by-exception and the possibility of a share purchase or short-stock position, with separate funding and subsequent share risk. A premium-loss bound for an option is not a bound on a stock position created by exercise. |
| Closing versus writing | Taught sell-to-close versus sell-to-open early, then repeated it in the lifecycle module. Selling an owned option does not by itself mean opening a short option. |
| Execution casebook | Corrected the description from three to four replay episodes. |
| Practice access | Clarified IBKR's funded regular paper-account workflow versus its separate trial; notebook simulation requires no broker account or deposit. Removed a CME course lesson count that could not be confirmed from its public page. |
| Advanced policy | Made the full research gates an optional extended training policy, rather than a prerequisite for all beginner learning goals. No course quiz automatically authorizes live trading. |
| Source dates | Preserved October 26 verification history separately; no old catalog or paid-data check was silently relabeled as newly completed. |

The foundation review recomputed the written long/short call and put examples and 40-case answer bank; no numerical corrections were needed. The advanced review checked worked strategy, Greek, hedge and assignment examples under their stated assumptions. New examples and capstone ledgers were recomputed. Fictional quotes and probability inputs are teaching assumptions, not observed returns or market forecasts.

## Primary sources checked for this review

| Subject | Source and supported scope |
| --- | --- |
| Options rights and risks | [SEC options bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63), [OCC disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document). Standard stock-option rights, premiums and risk; check exact series for expiry conventions. |
| Exercise and assignment | [OIC exercise FAQ](https://www.optionseducation.org/referencelibrary/faq/options-exercise), [OIC exercise overview](https://www.optionseducation.org/optionsoverview/exercising-options), [FINRA assignment](https://www.finra.org/investors/insights/trading-options-understanding-assignment). Early assignment, clearing-member exercise-by-exception, broker exceptions, single-leg exposure and after-hours risk. |
| Pricing and Greeks | [OIC pricing](https://www.optionseducation.org/optionsoverview/options-pricing), [delta](https://www.optionseducation.org/advancedconcepts/delta), [gamma](https://www.optionseducation.org/advancedconcepts/gamma), [theta](https://www.optionseducation.org/advancedconcepts/theta), [vega](https://www.optionseducation.org/advancedconcepts/vega). Intrinsic/extrinsic value and local sensitivity estimates, with other inputs held fixed. |
| Adjustments and product differences | [OIC splits](https://www.optionseducation.org/news/splits-happen), [Cboe specifications](https://www.cboe.com/tradable_products/sp_500/spx_weekly_options/specifications). Premium multipliers and deliverables are separate; exercise style and settlement depend on the exact product and expiration. |
| Margin transition | [FINRA Notice 26-10](https://www.finra.org/rules-guidance/notices/26-10). Effective June 4, 2026, with a broker transition through October 20, 2027; verify the broker's actual implementation. |
| Tax reference | [IRS Publication550](https://www.irs.gov/publications/p550). Available 2025 edition; classification and taxpayer circumstances matter. The course does not assign personalized tax treatment. |
| Paper trading | [IBKR documentation](https://www.ibkrguides.com/orgportal/aboutpapertradingaccount.htm), [CME simulator FAQ](https://www.cmegroup.com/articles/faqs/trading-simulator-faq.html). Access and simulation limitations; CME is an adjacent futures-options tool, not the beginner equity-options practice requirement. |
| Historical quote conventions | [Cboe interval product](https://datashop.cboe.com/option-quote-intervals). Product-specific fields and quote-size conventions; no licensed historical dataset was purchased or independently audited. |
| Web application stack | [Cloudflare framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/). Vinext supplies a Next.js compatible API surface on Vite/Workers. The app uses React, TypeScript, D1, Drizzle and server-side validation. |

Sources can contain simplified or dated generalizations. The course therefore asks the learner to use a contract's actual expiry, settlement and adjustment terms. It does not repeat a universal monthly expiration day, broker cutoff, paper-fill rule or margin minimum.

## Executable laboratory checks

All bundled market inputs are explicitly synthetic. Fixed backward entry/exit chronology, boolean/fractional quantity acceptance, negative elapsed time and negative liquidation haircuts that could falsely improve a stress result. Added regression cases. The 20 lab tests pass; the demo reproduces D1=$38 and D2=−$42 under the fictional base assumptions. Independent arithmetic checked 1,200 generated payoff cases over three seeds. Fixture hashes match and the final synthetic forecast segment remains reserved by the default report. Hashes attest file identity, not market truth.

## Application checks

The application contains database migrations and real authenticated API routes for progress, notes, preferences, quizzes, reviews and JSON/CSV exports. The server, rather than the browser, validates sequence and computes checkpoint scores. Each read and write is scoped to the platform's user ID. The two forms contain 80 question instances altogether. Tests independently check answer text and arithmetic, response validation, review intervals and CSV escaping. Local integration, browser and build results are recorded below after execution.

The source importer validates 64 consecutive lesson IDs in 8 modules, retains teaching prefaces and keeps checkpoint text separate from individual lessons. The local-link checker excludes dependency and generated directories.

## Limits

Paid courses, gated broker account features, live executions, licensed historical options data and the learner's personal finances were not verified. The app has no broker connection or live price feed. Its payoff chart is an idealized expiration calculation, not a pre-expiration pricing engine. The course's durations, mastery thresholds and review intervals are teaching choices. Passing a course or a synthetic test cannot establish a live trading edge, personal suitability or that a course is the best in the world.

See [the October 26 history](VERIFICATION_HISTORY_2026_10_26.md) for the earlier source audit. Old verification claims retain their original date and scope.

## Application results recorded during this review

| Check | Result |
| --- | --- |
| Node content, quiz, scheduling and export tests | Passing; includes independent canonical answers for all 80 quiz instances and teaching-package integrity. |
| Authenticated local API integration | 39 HTTP checks passed, plus saved-state assertions and a two-user database-isolation check. Original local test-user data restored afterward. |
| Course package | 49 teaching files in a sanitized ZIP; CRC integrity and internal Markdown targets checked. A new blank record is included, and the original personal record is excluded. |
| Python laboratories | 20 tests passed; generated-payoff checks and synthetic fixture integrity also passed. |
| Local references | 344 local Markdown links passed before the final packaging edits; the final validation rechecks the resulting tree. |

Integration exercises cover unauthorized requests, cross-origin writes, invalid content types, note upserts, preferences, sequential completion, checkpoint prerequisites, failed and successful forms, stale-form rejection, recall scheduling and exports. They run only against the local preview database. Production learning records have not been populated with test completions.

## Final browser validation

The desktop and mobile browser smoke passed all 13 stages in a real headless Google Chrome session. It verified note typing without focus loss, explicit saves surviving reload, lesson completion, wrong-answer feedback, an alternate checkpoint pass, recall-review persistence, notebook and resource navigation, study preferences, and payoff inputs. The call and put examples each return $300 before fees and $298 after $2 total fees; negative inputs are rejected. At 390×844, the dashboard, course, reader, practice tool and preferences had no horizontal page overflow and the mobile menu opened and closed. Fresh-page runs reported no JavaScript errors.

The teaching ZIP and Python attachments returned HTTP 200 after restarting the preview; ZIP integrity was checked. Local browser-test records were restored afterward. TypeScript checking and all 13 Node tests passed. The final publication workflow runs the production build against the source state it pushes. Hosted sign-in uses the Sites platform; local browser tests used its documented portable-development mock identity, not the learner's production account.

## Audit corrections and current checks

All 14 findings from the subsequent full audit have been corrected in the course and application source. Requests now use a measured 64 KiB streaming JSON limit, including bodies without Content-Length. The budget accommodates the advertised 10,000-code-unit notes with Unicode and JSON escaping. Quiz submissions use an issued revision and a unique database sequence; concurrent duplicates or stale forms receive a conflict. Recall updates use a conditional revision check so two tabs cannot silently overwrite an acknowledged result.

Due reviews update in an open tab and on focus, visibility, and navigation. Resource and library retries repeat their failed reads. Important assumptions and limitations use 12px text and measured contrast above 6:1; search focus is visible and navigation focuses the content. These checks address specific accessibility defects, not full WCAG conformance.

The Python ledger validates opening and subsequently mutated state before accounting operations. Direct quote sizes reject fractional, boolean, NaN, and infinite values before fill modeling. The research path now branches its evidence requirements by synthetic, published-index, and licensed-contract projects. The learning record points to the correct advanced introduction, zero-bid guidance preserves illiquidity evidence, and Volume 4 includes a qualified calendar no-arbitrage example, share/cash ledger, fresh questions, and pass task.

New checkpoint attempts also retain selected answers, graded feedback, and course/question versions in learning records and exports. The schema migration preserves existing scores and progress; unavailable historical answers remain empty. The importer has a read-only freshness check covering course/library JSON, hosted attachments, and the offline ZIP.

| Current check | Result |
| --- | --- |
| Python laboratories | All 24 tests pass, including invalid opening/mutated ledgers and quote-size regressions. |
| App unit/content/export/quiz checks | All 19 tests pass, including streaming cancellation, Unicode/escaped notes, retained evidence, and detection of stale artifacts without rewriting them. |
| TypeScript and lint | Both pass; lint reports zero errors and warnings. |
| Authenticated local API integration | 49 HTTP status checks plus persistence, grading, concurrent checkpoint/recall conflicts, evidence export, and two-user isolation assertions pass. Test records are restored. |
| Browser integration | All 14 desktop/mobile smoke stages pass, including saves, checkpoints, reviews, attachments, preferences, payoff arithmetic, and no horizontal overflow on the tested screens. Test records are restored. |
| Additional browser regressions | Review time/focus transitions, library/resource retry recovery, visible search focus, and measured text contrast pass with mocked API responses and no database writes. |
| Built Worker runtime | The production artifact serves the home page, health, resources, and ZIP successfully; unsigned learning requests return 401. The nonmutating browser regressions also pass against this built artifact. |
| Migration | Original and appended schemas preserve legacy scores/counts in a temporary SQLite check. Drizzle reports no further schema changes. The appended local migration applies successfully. |
| Package | Fresh snapshots, source/public attachments, and the 49-file ZIP agree; ZIP CRCs pass. |
| Dependency security | The installed full dependency tree, including development tooling, reports zero known advisories in the November 14 npm scan. This does not establish that software is vulnerability-free. |
| Build | The updated React/Vinext/Vite/Cloudflare stack completes the production build. The publication workflow rebuilds after final documentation/snapshot changes and pushes the corresponding source. |

The update uses React/DOM/RSC 19.3.1, Vinext 1.4.5, Vite 8.3.8, Cloudflare Vite plugin 1.69.1, Wrangler 4.162.0, Next compatibility package 16.4.6, and Zod 4.6.7. Compatible transitive overrides resolve the audited dependency alerts; lint, Drizzle generation, browser/runtime behavior, and the build were checked after the update. Framework sourcemap/chunking notices remain build-tool diagnostics and do not constitute a failed build.

No production learning record was used for these test completions. Hosted schema migrations and publication follow the existing private Sites workflow. The course still makes no claim of trading profitability or personal suitability.
