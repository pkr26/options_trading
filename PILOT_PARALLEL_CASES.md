# Parallel written cases for learner validation

**Status: checked fictional form blueprints, not completed learner results.** These four forms assess common decision skills with different implementation problems. They have not been psychometrically equated. They are not unseen examinations once a learner has read this file, its keys, a related debrief, or an adapted form.

A facilitator should extract only one learner packet, retain its update separately, and withhold all instructor keys until the first response and revision have been saved. Folding an answer below is a reading convenience, not secure withholding. For a genuinely unfamiliar assessment, a knowledgeable facilitator must adapt conditions, independently recheck the key, freeze the new form and withhold it before administration. Record exactly which version was used and any prior exposure.

Use the [pilot protocol](GRADUATE_PILOT_PROTOCOL.md), [external review packet](EXTERNAL_REVIEW_PACKET.md) and [rating/report template](PILOT_RATING_AND_REPORT_TEMPLATE.md). The app's built-in pilot provides a separate numerical component; these written cases supply human-rated evidence of decision reasoning.

## Administration and comparability

The intended entry requirement is the contract/lifecycle foundation: rights and obligations, per-share versus contract amounts, and a cash/share ledger. All special contract facts required by these forms are supplied. Record actual prior knowledge rather than assuming every learner starts at zero.

An illustrative sequence is A at baseline, B immediately after instruction, C at day 7 and D at day 30. Because form difficulty can affect a score, **do not attribute a score difference from that sequence solely to learning**. For a pilot with enough participants, freeze a counterbalanced assignment before instruction, for example the four rotations A/B/C/D, B/C/D/A, C/D/A/B and D/A/B/C. Retain form identity in analysis. A small pilot can reveal problems; it cannot establish equivalent difficulty or a causal course effect.

Allow a common planned session of approximately 40 minutes: up to 25 minutes for the initial memo, 10 for the update and 5 for a short defense. Record actual minutes, interruptions and accommodations; these suggested allocations are not mastery thresholds. Preserve the initial response before releasing the update. The facilitator must not provide feedback, hints or the key during a response intended to measure unaided performance. If assistance occurs, record it and retain the work as assisted evidence.

For every form, the learner submits:

1. A dated initial recommendation, its objective and the strongest opposing alternative.
2. A cash ledger and scenario table using the same starting resources, plus stated units and assumptions.
3. A case-specific uncertainty or operational limitation, and a condition that would change the action.
4. A preserved revision after the update and a response to a skeptical question.

Ask confidence from 0–100 before feedback, and record it as self-report. No form requires a real account, order, deposit or personal financial information.

## Shared arithmetic conventions

All issuers, portfolios, quotes, fills, events and mandates below are invented. Cash interest, dividends, taxes, stock commissions and modeled settlement charges are zero. Each filled option entry contract costs a total $1 fee for that leg. Premiums already paid or received remain part of cash; they are not counted again in terminal payoff. Use supplied option asks for purchases and bids for sales. Displayed quotes alone do not guarantee a fill. Adequate size and actual execution at the supplied side are stipulated only for each initial comparison.

Initial scenario tables assume the stated positions remain intact until the common three-month expiration and value the supplied terminal rights/obligations. They do not predict an American option's pre-expiration value or eliminate early-assignment exposure. Where an update supplies an American-style physical-assignment event, rebuild positions and cash from that event; it is a separate operational rehearsal. Do not invent option marks, exit prices, exercise choices or broker permissions that the packet does not supply.

## Form A — The near-term cash reserve

### Learner packet

The fictional Alder committee owns **300 shares at $40 and $3,000 cash**, a total current resource value of **$15,000**. Over the next three months it wants less downside while retaining some participation in a rise. Borrowing and naked short options are not permitted. It requires **at least $2,500 of accessible cash immediately after implementation**. This is a reserve requirement; no bill is paid in the scenario table.

Every option has a 100-share deliverable, premium multiplier 100, and aggregate exercise cash of strike × 100.

| Instrument | Bid/share | Ask/share |
|---|---:|---:|
| $36 put | $1.70 | $2.00 |
| $46 call | $1.00 | $1.30 |

Compare these specified alternatives:

