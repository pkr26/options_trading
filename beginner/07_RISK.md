# Module 7 · Protect your ability to keep learning

[Course home](../README.md) · [Previous: strategies](06_STRATEGIES.md) · [Next: paper practice](08_PRACTICE.md)

Complete one lesson per day. Allow 5–10 minutes to read, calculate, and explain your answer aloud; use the rest of your 10–15 minutes to review yesterday's idea. Every amount, probability, account, and instrument below is invented. These are simulation exercises. A classroom loss budget is not a recommendation for your money.

## Lesson 49 · Expected value means an average over possible outcomes

**Time: 5–8 minutes. One idea:** a possible profit needs a probability and a possible loss beside it.

Imagine a game whose rules are known: a 40% chance of gaining $90 and a 60% chance of losing $70. These outcomes already include every cost. Multiply each outcome by its probability, then add: `0.40 × $90 + 0.60 × (−$70) = $36 − $42 = −$6`. That is its **expected value**, the probability-weighted average outcome. It is not a forecast that the next play will lose exactly $6. The next play gains $90 or loses $70.

For an actual option, the probabilities and future sale prices are uncertain. A calculator can correctly multiply invented inputs and still tell you nothing reliable about a market opportunity. Writing “70% likely” does not establish 70%. A quoted option delta is not a verified probability that your whole trade will make money.

**Worked example:** A fictional two-outcome contract has a 25% chance of +$240 and a 75% chance of −$100, after costs. Expected value is `$60 − $75 = −$15`. A large possible winner does not make the average positive.

**Try it:** Known classroom probabilities are 60% for +$30 and 40% for −$50, after costs. Find expected value. Can this calculation establish an option-trading edge?

<details>
<summary>Check your answer</summary>

`0.60 × $30 − 0.40 × $50 = $18 − $20 = −$2`. No. The inputs describe an invented game; real trading probabilities and outcomes need evidence. Even a positive expected value would not promise the next result.

</details>

## Lesson 50 · Winning often can still lose money

**Time: 5–8 minutes. One idea:** count dollars as well as wins.

**Win rate** is winning closed trades divided by all closed trades in the sample. **Average win** and **average loss** describe the dollars gained and lost. Keep unfilled orders and still-open positions in separate records; do not quietly delete them or count an open gain as a finished win.

**Worked example:** Eight fictional closed trades each gain $20; two each lose $100. All outcomes are after costs. Win rate is `8 ÷ 10 = 80%`. Total result is `8 × $20 − 2 × $100 = −$40`. The sample has frequent wins and a loss overall.

The ratio of average win to average loss magnitude is `$20 ÷ $100 = 0.20`. In a simplified repeated two-outcome model with those fixed net amounts, the break-even win probability solves `p × 20 − (1−p) × 100 = 0`: `p = 100 ÷ 120 ≈ 83.33%`. Actual losses can vary; a short sample does not establish a stable probability.

**Try it:** Five closed paper trades gain $40 each; three lose $90 each, after costs. What are win rate and total result? What does a screenshot showing only the five wins omit?

<details>
<summary>Check your answer</summary>

Win rate is `5 ÷ 8 = 62.5%`. Result is `$200 − $270 = −$70`. The screenshot omits the losing outcomes and therefore cannot establish the overall result. Also ask about open positions, dates, costs, and deposits or withdrawals.

</details>

## Lesson 51 · Position size begins with dollars at risk

**Time: 6–10 minutes. One idea:** sometimes the allowable quantity is zero.

A **risk budget** is a chosen limit on loss for an exercise or plan. It differs from the cash a broker requires to open a position. A low opening cash requirement does not establish a low possible loss. This lesson chooses arbitrary classroom dollar caps; it does not prescribe a percentage of anyone's savings.

**Worked example:** For a paper exercise, the loss cap is $300. One standard long option costs $1.20 × 100 = $120. Assume $2 total fees per contract over the scenario. Assume the option is closed while still an option or expires without exercise; there are no acquired shares, borrowing, or other charges. Its greatest option-position loss under those assumptions is $122. Two contracts risk `$244`; three risk `$366`. Thus the cap permits at most two, with $56 unused. This arithmetic does not tell you whether taking even one is sensible.

If the exercise instead permits only $110 loss, the permitted quantity is zero. Do not substitute a guessed stop-loss amount for full downside. Exercise, assignment, and a stock position require a separate cash and exposure analysis.

**Try it:** A paper loss cap is $250. A standard long option costs $0.85 per share with $3 total scenario fees per contract. Under the same no-share assumptions, what is the largest whole-contract quantity? What if the cap is $80?

<details>
<summary>Check your answer</summary>

Each risks `$0.85 × 100 + $3 = $88`. Two risk $176; three risk $264. At most two fit the $250 cap. At an $80 cap, zero fit. Leaving budget unused is an acceptable result.

</details>

## Lesson 52 · Different tickers can carry the same risk

**Time: 5–8 minutes. One idea:** count shared exposures across the account.

