# Three optional paths for deeper study

Begin with the [small beginner lessons](beginner/README.md). The 26 modules in [COURSE.md](COURSE.md) form an optional advanced contract, risk, execution, and research path. Its full quantitative and programming sequence is not required to begin learning or to decide whether options belong in a personal financial plan. The three deeper paths below serve different goals. A learner who wants all three can complete them in sequence, using the same dated evidence bundle where a project meets more than one standard. Passing a path means the specified work was reproduced and defended; it does not certify trading readiness, investment returns, or a job offer.

Before starting a path, pass Gates A–D, or complete its preparatory projects while keeping any unmet core gate visible. Record the path, question, data access, needed mathematics, time, and assessment in [the learning record](LEARNING_RECORD_TEMPLATE.md). Choose a project whose inputs and contract terms can be audited. The [research lab](RESEARCH_LAB.md) explains how to label synthetic, published-index, and historical-contract evidence.

## 1. Personal portfolio decisions

**Purpose:** decide whether an option changes a personal portfolio's risk and return in a way that serves a written objective. This path evaluates uses such as protection or an overlay; it does not presume that collecting premium improves the portfolio.

**Required work**

1. Write a one-page portfolio objective with time horizon, liquidity needs, downside tolerance, and the no-option alternative. Use a hypothetical portfolio until personal circumstances and account permissions are separately reviewed.
2. Compare three fully specified alternatives over the same dated period: the original portfolio, a simple cash or stock adjustment, and one option overlay. Show option premiums, bid/ask and fees, foregone upside, dividends, financing, exercise or settlement, and tax questions requiring personal advice.
3. Reprice each alternative under a rising market, a moderate decline, a gap, a volatility shock, and an expiration or assignment event. Show the cash and shares required at each stage. The [operational casebook](OPERATIONAL_CASEBOOK.md) provides the rehearsal format.
4. Write a decision memo explaining when the option helped, when it disappointed, and what information would reverse the decision. Include a fair benchmark and a complete record of assumptions.

**Pass standard:** another reader can reproduce the cash flows and scenario results, identify the cost of the overlay, and see how the conclusion follows from the stated objective. An option losing money can still have served a protection goal; a premium received does not establish a superior portfolio decision.

## 2. Independent trading and research

**Purpose:** test a narrow, falsifiable options claim with a complete decision record. Use [the lab sequence](labs/README.md) to build the accounting and data checks before testing a signal.

**Required work**

1. Freeze a question, comparator, analysis rules, and failure criteria before opening any genuinely reserved final results. For A, specify synthetic scenarios and expected accounting behavior; for B, specify published series, methodology versions, and aligned dates; for C, specify the hypothesis, contract selector, timestamps, entry/exit rules, and cost cases. Keep every tried or rejected variant and every decision or observation required by that level.
2. Make a data-feasibility decision first. A synthetic fixture can validate code, published-index history can support a limited index analysis, and licensed contract quotes can support a historical option-order replay. Name the level of evidence in every report.
3. Reconcile the evidence that actually exists. **A:** hand-check the synthetic ledger, fills, nonfills, assignments, and risk limits, including failed cases; report modeled costs without a market-return claim. **B:** reconcile published index levels, methodology assumptions, comparator returns, dates, and drawdowns; identify unknown account-level costs and fills without inventing constituent trades. **C:** reconcile trade and portfolio ledgers by hand on selected dates and report quote-side/adverse fills, missing quotes, nonfills, assignments, risk limits, and net returns. A separate hypothetical funding/assignment rehearsal may accompany B, but label it separately from the index evidence.
4. Evaluate the frozen work at its declared level. **A:** use fresh synthetic cases whose expected results were specified independently. **B:** compare periods and methodology sensitivities and track later published observations; already examined public history remains descriptive, not an untouched test of a contract rule. **C:** evaluate the frozen rule on genuinely later data or a dated forward shadow log, with an exposure-matched comparator and dependence-aware uncertainty. For every level, invite another person to challenge the inputs, code, and permitted conclusion.

**Pass standard:** a reviewer can rerun the analysis, find every attempted variant, and reconstruct why the conclusion is reject, inconclusive, or continue. A positive historical result alone cannot pass.

## 3. Professional quant and options preparation

**Purpose:** demonstrate mathematical, programming, research, and communication skills used in professional options work. Job requirements differ by role, so choose a target role and document its actual expectations before adding specialized study.

**Mathematics sequence:** algebra and functions → calculus and linear algebra → probability, inference, and time-series methods → numerical optimization and simulation. Use the introductory [math bridge](FOUNDATION_MATH_BRIDGE.md) and the prerequisites listed in [SOURCES.md](SOURCES.md). Extend the calendar until you can derive and explain the methods, not merely run a library call.

**Required work**

1. Derive a one- or two-step replication argument, price a European option, and compare analytic or independent reference results with finite-difference Greeks. State which contract features the model omits.
   Reconcile the option, stock, and cash flows in [the discrete hedging lab](DYNAMIC_HEDGING_LAB.md) before adding a more elaborate hedge model.
2. Implement and test a dividend-aware or American-style pricing extension appropriate to the chosen product. Document convergence, boundary inputs, contract conventions, and failures. Check any fitted volatility surface for observable no-arbitrage violations before interpreting parameters.
3. Replicate one published result or public benchmark methodology with a source manifest. Reconcile differences caused by dates, contract selection, dividends, settlement, financing, and execution assumptions. Distinguish an index-history comparison from a reconstruction of its option trades.
4. Submit reviewed code, tests that can fail for meaningful reasons, a short research memo, and an oral or written defense. The reviewer should challenge a model assumption, data leak, operational event, and apparent profit.

**Pass standard:** the implementation reproduces its stated inputs, survives independent checks, and the learner can explain both the mathematics and the gap between model prices and executable quotes. More advanced models do not compensate for incorrect contracts, timestamps, or accounting.

## Keeping the paths manageable

Keep one advanced project as the main project until it reaches a reviewable result. A personal portfolio question can later motivate a research study; a research study can become a professional code sample. Preserve the earlier version and its mistakes when you extend it. Periodically retest contract, assignment, and risk skills from the common core, especially before studying a new product.
