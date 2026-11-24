# Options Academy improvement roadmap

The strongest next version would help learners prove what they understand, recover from mistakes, and connect option payoffs to the cash and shares created by real contract events. More lessons or a larger strategy menu would be less useful than better practice and feedback. These priorities come from the application's current behavior and the course audit; they are a product plan, not features already delivered.

The current remediation adds safer request handling, atomic learning updates, readable caveats, dependable reviews and retries, corrected course requirements, saved checkpoint answer evidence, and a source-freshness check. The next milestones build on that foundation.

## First milestone Improve learning and continuity

| Improvement | Learner benefit | Acceptance evidence |
| --- | --- | --- |
| Fresh practice by skill | Practice a misconception such as premium versus intrinsic value, whole-contract units, partial fills, or assignment funding with changed scenarios. | Every question has a skill tag, independently checked answer logic, and fresh numbers; repeated forms are labeled practice. Safety-critical cases require an explanation and a later fresh retest. |
| A mistake journal | Reopen the original answer, explanation, correction, and later attempt instead of losing feedback after a checkpoint. | New persisted answer/version snapshots appear in a searchable history. Legacy attempts show their scores without invented answers. Missed skills link directly to a focused lesson and practice case. |
| Resume and recover work | Continue an unfinished quiz or note across sessions without silently losing a first attempt. | Drafts are stored per user on the server, show save status, survive reload, and use revision conflicts to protect edits from another tab. Clear discard and recovery actions are available. |
| Lesson links and focused reading | Return to a specific lesson, resource, or review from a bookmark, with readable text and fewer navigation steps. | URLs restore the view and lesson; browser back/forward works; search leads to the relevant passage; keyboard and screen-reader focus follows navigation. |

Start with the mistake journal and fresh practice. The answer snapshots added during remediation make that work possible without another schema redesign. Keep the distinction between an answered question, an explanation in the learner's own words, and demonstrated later recall.

## Second milestone Make operations visible

| Improvement | Learner benefit | Acceptance evidence |
| --- | --- | --- |
| A contract lifecycle simulator | Follow an option from opening through closing, exercise, assignment, and settlement while seeing each cash/share movement. | Worked call, put, spread, and adjusted-deliverable cases reconcile independently. A one-leg assignment visibly leaves its shares and remaining option. Gross funding is separate from profit/loss. |
| A strategy comparison lab | Compare stock, cash, and an option position under a common objective and scenario. | Show net costs, payoff, downside, foregone upside, and the assumptions behind each result. Include a no-trade alternative and a table equivalent for every chart. |
| An execution replay | Understand why displayed quotes and midpoint marks do not establish fills. | Timestamped synthetic episodes include partial fills, cancellations, zero bids, gaps, and missing observations. Nonfills and passes remain in the decision log. |
| Greeks and volatility scenarios | Change stock, time, volatility, rates, and dividends one at a time, then compare joint changes. | Clearly distinguish a local Greek approximation, a model price, an expiration payoff, and a supplied executable quote. Validate all calculators against independent references and boundary cases. |

Use the existing synthetic labs first. Add live or historical feeds only when the learning task, timestamp semantics, contract coverage, licensing, and ongoing cost are specified. Data access should not become a prerequisite for the beginner course.

## Third milestone Establish release and learning evidence

| Improvement | Purpose | Acceptance evidence |
| --- | --- | --- |
| A release gate | Prevent the defects repaired in this audit from returning. | A clean environment checks source freshness, Python tests, app tests, lint, types, migrations, concurrency, browser recovery, and the production build before publication. Dependency exceptions are documented and time-bounded. |
| Accessibility verification | Make every essential explanation and action usable. | Check contrast, full keyboard operation, screen-reader names and announcements, 200% zoom, text resizing, reduced motion, mobile navigation, and chart alternatives. Contrast fixes alone do not claim full WCAG conformance. |
| Content provenance | Let a learner see the source and assumptions behind a financial statement or calculator. | Each lesson/case links to its primary reference, scope, last verification date, and version. Question snapshots retain the version actually answered. |
| Backup and recovery drills | Protect learning records as the product grows. | Restore a representative staging backup, verify user isolation and record counts, and test old-to-new schema migration without production test completions. Exports remain readable and versioned. |
| Privacy-conscious reliability metrics | Detect failed saves, slow requests, and client errors without exposing notebook content. | Collect operational event types and aggregate durations; omit note/answer text and identity details from error payloads. Keep optional learning analytics separate from essential operations. |
| A learner pilot | Establish whether the teaching works in practice. | Compare an initial diagnostic with fresh delayed checks after 7 and 30 days; measure misconceptions, session duration, abandonment, and recovery. Report sample size and uncertainty. Do not use simulated profit as a learning metric. |

## How to judge project quality

Use a small scorecard: delayed fresh-case accuracy, assignment/cash-ledger accuracy, successful save/reload rate, review completion, keyboard task success, and recovery from network failure. Set targets after a pilot establishes a baseline. Track whether learners can explain a result and its assumptions, rather than optimizing time spent, streaks, strategy count, or paper profits.

Build one complete learner journey before adding integrations: identify a weak skill, study its short lesson, solve a fresh case, preserve the first answer, receive specific feedback, and pass a later retest. That journey is the clearest route to a more useful and trustworthy application.