**Concentration** means relying heavily on one company, sector, or market event. **Correlation** describes how two quantities have tended to move together. Different contract names do not ensure different risks. Two long calls on the same stock at different strikes may both lose when that stock falls. Two ETFs can also own many of the same companies.

You do not need a correlation formula yet. Start with one question: “Which event could hurt several of my positions together?” Also include any shares owned outside the option exercise. Historical relationships may change; diversification does not guarantee protection. [Investor.gov explains diversification and overlapping fund holdings](https://www.investor.gov/introduction-investing/getting-started/asset-allocation).

**Worked example:** Two paper long calls each cost $150, with no fees in this example. A severe decline leaves both worthless without exercise. Combined option loss is `$150 + $150 = $300`. Putting them on separate notebook pages does not reduce the loss. A single-position cap of $200 has not enforced a separate $250 portfolio cap.

**Try it:** Three paper calls on companies in the same industry each have a $90 loss in a specified joint shock. What is the combined loss? Does using three company names prove independence?

<details>
<summary>Check your answer</summary>

The specified shock loses `3 × $90 = $270`. Three names do not establish independence; a common industry event can affect all three. This is a scenario calculation, not an estimate of its probability.

</details>

## Lesson 53 · A stop instruction does not guarantee the loss

**Time: 5–8 minutes. One idea:** the trigger price and the fill price are different things.

A **stop order** normally becomes a market order after its trigger condition is met. It can execute at a much worse price during a gap or fast market. A **stop-limit order** becomes a limit order after triggering; its price constraint can leave it unfilled. Available orders and trigger methods differ by broker and instrument. Check whether the option order even exists and which quote or trade triggers it. [Investor.gov explains these order tradeoffs](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-14).

**Worked example:** A fictional long option was bought for $2.00 per share. Imagine an available sell stop with a $1.50 trigger. After a gap it fills at $0.90. The premium loss on a standard 100-multiplier contract is `($0.90 − $2.00) × 100 = −$110`, before fees. The hoped-for $50 loss was not guaranteed.

If instead a triggered sell limit requires at least $1.40 while buyers bid $0.90, no fill is guaranteed and the option remains open. Neither instruction turns uncertain execution into insurance.

**Try it:** A $1.80 long option has a hypothetical sell stop trigger at $1.20. It fills at $0.70 after a gap. Find one-contract loss before fees. What changes if a triggered sell limit demands $1.15 while the best bid remains $0.70?

<details>
<summary>Check your answer</summary>

`($0.70 − $1.80) × 100 = −$110`. The sell-limit order may remain unfilled; $0.70 is below its minimum price. In that case there is still an open position, not a completed $65 loss.

</details>

## Lesson 54 · Recovering a loss takes a larger percentage gain

**Time: 5–8 minutes. One idea:** measure a recovery from the smaller balance.

**Drawdown** is the decline from an earlier account-value peak. To compare values fairly in this lesson, assume no deposits or withdrawals and use consistent marks for open positions. Cash deposited after a loss is not trading profit.

**Worked example:** A hypothetical account peaks at $10,000, then is worth $7,500. The dollar decline is $2,500. Drawdown is `$2,500 ÷ $10,000 = 25%`. Recovering to $10,000 requires `$2,500 ÷ $7,500 ≈ 33.33%` growth from the lower balance. A 25% gain on $7,500 reaches only $9,375.

This is arithmetic, not a reason to increase size to recover quickly. Increasing risk after losses can create a larger loss. A written exercise can pause after a chosen threshold so you can check arithmetic, assumptions, and decisions before doing more paper cases. The threshold is a personal planning choice, not a course formula that makes a strategy safe.

**Try it:** With no cash flows, a paper account declines from $8,000 to $6,000. Find drawdown and the percentage gain needed to recover. Would depositing $2,000 prove recovery by trading?

<details>
<summary>Check your answer</summary>

Drawdown is `$2,000 ÷ $8,000 = 25%`. Recovery requires `$2,000 ÷ $6,000 ≈ 33.33%`. A deposit restores the balance but is an external contribution; trading has not earned it back.

</details>

## Lesson 55 · Write evidence before the outcome tempts you

**Time: 5–8 minutes. One idea:** a dated record makes selective memory harder.

**Hindsight bias** makes an outcome seem obvious after it happens. **Confirmation bias** makes supportive evidence easier to notice than contradictory evidence. A simple defense is to save a decision and its reason before seeing the result, then preserve it when wrong.

**Worked example:** Before a paper event you write, “I do not know whether the stock will rise; the quoted option is too expensive under my stated assumptions, so I pass.” The stock later rises. This does not prove the pass was an error, because the option's price, timing, and costs still matter. Changing your old note to “I knew it would rise” destroys your evidence.

Be skeptical of guaranteed trading returns, urgency, secret winning formulas, and screenshots of selected winners. Independently check the claim's denominator, losses, dates, costs, and source. The SEC identifies guaranteed high returns and pressure to act as fraud warning signs; its tools can check an investment professional's registration. A registration check does not endorse a strategy. [Investor.gov fraud guidance](https://www.investor.gov/protect-your-investments/fraud/protect-your-money).

**Try it:** A promoter shows 12 winning trades and promises “risk-free weekly options income.” Name two missing facts and one appropriate action before trusting the claim.

<details>
<summary>Check your answer</summary>

Missing facts include all losing and open positions, capital exposed, dates, actual fills, and costs. Do not send money based on the claim. Check independent primary sources and registration where relevant; guaranteed high trading income is a warning sign. Twelve selected wins cannot establish the full record.

</details>

## Lesson 56 · A written plan includes facts you still need to verify

**Time: 7–10 minutes. One idea:** uncertainty belongs in the plan before a decision.

A useful paper plan fits on one page: contract and purpose; full premium and fees; largest modeled option loss; possible shares and cash after exercise or assignment; reason for entry or a pass; exit and expiration handling; data source and timestamp; size and portfolio limit; and a pause condition. Mark unknown facts as unknown. “No paper order because contract terms are unclear” is a complete decision.

**Worked example:** One invented standard long call costs $1.50 × 100. With $1 entry and $1 exit fees, opening cash outflow is $151 and assumed round-trip fees total $2. The no-exercise option loss scenario is $152 including those assumed fees. Exercising a $50 strike would separately require $5,000 for 100 shares. A $152 option-loss calculation does not fund exercise.

For any eventual broker account, verify current permission levels, account restrictions, margin and forced-liquidation policies, the complete fee schedule, and exercise instructions and deadlines in that firm's current documents. Margin is collateral or borrowing capacity, not a promise that loss stops there. [FINRA's options overview](https://www.finra.org/investors/investing/investment-products/options) and [the SEC's margin-account bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-29) explain these distinctions. Frequent-trading requirements can change; read [FINRA's current guidance](https://www.finra.org/investors/insights/frequent-intraday-trading) rather than relying on an old social-media threshold.

Tax treatment is another verification task. U.S. options may involve different reporting, wash-sale, or straddle rules depending on the position. As checked November 14, 2026, the IRS's Publication 550 page provides the 2025 publication; use the applicable year's official material when filing and seek qualified tax help for your facts. No single tax percentage is assumed here. [IRS Publication 550](https://www.irs.gov/publications/p550).

**Try it:** A paper ticket shows a $200 premium and “$0 commission,” but contract charges and expiration instructions are unknown. What must the plan say before you compute a full net result or assume the position can expire unattended?

<details>
<summary>Check your answer</summary>

Record the missing per-contract, exchange or other applicable charges and verify the current full fee schedule. Record unknown exercise and expiration handling and verify the firm's deadlines, instructions, and liquidation policies. Until resolved, keep any net result explicitly incomplete and record a pass rather than inventing certainty. No broker account is needed to practice identifying those unknowns.

</details>

## Module 7 checkpoint

Use a fresh page and cover the key. Allow 10–15 minutes; taking another day is fine.

1. A known fictional game has a 30% chance of +$140 and a 70% chance of −$80, after costs. Find expected value. Does it predict the next outcome?
2. Nine fictional closed trades earn $15 each and one loses $180, after costs. Find win rate and total result.
3. A paper risk cap is $310. One standard long option costs $1.00, with $4 total scenario fees per contract. Assume no exercise or stock exposure. How many whole contracts fit? What if two other positions could lose $120 each in the same shock and the total portfolio cap is $350?
4. A paper account falls from $5,000 to $4,000 with no cash flows. Find drawdown and the gain needed to recover. Can a sell stop guarantee a chosen recovery or loss limit?
5. A plan says, “Cheap broker margin, zero commissions, sell before expiration if needed.” Name three facts that remain to verify and the appropriate paper decision if they remain unknown.

<details>
<summary>Worked checkpoint key and retry rule</summary>

1. `0.30 × $140 − 0.70 × $80 = $42 − $56 = −$14`. The next outcome is +$140 or −$80 in this game, not −$14.
2. Win rate is 90%; result is `$135 − $180 = −$45`. Frequent wins do not establish profit.
3. Each risks `$100 + $4 = $104`. Two risk $208; three $312, so two fit the single-exercise cap. Other joint losses total $240. One new contract brings the portfolio shock to $344, while two bring it to $448. Thus at most one fits both stated caps. This is classroom arithmetic, not a recommendation to take one.
4. Drawdown is `$1,000 ÷ $5,000 = 20%`. Recovery is `$1,000 ÷ $4,000 = 25%`. A stop does not guarantee its fill price; a stop-limit can remain unfilled.
5. Verify the actual margin and liquidation policy; all relevant fees rather than the commission headline alone; and exercise deadlines, assignment exposure, expiration handling, and executable exit availability. Taxes and account restrictions also require current sources. Record a pass while essential facts remain unresolved.

**Pass:** explain all five answers in your own words and correct every calculation. Questions 3–5 are essential: never substitute margin for maximum loss, assume a guaranteed stop, or assume unknown operational rules. If you miss anything, revisit its lesson, wait until the next study session, and redo it with changed numbers. Preserve the first attempt. Passing measures understanding of these cases; it does not authorize live trading.

</details>

[Continue to Module 8](08_PRACTICE.md) · [Course home](../README.md)
