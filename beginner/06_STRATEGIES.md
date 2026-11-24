# Module 6 · Understand a position before choosing a strategy

[Course home](README.md) · [Previous: operations](05_OPERATIONS.md) · [Next: risk](07_RISK.md) · [Full library](../README.md)

**Lessons 41–48.** These structures are for understanding and simulation. Knowing their names is not a recommendation to use them. Study one lesson a day; use the remaining 3–5 minutes to redraw yesterday's cash flows.

Every worked example uses fictional **100-share standard American-style stock/ETF options**. Stock and option quantities are stated. All option legs of a spread have the **same underlying, expiration, multiplier, and deliverable**, one contract each. **Fees, interest, dividends, taxes, and trading costs are $0 for classroom arithmetic.** Actual results must include them. Expiration bounds assume the matching position stays intact and exercise/settlement is handled consistently; they do not cover unwanted post-expiration stock, broken legs, or forced liquidation.

Your goal: identify what is owned, what is owed, cash paid/received, and a bad outcome for each position.

## Lesson 41 · A long call buys upside exposure with a deadline

A **long call** is a purchased right to buy shares at a strike. Used alone, it can benefit from a sufficiently large, timely rise. It can lose the full premium; it does not become good value simply because the premium is small. The option position's loss is limited to premium and costs, but exercising into stock creates a separate stock position and funding requirement. [OIC describes the long call](https://www.optionseducation.org/strategies/all-strategies/long-call).

**Worked example:** Buy one $50 call for $2. Pay **$200**. At expiration, stock at $56 gives `$6 × 100 = $600` exercise value and **$400 profit** after premium. Stock at $51 gives only $100 value and **$100 loss**, even though stock is above strike. At or below $50, the option loses its **$200 premium**. Expiration break-even is **$52**, before costs. Upside has no fixed theoretical ceiling as stock rises.

**Try it:** One $60 call costs $3. At expiration stock is $62. Find result, expiration break-even, and maximum option-premium loss.

<details><summary>Check your reasoning</summary>

Exercise value `(62 − 60) × 100 = $200`; subtract $300 premium: **−$100**. Break-even **$63**. Maximum premium loss **$300**, before costs and separate stock risks after exercise.

</details>

**Recall:** What three things can be wrong even if the buyer correctly expects an upward stock direction?

## Lesson 42 · A long put buys downside exposure with a deadline