- **A: Hold.** Keep all 300 shares and cash.
- **B: Reduce shares.** Sell 100 shares at $40; keep 200 shares and the proceeds plus original cash.
- **C: Protect.** Keep 300 shares and buy three $36 puts at the ask, including entry fees.
- **D: Collar.** Keep 300 shares, buy three $36 puts at the ask and sell three covered $46 calls at the bid, including fees for all six contracts.

Build terminal wealth for stock prices **$20, $36, $40, $46 and $55**, and change from $15,000. Include a zero-stock boundary for the protected portfolios. Identify which choices meet the immediate cash reserve, then recommend a choice or explain what further mandate information prevents a choice. These scenario prices are not probabilities.

Defense question: Which alternative most strongly challenges your recommendation, and how much protection or upside do you surrender by rejecting it?

### Update — release after the initial response

Before any order fills, the committee raises its immediate accessible-cash reserve from **$2,500 to $2,800**. Quotes and fees are unchanged. It asks you to preserve the original comparison and explain any revised recommendation. A colleague suggests ignoring a $106 shortfall because “the collar's shares are valuable.” Address that proposal. Do not silently resize a portfolio while retaining its original results.

<details><summary>Instructor-only key — Form A; withhold during administration</summary>

Initial cash is A $3,000; B $7,000; C `3,000 − 3×200 − 3 = $2,397`; D `3,000 − 600 + 300 − 6 = $2,694`. C fails the initial $2,500 reserve. A, B and D satisfy that initial condition.

| Ending stock | A hold | B reduce | C protect | D collar |
|---|---:|---:|---:|---:|
| $20 | $9,000 | $11,000 | $13,197 | $13,494 |
| $36 | $13,800 | $14,200 | $13,197 | $13,494 |
| $40 | $15,000 | $15,000 | $14,397 | $14,694 |
| $46 | $16,800 | $16,200 | $16,197 | $16,494 |
| $55 | $19,500 | $18,000 | $18,897 | $16,494 |

Subtract the common $15,000 to obtain change in wealth. In the stipulated intact terminal comparison, C's floor is `300×36+2,397 = $13,197`; D's floor is $13,494 and cap is `300×46+2,694 = $16,494`. At zero stock C and D retain those floors; B is $7,000 and A $3,000.

After the reserve rises to $2,800, D has a **$106 shortfall**, C a $403 shortfall, and A/B continue to meet that one cash constraint. Marked stock value does not itself meet an immediate cash reserve. Selling shares or changing contracts is a newly specified alternative that needs its own ledger and coverage check. A supported choice can favor B's flexibility or retain A if the remaining downside serves the mandate; do not grade a strategy label as uniquely correct without an objective.

Critical errors include using the call ask as sale proceeds, omitting fees, calling D unlimited-upside protection, treating stock value as liquid reserved cash, or comparing portfolios from different starting resources.

</details>

## Form B — Protection and a share-retention mandate

### Learner packet

The fictional Birch committee owns **300 shares at $60 and $4,000 cash**, total current wealth **$22,000**. It wants to reduce the risk of a severe decline over three months while retaining some upside. It requires **$3,000 accessible cash immediately after implementation** and has not authorized borrowing or naked short options.

All options have a common three-month expiration, standard 100-share deliverable, premium multiplier 100 and aggregate exercise cash of strike × 100. The initial terminal table uses the shared intact-position assumptions; the update supplies an additional American-style implementation constraint.

| Instrument | Bid/share | Ask/share |
|---|---:|---:|
| $55 put | $2.60 | $3.00 |
| $70 call | $2.00 | $2.40 |

- **A: Hold.** Keep 300 shares and cash.
- **B: Reduce shares.** Sell 100 shares at $60, leaving 200 shares and retained cash/proceeds.
- **C: Protect.** Keep 300 shares and buy three $55 puts at the ask, with entry fees.
- **D: Collar.** Keep 300 shares, buy three $55 puts at the ask and sell three covered $70 calls at the bid, with all entry fees.

Show cash and terminal wealth at stock prices **$35, $55, $60, $70 and $85**, plus change from $22,000. Identify the severe boundary, cash feasibility and the cost of retaining or surrendering upside. Recommend an action under an explicit interpretation of the downside objective.

Defense question: Why can the portfolio with the higher terminal floor still be unsuitable for an implementation mandate?

### Update — release after the initial response

