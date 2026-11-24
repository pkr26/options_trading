# Advanced Academy implementation

Delivered November 14, 2026. Open **Advanced academy** in the existing Options Academy app. The beginner course remains the entry path; advanced prerequisites guide preparation and every module can be previewed.

## Phase 1 — complete teaching packages

The advanced curriculum now has 26 app-native teaching packages. Each combines the original teaching volume with an original fictional decision case, exhibits, an initial decision, new information, debrief, weak/adequate/excellent submission examples, four rubric dimensions, defense prompts, deliverables and transfer questions. Module 10 is the flagship Trade Design seminar: it compares holding shares, reducing concentration, protective puts and a collar with equal starting resources, quote-side costs, a full scenario table, a changed cash mandate and an operational extension.

The canonical source is `course-app/content/graduate.json`. Primary sources are linked in each package. Fictional data are labeled as teaching inputs. The [teaching standard](GRADUATE_TEACHING_STANDARD.md) describes the assessment and review expectations.

## Phase 2 — learning and evidence infrastructure

The app provides classrooms, a staged case studio, numeric practice, a mistake journal, competency evidence and a capstone workspace. Initial submissions, later revisions and drafts are appended to the learner's private database records. Course packets and versions are preserved with submissions. Conflicting tab saves are rejected; the learner can compare and reconcile edits. Saved work reloads, memo drafts survive navigation within the app, and browser departure warns about unsaved work. Advanced modules have bookmark URLs.

All 26 modules have three server-graded numerical practice questions per set with deterministic variations, hints and explained feedback. The server derives keys and saves the original response. Generated question families are practice; independent assessment requires a reviewer to provide genuinely unfamiliar cases. The evidence screen separates writing awaiting review from numeric results and identifies later study checks. It does not infer mastery from reading, a text-length threshold or submitting a memo.

## Phase 3 — laboratories, extension and release checks

Four laboratories require a prediction before revealing their results: equal-budget portfolio protection, European prices and Greeks, an assigned short call's cash/share ledger, and supplied partial/nonfill execution episodes. Tables accompany the explanations. Model values, local approximations, terminal values and stipulated fills remain distinct. The advanced Markdown download and full offline ZIP contain the complete teaching packages. The ZIP includes the supporting reference files; the standalone Markdown identifies additional library references by name.

The new schema migration is additive and keeps beginner progress, notes and scores intact. New advanced records begin empty. Learner-specific exports include immutable revisions and feedback; published teaching downloads exclude learner records.

## Verification

- 58 unit/content/math/validation tests pass, including 78 independent practice answer checks, pricing reference values, parity, portfolio accounting, adaptive branches, written-feedback rules, real-date pilot windows and migration preservation.
- TypeScript and repository ESLint pass.
- 24 live advanced API checks pass: authentication, owner isolation, immutable revisions, concurrent request handling, strict request validation, hidden pre-submission keys, grading and exports.
- An additional 41 teaching API checks pass: adaptive corrections, concurrent turns, exact-submission feedback and historical-packet protection, quoted review evidence, real-date pilot gates, artifact revisions, exports and owner isolation.
- The advanced live browser journey passes: 26-module navigation, commitment, revision, reload, practice, mistake history and mobile layout. Six additional mocked browser checks cover conflict recovery, draft retention and anonymous study.
- Teaching Studio and portfolio/artifact browser workflows pass: tutor resume and conflicts, assisted transfer, feedback, attributed reviews, baseline and future checks, artifact revisions, funding stress, research critique and mobile layout.
- The existing 14-stage beginner browser regression suite passes.
- The flagship scenario table and cash update were independently recalculated. A separate pricing implementation checked 90 parameter combinations; differences remained below the cent-display tolerance.
- Desktop and mobile screenshots were inspected. This is targeted accessibility/layout verification, not a full accessibility certification.

Source freshness, local Markdown links, and the production build are checked before publication. Publication outcome is reported separately by the publishing service.

## Phase 4 — adaptive teaching and learner validation workflows

The **Teaching studio** now implements adaptive sessions, submission-specific formative feedback, a review desk and a real-date learner pilot. The tutor selects priorities from saved mistakes, prerequisite checks and later study dates. Numeric errors trigger targeted explanations, assisted correction and a changed transfer question; original responses and help remain recorded. Written feedback quotes the learner's text, identifies missing reasoning, challenges selected claims and checks explicit amounts in the flagship case. Evidence detection is labeled separately from correctness or academic grading. Historical packets cannot be silently checked against changed current assumptions.

The review desk supplies the exact original case, rubric and submitted answers. Recorded reviews require quotations from the saved work, criterion scores, a challenge and a response. Self-review and external feedback reported by the learner have different labels. Neither a reviewer identity nor credentials are verified by recording a name.

The built-in pilot freezes three module blueprints, preserves a baseline and serves changed numerical forms in the day-7 and day-30 windows. Dates come from the server. The day-7 form opens seven days after baseline and closes at day 14; day 30 opens at day 30 and closes at day 45. Missing visits stay missing. It records correct answers, actual completion dates, self-reported minutes and clarity. The [full pilot protocol](GRADUATE_PILOT_PROTOCOL.md) also calls for independently administered written cases and calibrated human ratings. Actual participant results and independent expert judgments require people to complete that work; none are fabricated.

Additional scenario labs cover a joint portfolio shock with a separate gross funding ledger and a research critique with independently varying timestamp, holdout, cost and benchmark traps. The capstone workspace now preserves typed protocol, data, model, execution, stress and defense artifacts, revisions, HTTPS source links and downloadable manifests. A source link is not treated as a verified clean rerun.

Teaching events are appended with owner-scoped revision checks. Normal learning reads retrieve current snapshots; the export streams the complete history in bounded batches. This avoids loading every repeated tutoring snapshot into the learning page.

## Validation preparation completed

The owner chose to prepare materials and bring participants later. The [readiness record](VALIDATION_READINESS.md) lists the completed external review packet, four written form blueprints, separate initial/update learner packets, instructor keys, rating/report template and technical audit closures. New pilots record consent, prior experience, prior observed exposure, confidence and assistance. Question blueprints and grading tolerances are protected against accidental drift, and all recorded reviewers remain visible for calibration. No enrollment, expert approval or participant outcome was created on the owner’s behalf.
