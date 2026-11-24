# Options risk and operations curriculum

**Scope:** U.S. exchange-listed securities options. **Reviewed:** October 26, 2026. This is an educational curriculum and sample process, not a recommendation to open a position or a substitute for a broker's rules, the contract specifications, or individual tax advice. Recheck the linked primary sources and the broker's current procedures before live trading.

The course treats correct operations and survival as prerequisites for strategy research. A favorable payoff diagram does not remove execution, assignment, settlement, liquidity, tax, or broker risks.

## Required reading and knowledge checks

| Reading | What the learner must be able to explain |
| --- | --- |
| [OCC *Characteristics and Risks of Standardized Options* (ODD)](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) | Rights versus obligations; exercise and assignment; risks of buyers, writers, and combinations; adjusted contracts. OCC says investors must read the ODD before buying or selling options. |
| [SEC: An Introduction to Options](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63) | Premium, strike, expiration, multiplier, payoff, and why a buyer can lose the entire premium while certain writers can lose more than the initial investment. |
| [SEC: Opening an Options Account](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-77) and [FINRA Rule 2360](https://www.finra.org/rules-guidance/rulebooks/finra-rules/2360) | Broker approval comes before options orders; permissions depend on experience, objectives, finances, and the broker's approval scheme. Levels and allowed strategies vary by firm. Do not misstate experience or finances to obtain approval. |
| [OIC: Exercising Options](https://www.optionseducation.org/optionsoverview/exercising-options) and [OIC: Assignment FAQ](https://www.optionseducation.org/referencelibrary/faq/options-assignment) | An American-style short option may be assigned on any business day, including before expiration. Explain ex-dividend and deep-in-the-money cases, and why a short in-the-money option should generally be expected to be assigned at expiration. |
| [FINRA: Understanding Assignment](https://www.finra.org/investors/insights/trading-options-understanding-assignment) | Assignment of one leg can leave stock and a surviving option. A spread's long option is not automatically exercised to resolve the obligation. After-hours moves can change exercise decisions after the regular close. |
| [SEC: Understanding Margin Accounts](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-29) | Margin interest, calls and liquidation, and why some short-option strategies can create losses greater than the initial investment. |
| [Cboe S&P 500 product comparison](https://www.cboe.com/tradable_products/sp_500/spx_weekly_options/specifications) | Verify each contract's underlying, multiplier, exercise style, cash versus physical settlement, and A.M. versus P.M. settlement. Cboe lists SPX/SPXW/XSP as European-style and cash-settled, versus SPY ETF options as American-style and physically settled. |
| [IRS Publication 550](https://www.irs.gov/publications/p550) and [Form 6781](https://www.irs.gov/forms-pubs/about-form-6781) | Keep complete tax records. The linked Publication 550 is the 2025 edition as of this review; check the relevant tax-year instructions before filing. Some qualifying broad-based index options may be Section 1256 contracts, generally subject to year-end mark-to-market and 60/40 capital-gain treatment; equity options, covered calls, straddles, and hedges can follow other rules. Determine actual treatment with a qualified tax professional. |

**Assessment:** The learner must calculate cash flows and worst-case obligations without looking up a payoff chart, and must find the primary contract specification and broker exercise instructions for a product. Passing a multiple-choice quiz alone is insufficient. Work the complete, fictional account ledgers and fresh cases in [OPERATIONAL_CASEBOOK.md](OPERATIONAL_CASEBOOK.md); the solution section is for checking a finished attempt.

## Risk scenarios to rehearse before any live order

1. **Long call expires worthless.** Calculate total cash lost, including fees, and explain why “cheap premium” does not make a high-probability trade. The [SEC options bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63) states buyers can lose the full premium.
2. **Uncovered short call gaps upward.** Show the obligation to deliver shares and why the loss has no fixed theoretical ceiling. No learner may practice this with a live order under the sample policy. See the [SEC leverage bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins/leveraged-investing-strategies-know-risks-using-these-advanced-investment-tools).
3. **Short call on a dividend-paying stock approaches an ex-dividend date.** Determine whether early exercise is plausible and whether a buy-to-close order can be filled before that day's option market close. A broker's exercise cutoff applies to a holder's exercise instructions; it is not a guaranteed exit window for a short position. [OIC](https://www.optionseducation.org/optionsoverview/exercising-options) says dividend dates can increase early-call assignment risk and that an open short can be assigned before expiration.
4. **Short leg of a vertical is assigned.** Recompute stock position, cash/share requirement, margin need, remaining option exposure, and exit choices. The apparent maximum loss shown for the *intact* spread is not a guarantee once the legs separate or the underlying moves after hours. Work through [FINRA's examples](https://www.finra.org/investors/insights/trading-options-understanding-assignment).
5. **Expiration close differs from after-hours market.** Model a short option that looked out of the money at the close but was exercised following an after-hours price move. Learn broker-specific exercise and do-not-exercise deadlines. See [OIC assignment guidance](https://www.optionseducation.org/referencelibrary/faq/options-assignment) and [FINRA's spread example](https://www.finra.org/investors/insights/trading-options-understanding-assignment).
6. **A.M. versus P.M. index settlement.** Retrieve the exchange specifications for a proposed expiry and calculate settlement cash, including the effect of a gap between last trading time and the settlement value. Start with [Cboe's specifications](https://www.cboe.com/tradable_products/sp_500/spx_weekly_options/specifications).
7. **Liquidity shock.** Reprice an exit at the bid for a long option or ask for a short option, then widen the spread and include fees. A model mid-price is not a guaranteed fill. State when the plan requires no trade.
8. **Broker intervention.** Explain how a margin deficit or insufficient shares/cash may lead to rejected orders or forced liquidation, and how such action could differ from the planned exit. Review the [SEC margin bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-29) and the broker's agreement.

## Account and rule check before live trading

- Record the **broker and account type**, approved strategies, option buying power, margin agreement, house requirements, fees, and whether complex orders can be entered and closed as a package. Broker approval levels are not standardized: [SEC](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-77).
- Obtain the broker's **exercise, do-not-exercise, and expiration liquidation deadlines** in the account's time zone. Confirm how instructions are submitted and what happens if cash or shares are insufficient. Do not assume the exchange close is the broker's cutoff: [OIC](https://www.optionseducation.org/optionsoverview/exercising-options).
- Check the exact **underlying, deliverable, contract multiplier, exercise style, settlement type/value, expiration, last trading time, and corporate-action adjustment** for each series. Do not infer SPX rules from SPY, or one expiration's settlement from another's: [Cboe](https://www.cboe.com/tradable_products/sp_500/spx_weekly_options/specifications), [OCC ODD](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document).
- Confirm **current day-trading and margin treatment with the broker**. FINRA replaced its pattern-day-trader day-trade-count and $25,000 minimum-equity framework with new intraday margin standards effective June 4, 2026. Member firms may phase in implementation through October 20, 2027, and can impose stricter house requirements. The new rule does not make margin risk-free; FINRA notes a $2,000 minimum equity to use leverage and an intraday maintenance-margin framework. Do not present either the old $25,000 threshold or a particular broker's implementation as universal. [FINRA Notice 26-10](https://www.finra.org/rules-guidance/notices/26-10); [FINRA investor explanation](https://www.finra.org/investors/insights/intraday-margin-requirements).
- Build a tax ledger recording trade and exercise dates, contract identifiers, fees, premiums, assignments, underlying share basis, and year-end open positions. Review [IRS Publication 550](https://www.irs.gov/publications/p550) and [Form 6781 guidance](https://www.irs.gov/forms-pubs/about-form-6781); obtain individual tax advice before relying on a particular treatment.

## Training gates

These are curriculum standards, not regulator requirements or proof of profitability. Failure means repeat the relevant module before advancing within this optional extended training policy. The [beginner microcourse](beginner/README.md) stands on its own: quantitative programming, a 104-week schedule, and a research capstone are not prerequisites for beginning, understanding a personal decision, or choosing not to trade. No course grade automatically approves live trading.

### Gate 1 — Market and contract literacy

- Complete the readings above and score at least **90%** on an independently written concept exam.
- Correctly draw and calculate expiration payoff, maximum *modeled* loss, break-even, and stock/cash obligation for long calls/puts, covered calls, cash-secured puts, and vertical debit/credit spreads.
- Pass **all** of the assignment, settlement, after-hours, and broker-cutoff scenarios above, using the [casebook](OPERATIONAL_CASEBOOK.md) to show before/after positions and cash. Every wrong operational answer is remediated and retested on a fresh case.

### Gate 2 — Simulated orders and risk process

- For at least **8 weeks**, record decisions in a paper journal, including decisions *not* to trade. Module 12 starts this record in weeks 45–48; continue it through at least weeks 49–52 while studying probability, and longer if the gate remains incomplete. Include at least **30 complete decision records** spanning quiet, volatile, and event-driven sessions; do not manufacture activity to satisfy a quota.
- Each simulated order has a written thesis, entry and exit condition, explicit worst-case obligation, position size, underlying event calendar, bid/ask spread, commissions, and a plausible adverse fill. Reconcile a sample of paper fills against quotes; paper platforms can give unrealistic fills.
- Run a documented stress test covering an overnight gap, volatility jump/crush, widening spreads, one-leg assignment, and a broker liquidation. Record the largest *modeled* cash/share obligation in each case; label any exposure without a finite theoretical ceiling.
- Show **100% adherence** to a written risk policy during the final four weeks. Complete the [quote and order-status replay](EXECUTION_PRACTICE.md), including nonfills and a cancellation that has not been confirmed. Profit in a simulator is neither required nor sufficient to pass; process and understanding are the gate.

### Gate 3 — Limited live practice, if financially appropriate

- Under this **optional advanced training policy**, live practice comes only after its Gates A–D in [COURSE.md](COURSE.md) and Gates 1–2 above. That is a conservative curriculum choice for this extended path, not a universal or regulatory requirement that every personal investor complete quantitative research. A separate personal decision still requires understanding the intended position, affordable losses, all share/cash obligations, the current ODD, broker permissions and procedures, and relevant account/tax circumstances. A synthetic software capstone alone supplies no real-market strategy evidence; claims about an edge need suitable real-market evidence, realistic execution assumptions, and forward observations. Completing either course does not certify live readiness, and remaining in observation or simulation is a valid outcome.
- Begin with a single small, fully paid, defined-risk position whose **contract-level** loss fits the written cash risk limit. If a single contract is too large, do not place a trade. Do not use margin borrowing, uncovered short options, or 0DTE as a shortcut to meet a sizing target.
- Record real fills, fees, execution delay, mistakes, and weekly account reconciliation. Increase size only after a separate review of sufficient live observations and risk-control adherence; a profitable week is not a sizing signal.

## Sample conservative training policy

**This is an illustrative classroom policy, not a claim that these thresholds are universally safe or optimal.** A learner may choose stricter limits, and anyone unable to lose the stated amount should not trade live.

| Rule | Sample limit or action |
| --- | --- |
| Capital | Use only money set aside for practice whose full loss would not disrupt living expenses or long-term obligations. No borrowing to fund the account. |
| Allowed initial positions | Fully paid long options or broker-approved defined-risk spreads only after the relevant strategy exam. Do not open uncovered short options. Prefer avoiding positions that could create unwanted shares. For American-style spreads, plan an exit before expiry, while recognizing that early assignment remains possible on any day the short leg is open. |
| Maximum new-position loss | At most **0.25% of practice account equity**. Calculate full premium or intact-spread theoretical maximum loss **plus entry, exit, and other expected fees per contract**. Choose the largest **whole-number quantity that remains within** the budget; never round the contract quantity up. Model additional assignment, slippage, and gap risks separately. No trade if one contract exceeds the limit. |
| Aggregate open-position modeled loss | At most **1% of practice account equity**, including correlated positions. Add stress scenarios; the modeled sum can underestimate real losses. |
| Loss pause | Stop placing new risk orders after a **1% decline in daily account equity**, **3% in weekly account equity**, or **5% from the cash-flow-adjusted equity high-water mark**. Include realized and open-position P&L; adjust for deposits and withdrawals, define the start/end times and marking rule, and flag stale marks. On a trigger, inspect actual positions and pending orders, cancel confirmed unnecessary entries, and follow the written plan to reduce or manage existing risk. Do not assume a submitted cancellation has succeeded. Resume only after a written review and a new plan. These are illustrative thresholds. |
| Execution | Use limit orders; specify the most adverse acceptable fill in advance. Cancel an order when the quote or thesis changes. Never treat a stop order as guaranteed protection against gaps. |
| Expiration and events | Check dividend, earnings, distribution, corporate-action, and last-trading/settlement calendars. Close or otherwise deliberately manage physical-settlement short legs before the last tradable time and any earlier broker risk-liquidation deadline. A buy-to-close order must fill to remove assignment exposure. |
| Advanced strategies | Margin leverage, uncovered options, complex ratio positions, and 0DTE require separate advanced study and a new risk policy. They are never prerequisites for mastery. |

For a paid option, initial modeled loss is premium × the actual contract multiplier + fees. For a standard one-to-one vertical credit spread with matching expiration, multiplier, and deliverable, the intact position's modeled maximum loss at expiration is (strike width − credit received) × the multiplier + fees. This formula **does not** capture every operational or post-expiration scenario and may not apply to adjusted contracts. Verify the series' deliverables before calculating risk. See the [OCC ODD](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) and [FINRA assignment examples](https://www.finra.org/investors/insights/trading-options-understanding-assignment).

For example, a hypothetical $100,000 practice account has a $250 new-position budget under the 0.25% illustration. If one fully paid contract has $120 premium at risk and $2 total fees, the greatest permitted quantity by this rule is `floor(250 / 122) = 2`; two use $244, while three use $366. If the per-contract modeled loss is $260, the permitted quantity is zero. Separate share-delivery and liquidity stresses can still reject a position that fits this arithmetic.

**Equity and pause calculation:** Save account equity at a fixed daily and weekly start time, then calculate change as `current equity − starting equity − net external deposits` (a withdrawal is a negative deposit). Equity includes cash plus marked open positions and liabilities. State the valuation source; for a hypothetical liquidation view, mark long options at a plausible bid and short options at a plausible ask, then stress wider quotes. Keep a separate cash-flow-adjusted equity path for the high-water comparison. A $10,000 account with no deposits and $100 of open losses has fallen 1% even if no loss was realized. If quotes are stale or unavailable, record the uncertainty and use the contingency process instead of silently declaring the threshold unbreached. This illustration is a training rule, not a claim that every account should use these percentages.

## Reusable templates

### Pre-order card

```text
Date/time and account:
Underlying / exact option symbols / expirations:
Exchange contract specification link; multiplier and deliverable:
Exercise style; cash or physical settlement; A.M./P.M. value:
Event, dividend, earnings, and corporate-action checks:
Why this position? What observation would disprove the thesis?
Entry limit, current bid/ask, expected fees, adverse-fill assumption:
Planned exit or expiration action; broker cutoff:
Maximum modeled loss; gap/assignment/stock/cash stress case:
Account equity; position and aggregate risk after entry; whole-number size calculation:
Can I fund all possible share/cash obligations? If no, how will I avoid them?
Decision: enter / wait / abstain; reason:
```

### End-of-day and expiration check

```text
All positions and orders reconciled with broker statement? Yes/No
Any short American-style options with assignment risk? Which?
Any ex-dividend, earnings, split, merger, halt, or distribution tomorrow?
Any expiring options? Broker cutoff and exercise instructions recorded?
Any physical-delivery exposure requiring shares or cash?
Any spread whose legs could separate? Action and deadline?
Account equity including open marks, external cash flows, buying power, margin status, and loss-pause status:
Any order pending cancellation or unconfirmed status? Order IDs and resolution:
Trade journal complete; discrepancy escalated to broker if needed?
```

### Weekly risk review

```text
Starting/ending cash-flow-adjusted equity; realized and unrealized P&L; fees and slippage:
Largest position and aggregate modeled loss; peak-to-trough decline:
Number of rule violations and near misses (target: zero):
Assignment/settlement/corporate-action surprises:
Paper versus executable-fill differences:
What evidence supports or weakens each trading hypothesis?
Next week's size: same / lower / no live trading, with reason:
```

## Maintenance rule

Review OCC disclosures, exchange specifications, FINRA margin rules, broker procedures, and IRS guidance at least annually and whenever a product, broker, strategy, or tax year changes. Date each review in the trading journal. The 2026 FINRA intraday-margin transition makes broker-specific verification especially important through October 2027.