The committee clarifies that it must retain **at least 200 of the original shares until a specified date before expiration**. For this operational rehearsal the option contracts are American-style and physically settled; the committee cannot control whether its short calls are assigned before that date. No entry has filled yet.

Assess each original choice against that share-retention requirement. A colleague proposes a new partial collar: retain 300 shares, buy three puts and sell **only one** call. Reconstruct its entry cash at the same supplied quotes and fees. Would one assigned short call leave enough shares? Do not assume the original full-collar payoff table applies to this new portfolio.

<details><summary>Instructor-only key — Form B; withhold during administration</summary>

Cash is A $4,000; B $10,000; C `4,000−900−3 = $3,097`; D `4,000−900+600−6 = $3,694`. All four meet the initial $3,000 cash reserve.

| Ending stock | A hold | B reduce | C protect | D collar |
|---|---:|---:|---:|---:|
| $35 | $14,500 | $17,000 | $19,597 | $20,194 |
| $55 | $20,500 | $21,000 | $19,597 | $20,194 |
| $60 | $22,000 | $22,000 | $21,097 | $21,694 |
| $70 | $25,000 | $24,000 | $24,097 | $24,694 |
| $85 | $29,500 | $27,000 | $28,597 | $24,694 |

C's idealized terminal floor is $19,597. D's is $20,194, and its cap is $24,694. Those are total wealth, not profit. The original wealth is $22,000.

Under the update, assignment on all three short calls can deliver all 300 shares and leave zero. D therefore cannot assure the 200-share retention requirement as specified, despite its attractive terminal floor. A retains 300 and B 200 without a short-call assignment obligation. C's long puts give the committee a choice of exercise; ownership of a put does not itself compel it to deliver shares before the retention date. The decision must also consider the committee's own planned sales or exercise choices.

The new partial collar has cash `4,000−900+200−4 = $3,296`. One short-call assignment delivers 100 shares, leaving **200**, so this particular assignment respects the retention count. It needs a new terminal formula:

`300S + 300 max(55−S,0) − 100 max(S−70,0) + 3,296`.

Its floor is $19,796. At S=$85, wealth is `$25,500−$1,500+$3,296 = $27,296`; unlike the full collar, 200 shares retain upside above $70. This new choice may serve the mandate, but the learner must explain that it has a different payoff and costs. A fair response can prefer C or the explicit partial collar, or request clearer downside limits. It must not deny the short writer's assignment obligation.

Critical errors include promising to block assignment, saying all 300 shares remain after three call assignments, or copying the original full-collar cap to the partial collar.

</details>

## Form C — A partial fill changes the hedge

### Learner packet

The fictional Cedar committee owns **200 shares at $80 and $5,000 cash**, total current wealth **$21,000**. It seeks protection against a severe three-month decline while preserving some participation in a rise. It requires **$4,200 accessible cash immediately after implementation**. Borrowing and naked short options are not authorized.

All initial options are same-expiry standard 100-share contracts with premium multiplier 100 and aggregate exercise cash of strike × 100.

| Instrument | Bid/share | Ask/share |
|---|---:|---:|
| $72 put | $4.60 | $5.00 |
| $90 call | $3.00 | $3.40 |

- **A: Hold.** Keep 200 shares and cash.
- **B: Reduce shares.** Sell 100 shares at $80; keep 100 shares and all cash/proceeds.
- **C: Protect.** Keep 200 shares and buy two $72 puts at the ask, with entry fees.
- **D: Collar.** Keep 200 shares, buy two $72 puts at the ask and sell two covered $90 calls at the bid, with all entry fees.

Build cash and terminal wealth at stock prices **$45, $72, $80, $90 and $110**, plus change from $21,000. Test cash feasibility before recommending an action. Identify the difference between a planned hedge and evidence that it actually exists.

Defense question: Which decision can be correct at planning time but require a different response after execution?

### Update — release after the initial response

Regardless of your initial recommendation, audit this **separate supplied execution episode for D**. One put actually fills at $5.00; both calls actually sell at $3.00; the remaining put order is cancelled and the cancellation is acknowledged. Entry fees are $1 for each of the three filled contracts. No other trades occur.

Reconcile cash, shares, long puts and short calls. Has the planned downside floor been established? There is a new offer to buy one additional matching put at a supplied $6.00 ask, with a $1 fee, but no fill yet. Would completing that purchase at the supplied terms meet the cash reserve? Explain what can and cannot be concluded if the committee instead wants to close an existing leg; no exit quote has been supplied.

