# Learner-validation and review workflow audit

Reviewed November 14, 2026. This is an AI-assisted technical review of the source and evidence workflow. It is not a human expert curriculum endorsement, a credential check, or a learner outcome study. No learner responses, reviewer sign-offs or retention gains were created.

## Scope and method

Read the pilot engine, teaching mutation schemas, tutor/practice/feedback/review/pilot routes, current-event query, streamed evidence export and Teaching Studio review/pilot interface. Compared the implemented rubric and stored observations against `GRADUATE_TEACHING_STANDARD.md` and `GRADUATE_PILOT_PROTOCOL.md`. Ran an isolated read-only Node probe against the pure pilot/schema functions; it made no database or production writes.

The findings below describe the reviewed source before any subsequent remediation by the primary implementation agent. Resolution should cite the corrective change and its regression evidence.

## Findings

### V01 — The stored pilot version does not freeze the question implementation

**Priority: high for longitudinal validity.** `course-app/app/api/teaching/pilot/route.ts:27` records `TEACHING_VERSION` in enrollment, but `course-app/lib/learning-pilot.ts:19` derives later forms only from seed/stage, and lines 24 and 30–32 call the current practice generator and grader. The stored version is not checked.

The read-only probe supplied `version: 'unsupported-future-question-version'` and still received nine day-7 questions. A future generator or key change could therefore alter a frozen study between baseline and follow-up while the record still displays its original version.

**Required correction:** preserve a versioned question blueprint/key implementation, snapshot the forms with proper answer-key access control, or reject unsupported versions explicitly. Retain the original version and actual observation times. Add a regression showing that unsupported versions cannot silently produce current forms.

### V02 — The written-review rubric has conflicting score anchors

**Priority: medium.** `GRADUATE_TEACHING_STANDARD.md:30` defines a three-point scale from 0 through 2. The review mutation schema (`course-app/lib/teaching-validation.ts:17`) and packet (`course-app/app/api/teaching/review/route.ts:12`) use 0 through 3. The UI also describes score 2 as “supported with an unresolved gap,” whereas the packet describes it as “supported, with stated limitations.”

Those are not equivalent calibration standards. Two reviewers could assign different numbers to the same quality of work before any substantive disagreement.

**Required correction:** select one anchored scale for this advanced written-review workflow and apply it consistently in the teaching standard, review packet, interface and calibration kit. Keep older, separate foundation rubrics explicitly labeled rather than silently converting past scores.

### V03 — The current-event projection hides previous independent ratings

**Priority: medium.** The review route appends every review of a given submission under the same entity ID (`course-app/app/api/teaching/review/route.ts:28–30`). The normal teaching read selects only the greatest revision for each kind/entity (`course-app/app/api/teaching/route.ts:10–12`). The review-history interface receives that projection (`course-app/components/teaching-studio.tsx:117`).

A second reviewer’s rating therefore hides the earlier rating in normal UI history and competency attribution, although the complete export preserves both. This impedes the protocol’s requirement to preserve and compare two independent initial scores.

**Required correction:** return all bounded review records or give independent reviews distinct entities, while continuing to use current snapshots for cumulative tutor/pilot state. Preserve reviewer source labels and any subsequent reconciliation separately.

### V04 — The built-in numerical pilot omits interpretation metadata required by the protocol

**Priority: medium for interpretation; not evidence of fabricated results.** The protocol asks for prior experience, confidence and assistance (`GRADUATE_PILOT_PROTOCOL.md:13–15,20,29`). The stored pilot result and submit schema contain answers, score, minutes and clarity, but no confidence, assistance or prior-exposure observations (`course-app/lib/learning-pilot.ts:34`, `course-app/lib/teaching-validation.ts:22`). The read-only schema probe confirmed that additional `confidence`/`assistance` fields are currently rejected by strict validation.

Consequently, a tutor-assisted response and an unassisted response can receive the same numerical result without their difference appearing in the pilot result. Prior use of the course can also precede an apparently new baseline. The interface properly warns that these observations are not a controlled estimate, but cannot reconstruct the missing information later.

**Recommended correction:** capture clearly labeled self-reported confidence and assistance, and preserve actual prior course-use evidence at enrollment where available. Do not fill absent historical fields with “none.” Keep full written-case assessment and independent ratings distinct from arithmetic practice.

## Controls confirmed