A **long put** is a purchased right to sell at the strike. Used alone, it can benefit from a sufficiently large, timely stock fall. Its value can still fall before expiration if the stock move disappoints, IV drops, or time passes. [OIC describes the long put](https://www.optionseducation.org/strategies/all-strategies/long-put).

**Worked example:** Buy one $50 put for $2: pay **$200**. At expiration with stock $44, exercise value is `$6 × 100 = $600`; profit is **$400** after premium. With stock $49, exercise value is $100 and the result is **−$100**. At or above $50, the premium loss is **$200**. Expiration break-even is **$48**. Since a stock cannot fall below zero, idealized maximum expiration profit is `(50 − 2) × 100 = $4,800`, achieved at zero stock value before costs.

Exercising without owned shares can create short stock if allowed; the limited premium-loss statement applies to the option, not a later stock short.

**Try it:** One $40 put costs $1.50. Stock ends at $37. Find result and expiration break-even.

<details><summary>Check your reasoning</summary>

`[(40 − 37) − 1.50] × 100 = +$150`. Break-even **$38.50**. The calculation assumes a consistent expiration payoff; it is not a promise of a market sale or exercise workflow.

</details>

**Recall:** Why does a put have a finite theoretical expiration profit even if the stock collapses?

## Lesson 43 · A protective put combines shares with a temporary floor

A **protective put** combines owned stock and a matching long put. Buying both together is also called a **married put**. The put provides a sale right at the strike while it remains valid. Protection costs premium, has a deadline, and does not remove stock risk after it expires. [OIC explains a protective put](https://www.optionseducation.org/strategies/all-strategies/protective-put-married-put).

**Worked example:** Buy **100 shares at $50** and one **$45 put at $1**. Total initial cash outlay is `$5,000 + $100 = $5,100`. At expiration, if stock is $35, the shares are worth $3,500 and the put has $1,000 exercise value. Combined value is **$4,500**, a **$600 loss**. This is the idealized maximum expiration loss for this matched example: `(50 − 45 + 1) × 100`. At stock $60, the put has zero expiration value and the position is worth $6,000, a **$900 gain**.

The floor is $45/share in combined expiration value, not a promise that the original $50 purchase is protected completely. You paid another $1/share for that floor.

**Try it:** Buy 100 shares at $30 plus one $28 put for $0.80. What is total cost and the idealized maximum expiration loss?

<details><summary>Check your reasoning</summary>

Cost **$3,080**. Minimum combined expiration value is **$2,800** while the matched put protection applies. Maximum modeled expiration loss is **$280**, before excluded costs. Later protection requires a new decision and may cost more premium.

</details>

**Recall:** When does this protection stop applying?

## Lesson 44 · A covered call exchanges some upside for premium

A **covered call** combines 100 owned shares with one short call covering them. The shares cover delivery if assigned. They do not protect you against the stock collapsing. The short call can be assigned early, including around dividends, and limits the benefit from large stock rises. [OIC describes covered-call risk and foregone upside](https://www.optionseducation.org/strategies/all-strategies/covered-call-buy-write).

**Worked example:** Buy **100 shares at $50** and sell one **$55 call for $1**. Net outlay is **$4,900**. If stock ends at $60 and the call is exercised, sell the shares for $5,500. Profit is **$600**, and further stock upside does not increase that idealized expiration profit. At stock $40, the call has zero expiration value but shares are worth $4,000: **$900 loss**. At zero stock value, the loss is **$4,900**. The $100 premium was only a small cushion.

Do not describe this as risk-free income. Evaluate the whole stock-and-option position and whether giving up the shares at the strike serves the objective.

**Try it:** Buy 100 shares at $40 and sell one $45 call for $2. What is the idealized maximum expiration profit? What is the loss if stock becomes worthless?

<details><summary>Check your reasoning</summary>

Net outlay **$3,800**. Maximum expiration proceeds **$4,500**, so profit **$700**. At zero stock value, loss **$3,800** before costs. The short call's coverage fixes the share-delivery issue, not the stock's downside.

</details>

**Recall:** What does the word “covered” actually cover?

## Lesson 45 · A cash-secured put reserves the money to buy shares

A **cash-secured put** is a short put with enough cash set aside to fund its share purchase if assigned. It can result in buying stock after a sharp fall. Receiving premium does not eliminate the purchase obligation or the subsequent stock risk. [OIC describes the cash-secured put](https://www.optionseducation.org/strategies/all-strategies/cash-secured-put).

**Worked example:** Sell one **$45 put for $1** and reserve the **$4,500 exercise purchase amount**. Receive **$100 premium**. If assigned, pay $4,500 and receive 100 shares. The premium gives an economic acquisition cost of **$44/share before costs**. At stock $30, shares are worth $3,000, so the result including premium is **−$1,400**. At zero, maximum idealized loss is **$4,400**. Maximum option profit is the **$100 credit**, if no liability remains. Expiration break-even is $44.

Do not treat reserved cash as permission to buy stock you otherwise do not want or could not afford to lose. Broker collateral treatment must be checked separately.

**Try it:** Sell one $30 put for $0.80. State the exercise purchase amount, maximum idealized profit, break-even, and loss at zero stock value.

<details><summary>Check your reasoning</summary>

Purchase amount **$3,000**; maximum profit **$80**; break-even **$29.20**; loss at zero **$2,920**. All exclude costs. Assignment may occur before expiry, and cash must be available then.

</details>

**Recall:** Does receiving an $80 credit cap the writer's loss at $80?

## Lesson 46 · A bull call debit spread trades away some upside to reduce cost

A **bull call debit spread** buys one lower-strike call and sells one higher-strike call with matching terms. **Debit** means net cash paid. The short call reduces cost but caps the intact position's idealized expiration value. It also introduces assignment obligations. [OIC explains this spread](https://www.optionseducation.org/strategies/all-strategies/bull-call-spread-debit-call-spread).

**Worked example:** Buy one **$50 call for $3**; sell one **$55 call for $1**. Pay net `(3 − 1) × 100 = $200`. Strike width is $5, so the intact expiration value ranges from **$0 to $500**. Maximum modeled expiration loss is **$200**; maximum profit is **$300**; break-even is **$52**. At stock $53, the long call has $300 intrinsic value and the short call has zero, yielding **$100 profit** after the $200 debit.

If the short call is assigned early, the long call does not automatically exercise. Shares, funding, and order handling must be reconciled. The $200 bound is a matching-payoff statement, not a guarantee against every broken-leg or post-expiry outcome. [FINRA explains one-leg assignment](https://www.finra.org/investors/insights/trading-options-understanding-assignment).

**Try it:** A matching $40/$45 bull call spread costs $1.50 net. Find maximum modeled expiration loss, maximum profit, and break-even.

<details><summary>Check your reasoning</summary>

Loss **$150**; profit `(5 − 1.50) × 100 = $350`; break-even **$41.50**. Each result excludes costs and assumes the matching spread stays intact with exercise/settlement handled consistently.

</details>

**Recall:** What benefit of the long call did selling the higher call give up?

## Lesson 47 · A bull put credit spread receives cash and keeps an obligation

A **bull put credit spread** sells a higher-strike put and buys a lower-strike put with matching terms. **Credit** means net cash received. Profit is limited; losses arise when the stock falls far enough. The purchased put limits the intact expiration payoff loss under matching terms, not all operational funding needs. [OIC explains the bull put spread](https://www.optionseducation.org/strategies/all-strategies/bull-put-spread-credit-put-spread).

**Worked example:** Sell one **$50 put for $2** and buy one **$45 put for $1**. Net credit **$100**. At stock $55, both have zero expiration value: profit **$100**. At stock $48, the short put owes $200 exercise value while the long put has none: net result **−$100** after the initial credit. At or below $45, the intact payoff gap is $500: maximum modeled expiration loss **$400**. Break-even is **$49**.

Assignment of the short put can still require **$5,000 to buy 100 shares**, while the long put stays open. The long put's presence does not automatically submit the required exercise or closing instruction. [FINRA describes that operational risk](https://www.finra.org/investors/insights/trading-options-understanding-assignment).

**Try it:** A matching $35/$30 bull put spread receives $0.70 net. Calculate maximum profit, maximum modeled expiration loss, and break-even.

<details><summary>Check your reasoning</summary>

Profit **$70**; loss `(5 − 0.70) × 100 = $430`; break-even **$34.30**. Excludes costs and assumes consistent handling of the intact matching position. The credit is not the risk amount.

</details>

**Recall:** Why can a $430 modeled payoff loss coexist with a much larger temporary share-purchase amount?

## Lesson 48 · Complexity is optional; “no trade” is a complete decision

Names such as **straddle**, **strangle**, **calendar**, **butterfly**, and **iron condor** describe combinations of options. A straddle, for example, buys or sells a call and a put at the same strike and expiration. More legs create more terms, execution costs, and possible paths to understand. Different expirations leave live options at different times. You can study these later in [the reference volumes](../LESSONS_01_FOUNDATIONS.md); you do not need to trade them to complete the beginner course.

**Worked example:** One call costs $2 and one put costs $2 at the same $50 strike and expiration. Buying both costs **$400**. At expiration with stock still $50, both have zero value and the full **$400 is lost** before costs. Owning a position for each direction did not make a profit inevitable. Large moves might help, but their price and timing matter. [OIC describes a long straddle](https://www.optionseducation.org/strategies/all-strategies/long-straddle).

When the contract is unclear, a single contract is too large, or an event exceeds what you can assess, a complete learning ticket can say **“no trade; continue observation.”** You do not need to choose a strategy merely because you studied it.

**Try it:** A hypothetical position risks $180, but your prewritten practice limit is $100. Does adding a strategy name or rounding up the limit solve the problem? State the decision.

<details><summary>Check your reasoning</summary>

No. One position exceeds the limit. Record **no trade** and the reason, or continue simulation. A more complicated position is a new analysis, not automatic permission to exceed an existing rule.

</details>

**Recall:** What useful evidence does a documented no-trade decision provide?

## Module checkpoint · Work the entire position

Use the same standard contract and $0 teaching-cost assumptions.

1. Compare a $50 call bought for $2 and a $50 put bought for $2. At stock $47 on expiration, what is each result? What is the maximum premium loss on each option?
2. Buy 100 shares at $40 plus one $38 protective put for $1. Find initial cost and idealized maximum expiration loss. Explain the protection's deadline.
3. Buy 100 shares at $40 and sell a $45 call for $1.50. Find maximum idealized expiration profit and loss at zero. Then explain what a $35 cash-secured put sold for $1 could require on assignment.
4. A matching $50/$55 bull call spread costs $2 net. A matching $50/$45 bull put spread receives $1 net. For each find maximum modeled expiration profit/loss and break-even.
5. A short spread leg is assigned while the long leg remains. Can you assume the long leg automatically fixes the shares? If a position cannot be explained or exceeds the written limit, what is a valid decision?

<details><summary>Checkpoint worked key · open after saving your answers</summary>

1. Call expires with zero intrinsic: **−$200**. Put has $300 exercise value minus $200 premium: **+$100**. Each option's maximum premium loss is **$200** before costs and separate stock exposure after exercise.
2. Cost **$4,100**. Floor while the matched protection applies is $3,800 combined expiration value, giving maximum modeled expiration loss **$300**. The put expires; later stock risk is not covered by that expired right.
3. Net covered-call outlay **$3,850**; capped proceeds $4,500; maximum profit **$650**. Loss at zero **$3,850**. The cash-secured put receives $100 premium but assignment requires **$3,500 to buy 100 shares**. It may suffer substantial losses if stock falls.
4. Call spread: loss **$200**, profit **$300**, break-even **$52**. Put spread: profit **$100**, loss **$400**, break-even **$49**. These are intact matching-expiration results before costs; funding and broken-leg outcomes require a separate ledger.
5. **No.** Reconcile actual shares, cash, surviving options, order status, and broker procedures. **No trade / continue observation or simulation** is valid when the position cannot be explained or breaches the limit.

</details>

**Pass and retry:** Answer all five correctly, show the cash arithmetic, and state one disappointing outcome and one operational issue for each studied strategy. Repeat missed lessons and solve a changed-number case next study day. These checks establish learning only; they do not authorize live positions. Revisit one strategy after 1, 3, and 7 study days.

[Next: sizing, losses, and the decision to take risk](07_RISK.md)