<details><summary>Instructor-only key — Form C; withhold during administration</summary>

Initial comparison cash is A $5,000; B $13,000; C `5,000−1,000−2 = $3,998`; D `5,000−1,000+600−4 = $4,596`. C fails the initial $4,200 reserve; A/B/D meet it.

| Ending stock | A hold | B reduce | C protect | D collar |
|---|---:|---:|---:|---:|
| $45 | $14,000 | $17,500 | $18,398 | $18,996 |
| $72 | $19,400 | $20,200 | $18,398 | $18,996 |
| $80 | $21,000 | $21,000 | $19,998 | $20,596 |
| $90 | $23,000 | $22,000 | $21,998 | $22,596 |
| $110 | $27,000 | $24,000 | $25,998 | $22,596 |

The intact C floor is $18,398; D floor $18,996 and cap $22,596. These assume both matching puts actually exist.

In the supplied partial-fill episode, cash is `5,000−500+600−3 = $5,097`. The account has **200 shares, one long put and two short calls**. The calls are backed by 200 shares, but only 100 shares are protected by the one put. A cancellation acknowledgement removes the unfilled order quantity; it does not create a second put or remove filled calls.

The residual terminal formula is `200S + 100 max(72−S,0) − 200 max(S−90,0) + 5,097`. Its zero-stock value is **$12,297**, far below the intended intact D floor. At S=$45, wealth is $16,797; at $72 it is $19,497; at $80 $21,097; at $90 and $110 $23,097. The plan's original table cannot describe this residual position.

One additional put at a supplied $6 ask plus a $1 fee would leave `5,097−600−1 = $4,496`, meeting the $4,200 cash reserve **if that fill actually occurs**. It would restore the two-put protection but at a different net cost. The resulting floor would be `$14,400+$4,496 = $18,896`, and cap $22,496. An offer is not a fill, and the revised figures must remain conditional until execution is confirmed.

Closing or reshaping other legs needs actual exit quotes, fees and an order-status plan. The packet does not permit invented midpoint proceeds or deleting an inconvenient filled position.

Critical errors include counting an unfilled put as protection, dropping the two filled calls after cancellation, charging fees for an unfilled contract, or claiming the original D floor still applies.

</details>

## Form D — Adjusted deliverables and surviving coverage

### Learner packet

The fictional Delta committee owns **400 shares at $25 and $3,000 cash**, total current wealth **$13,000**. It seeks three-month downside protection with some upside participation and requires **$2,600 accessible cash immediately after implementation**. Borrowing and uncovered short calls are not authorized.

The following are **fictional, explicitly specified adjusted contracts**. Each delivers **50 shares**. Premium multiplier and exercise-price multiplier are each **100**; they are separate supplied fields. For one put with strike label $12, exercise delivers 50 shares and receives $1,200 aggregate strike cash. For one call with strike label $15, assignment delivers 50 shares and receives $1,500 aggregate strike cash. At terminal stock price S, one put payoff is `max(1,200−50S,0)`; one short call's obligation is `max(50S−1,500,0)`. Do not substitute standard 100-share deliverables.

| Instrument | Premium bid | Premium ask | Dollar premium for one contract at the relevant side |
|---|---:|---:|---:|
| Adjusted put, strike label $12 | $0.50 | $0.60 | Buy at $0.60×100 = $60 |
| Adjusted call, strike label $15 | $0.20 | $0.30 | Sell at $0.20×100 = $20 |

- **A: Hold.** Keep 400 shares and cash.
- **B: Reduce shares.** Sell 200 shares at $25; keep 200 shares and retained cash/proceeds.
- **C: Protect.** Buy enough of the supplied puts to match 400 shares, keeping the stock and paying entry fees.
- **D: Collar.** Buy the same puts and sell enough of the supplied calls to match those 400 shares, including entry fees for each leg.

Determine contract counts, aggregate premiums, cash, terminal wealth and change from $13,000 at stock prices **$10, $24, $25, $30 and $40**. Identify the implied economic stock-price floor and ceiling from the supplied deliverables and strike cash; the strike labels alone do not give those stock-price levels. Test the cash reserve and recommend a choice.

Defense question: Which three quantities must be kept separate when a contract is adjusted?