- Pilot forms are gated by server time, not a client-supplied completion timestamp. The probe confirmed day 7 is scheduled one second before the boundary, available at the boundary and missed at day 14.
- The baseline must exist before delayed forms become available. Completed stages cannot be resubmitted through the pure engine.
- Pilot module selection is fixed at enrollment. The strict schema requires three distinct module IDs.
- The numeric answer set must match all issued question IDs exactly; non-finite answers and incomplete sets are rejected.
- Teaching mutations authenticate and scope reads/writes to the current user. Revision checks plus a unique owner/kind/entity/revision index protect racing writes.
- Review evidence must be an exact quotation of saved learner writing, and criterion names must match the saved submission’s original rubric.
- Reviewer identity is explicitly reported rather than verified. The interface distinguishes self-review from external feedback reported by the learner.
- Automated feedback refuses to reinterpret a historical submission against a changed current teaching packet (`course-app/app/api/teaching/feedback/route.ts:13`).
- Active tutor questions omit expected answers. Help, corrections and transfer attempts remain explicit in the saved session.
- Normal tutoring reads use current snapshots, and full history exports are streamed in bounded batches. This avoids the earlier quadratic cumulative-history loading pattern.

## Limits and acceptance evidence still needed

No actual participant pilot, independent human rating or external expert approval was observed or performed in this review. The software can preserve those activities, but source inspection cannot manufacture them. A complete validation claim needs dated learner work, assistance/exposure records, actual 7-/30-day observations or explicit missingness, qualified independent reviewers, both initial ratings, a discrepancy record and a defensible interpretation.

The built-in forms use known numerical question families; correctly withholding a key does not automatically make a form a genuinely unfamiliar written transfer assessment. Use the facilitator-controlled parallel case materials and independent rating process to assess decision reasoning. Do not use simulated P&L, completion counts or a high arithmetic average as a substitute.

## Remediation verification — November 14, 2026

The primary implementation agent corrected the four findings. A subsequent read-only source review and six focused tests confirmed these closures:

| Finding | Status | Observed correction and verification |
| --- | --- | --- |
| V01 | Closed for current automatic forms | `lib/learning-pilot.ts:6–24` now supplies `PILOT_QUESTION_VERSION`, `freezePilotBlueprint` and a deterministic signature covering all three forms' questions, expected results and explanations. `pilotQuestions` asserts the saved version/signature before administration; `completePilot` uses that same gate. Unsupported versions and changed seeds/signatures are rejected by the new regression. A started pilot cannot be refrozen. |
| V02 | Closed | `GRADUATE_TEACHING_STANDARD.md:30` now uses the same 0–3 advanced written-review scale as the API packet, mutation schema and UI. Score 2 is consistently supported work with stated limitations. Separate earlier foundation rubrics remain separate assessment systems. |
| V03 | Closed | `app/api/teaching/route.ts:12` retains all review events while still selecting only current cumulative snapshots for other kinds. The review history can therefore display both reviewers' original records. `lib/review-calibration.ts` and its UI compare distinct reported external names on the same saved submission, exclude self-review, and prevent repeated ratings by one named person from manufacturing additional independent raters. |
| V04 | Closed for new app pilot records | The enrollment schema now requires consent and a prior-experience choice. The route captures actual prior practice-set, submitted-memo and distinct tutor-session counts. New submission requests require self-reported confidence and assistance, and the result/interface/export preserve them. Optional type fields preserve honest “not recorded” handling for older evidence rather than inventing historical answers. |

Executed `node --experimental-strip-types --test tests/learning-pilot.test.mjs tests/review-calibration.test.mjs tests/teaching-validation.test.mjs`: **6 tests passed, 0 failed**. This checked pilot boundary logic, unsupported/tampered blueprint rejection, distinct-rater comparison, duplicate-name handling and mutation validation. The broader live API and browser checks belong to the primary implementation agent's release verification.

Two interpretation limits remain explicit rather than being treated as defects: the descriptive calibration table uses the **latest** recorded rating per named reviewer and does not claim to be a blinded initial-agreement estimate; all earlier ratings remain in the review history/export. The blueprint signature is an accidental-drift check rather than cryptographic proof. Numerical tolerances are now defined in the question engine's exported `GRADUATE_GRADING_CONVENTION` and included in the blueprint fingerprint, so accidental tolerance changes also trigger drift protection. Maintainers must still bump the question version when other grading logic changes.

These closures establish that the software can collect the intended evidence more faithfully. They do not establish that a qualified external expert has approved the curriculum or that learners have completed a longitudinal study. The user's decision to prepare materials and recruit participants later is compatible with an empty, accurate outcome record.