### Update — release after the initial response

Audit this supplied operational event for D: after implementation, **one adjusted short call is assigned early**. The broker confirms delivery of 50 shares and receipt of $1,500 strike cash. No put has been exercised, no other option has closed, and no further fees are charged in this event.

Reconcile cash, shares, puts and remaining short calls. Is every remaining call still share-covered? A colleague says the assignment automatically exercises a put. Evaluate that claim. Then perform a separate hypothetical ledger exercise: if the committee elects to exercise one adjusted put without any other trade, what changes, and would all remaining calls still be share-covered? The packet supplies no current option marks or exit quotes; identify what that prevents you from reporting.

<details><summary>Instructor-only key — Form D; withhold during administration</summary>

Matching 400 shares requires **eight** contracts because each delivers 50 shares. C pays `8×$60+$8 = $488`, leaving **$2,512**, and fails the $2,600 reserve. D pays $480, receives `8×$20=$160` and pays $16 fees, leaving **$2,664**. A has $3,000 and B $8,000; A/B/D meet the reserve as specified.

The economic lower stock-price boundary is `$1,200/50 = $24`; the upper is `$1,500/50 = $30`. Neither is read directly from the strike label. Aggregate strike cash for exercising all eight puts is $9,600, and aggregate delivery is 400 shares.

| Ending stock | A hold | B reduce | C protect | D collar |
|---|---:|---:|---:|---:|
| $10 | $7,000 | $10,000 | $12,112 | $12,264 |
| $24 | $12,600 | $12,800 | $12,112 | $12,264 |
| $25 | $13,000 | $13,000 | $12,512 | $12,664 |
| $30 | $15,000 | $14,000 | $14,512 | $14,664 |
| $40 | $19,000 | $16,000 | $18,512 | $14,664 |

C's idealized floor is $12,112; D's floor $12,264 and cap $14,664. Subtract the common $13,000 to obtain change in wealth.

After one short-call assignment, cash becomes `$2,664+$1,500 = $4,164`; shares become **350**; **eight long puts** remain; **seven short calls** remain. Those seven calls require 350 shares if assigned, exactly the shares currently held. The eight puts carry rights over 400 shares; they are not automatically exercised, reduced or closed by assignment of a different contract.

In the separate hypothetical exercise of one put, the holder delivers 50 shares and receives $1,200: cash becomes **$5,364**, shares **300**, long puts **seven**, and short calls **seven**. Calls can still require delivery of 350 shares, leaving **50 shares of delivery obligation without owned-share coverage**. This violates the no-uncovered-call mandate unless an appropriate separate action restores coverage. More cash does not restore the missing shares by itself.

This hypothetical ledger is not a recommendation to exercise. Current stock/option prices, extrinsic value, broker procedures, funding and the mandate matter. A net P&L or liquidation value cannot be reconstructed from the cash balance alone without the remaining options' appropriate prices and other supplied account facts.

Critical errors include using eight contracts as 800-share coverage, equating premium and exercise cash, automatically removing a long put after short-call assignment, or treating a cash receipt as profit.

</details>

## Calculation validation and limits

On November 14, 2026, a separate Python `Decimal` calculation reconstructed all **80 initial scenario cells** by summing stock, retained cash, long-put payoff and short-call obligation. A second closed-form calculation used the matched portfolio's stock floor/cap identities; all 80 cells agreed. Five additional partial-fill wealth states in Form C were checked against a separate region-by-region expression, for **85 cross-method state comparisons**. Entry cash, contract counts, additional-put cost and both Form D lifecycle ledgers were also asserted directly. Those checks validate the stipulated arithmetic; they do not establish form equivalence, effective teaching or executable market performance.

Primary background references for the separate operational concepts are [FINRA's assignment explanation](https://www.finra.org/investors/insights/trading-options-understanding-assignment) and [OIC's collar explanation](https://www.optionseducation.org/strategies/all-strategies/collar-protective-collar). Assignment obligations apply to the assigned contract, and other legs require separate action. The adjusted terms here are fictional case specifications, not a claim about a real adjusted series. Before teaching an actual product, verify its exact current specifications.

Archive the facilitator's final version, withheld key, calculation QA, learner-facing packet, actual administration times, assistance record and both original reviewer ratings with the pilot report. Do not replace a failed first attempt with its corrected practice answer.
