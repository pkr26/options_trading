# Part 3: value is not the same as profit

[Previous: option contracts](02_CONTRACTS.md) · [Course home](../README.md) · [Next: changing option prices](04_PRICES.md)

Take one 5–10 minute lesson per session. All examples use fictional ABC, one **standard 100-share stock option**, multiplier 100, and **ignore fees and taxes**. Unless explicitly closing early, the arithmetic is an idealized **expiration** calculation: assume intrinsic value is realized. Actual stock-option exercise transfers shares and strike cash; it does not simply deposit the profit shown here. Study [operations](05_OPERATIONS.md) before any simulation that includes expiration.

## Lesson 17: a call's intrinsic value is its favorable exercise difference

**Time: 5–10 minutes. One idea:** a call's intrinsic value comes from buying below the stock's market price.

For a standard call, subtract strike from stock price. If the result is negative, use zero. This is **intrinsic value**, not yet profit and not necessarily the option's market price before expiration. [OIC: options pricing](https://www.optionseducation.org/optionsoverview/options-pricing).

**Worked example:** ABC is $34 and a call's strike is $30. The favorable difference is `$34 − $30 = $4` per share, or `$4 × 100 = $400` per contract. If ABC were $28, buying at $30 would give no favorable difference; intrinsic value would be $0, not negative $200.

**Try it:** At expiration ABC is $47 and a standard call's strike is $44. What is the call's intrinsic value per share and per contract?

<details>
<summary>Answer — open after your attempt</summary>

Per share: `$47 − $44 = $3`. Per contract: `$3 × 100 = $300`. This number has not yet subtracted what the buyer paid for the option.

</details>

## Lesson 18: call profit subtracts the premium

**Time: 5–10 minutes. One idea:** a valuable call can still lose money for its buyer.

At expiration, the call buyer's idealized result is `intrinsic value in dollars − premium dollars paid`. A negative answer is a loss. Losing the full option premium is possible. This describes the option's economics; a stock position produced by exercise introduces its own exposure. [OIC: long-call risk and profit](https://www.optionseducation.org/strategies/all-strategies/long-call).

**Worked example:** Buy a $30 call for $2 quoted premium: cost `$2 × 100 = $200`. ABC finishes at $31. Intrinsic value is `($31 − $30) × 100 = $100`. Profit is `$100 − $200 = −$100`. The stock ending above the strike did not cover the premium.

**Try it:** Buy a $40 call for $1.50. ABC finishes at $43. What are premium dollars, expiration intrinsic value, and profit before fees?

<details>
<summary>Answer — open after your attempt</summary>

Premium `$1.50 × 100 = $150`; intrinsic `($43 − $40) × 100 = $300`; profit `$300 − $150 = $150`. At or below $40, the idealized option result would instead lose the full $150 premium.

</details>

## Lesson 19: a put's intrinsic value comes from selling above market

**Time: 5–10 minutes. One idea:** reverse the subtraction for a put.

A put provides a sale right, so subtract stock price from strike. Use zero if that difference is negative. A put with a higher strike than stock price has favorable exercise value. [OIC: put value](https://www.optionseducation.org/optionsoverview/options-pricing).

**Worked example:** ABC is $26 and a put's strike is $30. Selling at $30 rather than $26 gives a `$30 − $26 = $4` difference per share. Intrinsic value is `$4 × 100 = $400`. At stock $33, the $30 sale right has $0 intrinsic value.

**Try it:** ABC finishes at $52 and a standard put's strike is $57. Calculate intrinsic value per share and per contract.

<details>
<summary>Answer — open after your attempt</summary>

`$57 − $52 = $5` per share; `$5 × 100 = $500` per contract. Strike minus stock is the put subtraction. Stock minus strike would reverse the economic meaning.

</details>

## Lesson 20: put profit also subtracts the premium

**Time: 5–10 minutes. One idea:** the price of the put must be recovered before its buyer profits.

At expiration, the put buyer's idealized profit is `intrinsic value in dollars − premium dollars paid`. The stock falling does not guarantee enough put value to cover the purchase cost. The entire option premium can be lost. [OIC: long-put risk and profit](https://www.optionseducation.org/strategies/all-strategies/long-put).

**Worked example:** Buy a $50 put for $3: cost `$3 × 100 = $300`. ABC finishes at $48. Intrinsic value is `($50 − $48) × 100 = $200`. The result is `$200 − $300 = −$100`, despite the put having intrinsic value.

**Try it:** Buy a $35 put for $1.20. ABC finishes at $32. Find premium dollars, intrinsic value, and expiration profit before fees.

<details>
<summary>Answer — open after your attempt</summary>

Premium: `$1.20 × 100 = $120`. Intrinsic: `($35 − $32) × 100 = $300`. Profit: `$300 − $120 = $180`. At or above $35, the idealized option result loses the full $120 premium.

</details>

## Lesson 21: expiration break-even is one specific calculation

**Time: 5–10 minutes. One idea:** expiration break-even does not dictate a profitable early sale.

Before fees, a purchased call breaks even **at expiration** at `strike + premium`; a purchased put at `strike − premium`. Before expiration you may sell the owned option to close. Then compare actual sale proceeds with its purchase cost and fees. A changing market price includes more than intrinsic value. [SEC: options introduction](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63).

**Worked example:** A $50 call bought for $2 has $52 expiration break-even. Suppose ABC is $51 before expiration and you actually sell the call at $2.60. Sale proceeds `$260` minus purchase `$200` give `$60` profit before fees. ABC did not need to reach $52 for this early sale to profit. The $2.60 fill is an assumption, not a promise.

**Try it:** A $40 put costs $1.50. Find its expiration break-even. If you instead close it early at an actual $1.90 sale price, what is the profit before fees?

<details>
<summary>Answer — open after your attempt</summary>

Expiration break-even: `$40 − $1.50 = $38.50`. Early sale profit: `($1.90 − $1.50) × 100 = $40`. The early result uses actual option prices, not the expiration formula.

</details>

## Lesson 22: “in the money” describes the contract, not your profit

**Time: 5–10 minutes. One idea:** moneyness compares stock and strike only.

A call is **in the money** when stock is above strike; a put when stock is below strike. At the strike is **at the money**; the unfavorable side is **out of the money**. These labels do not subtract your premium. [OIC: basic option terms](https://www.optionseducation.org/optionsoverview/options-basics).

**Worked example:** A $20 call bought for $2 finishes with ABC at $21. It is in the money by $1 per share. Its idealized expiration result is `(1 − 2) × 100 = −$100`. “In the money” and “profitable” therefore answer different questions.

**Try it:** A $60 put bought for $4 expires with ABC at $58. Is it in, at, or out of the money? What is the buyer's idealized profit before fees?

<details>
<summary>Answer — open after your attempt</summary>

In the money: stock $58 is below put strike $60. Intrinsic is `$2 × 100 = $200`. Subtract `$4 × 100 = $400` premium for a `$200` loss. Moneyness alone did not establish profit.

</details>

## Lesson 23: an uncovered short call has no finite loss ceiling

**Time: 5–10 minutes. One idea:** premium received does not cap a writer's loss.

An **uncovered short call** means a written call without offsetting shares or another protective position. If assigned, its writer must deliver shares at the strike. A stock has no fixed upper price ceiling, so the call writer's theoretical loss has no finite maximum. This is a risk-recognition exercise. [OIC: uncovered call](https://www.optionseducation.org/strategies/all-strategies/naked-call-uncovered-call-short-call).

**Worked example:** Write one $50 call for $1: receive `$100`. ABC finishes at $60. Its favorable value to the holder is `($60 − $50) × 100 = $1,000`, an obligation for the writer. The writer's idealized result is `$100 − $1,000 = −$900`. At still higher stock prices, losses keep increasing.

**Try it:** An uncovered $70 call is written for $2. ABC finishes at $80. What is idealized expiration profit or loss before fees? Is that the maximum possible loss?

<details>
<summary>Answer — open after your attempt</summary>

Premium `$200`; intrinsic obligation `($80 − $70) × 100 = $1,000`; result `$200 − $1,000 = −$800`. No, $800 is this scenario's loss. The theoretical loss has no finite ceiling as stock price rises.

</details>

## Lesson 24: a short put can require a large share purchase

**Time: 5–10 minutes. One idea:** distinguish premium received from the purchase obligation.

If assigned on a standard stock put, its writer buys 100 shares at the strike. Cash set aside for that purchase does not prevent the stock from losing value. Assuming stock cannot fall below zero, the short put's greatest idealized expiration loss is `strike × 100 − premium dollars received`, before fees. [OIC: cash-secured put](https://www.optionseducation.org/strategies/all-strategies/cash-secured-put).

**Worked example:** Write a $40 put for $1: receive `$100`. If assigned, pay `$40 × 100 = $4,000` and receive 100 shares. If they are worth zero, the modeled loss is `$4,000 − $100 = $3,900`. The premium was $100; the potential loss was much larger.

**Try it:** Write a $25 put for $0.80. State the premium received, assigned share purchase payment, shares received, and greatest idealized expiration loss before fees.

<details>
<summary>Answer — open after your attempt</summary>

Premium: `$0.80 × 100 = $80`. If assigned: pay `$25 × 100 = $2,500`, receive 100 shares. At stock zero, loss is `$2,500 − $80 = $2,420`. Receiving $80 did not reduce the strike payment to $80.

</details>

## Checkpoint 3: separate value, profit, and obligations

Use one standard contract, multiplier 100, no fees or taxes. Values are idealized expiration values unless stated otherwise.

1. Buy a $55 call for $2.20. ABC finishes at $59. Find premium dollars, intrinsic value, and profit.
2. Buy a $70 put for $3. ABC finishes at $68. Find intrinsic value, profit, moneyness, and expiration break-even.
3. A $30 call bought for $1.40 is sold to close **before expiration** at an actual $1.75. Find the early-sale profit and the separate expiration break-even stock price.
4. **Safety:** Write an uncovered $45 call for $1.50. ABC finishes at $52. Find the modeled result and state whether the theoretical loss has a finite ceiling.
5. **Safety:** Write a $38 put for $1.10. State assigned shares and strike cash; calculate greatest idealized expiration loss at stock zero. Does holding enough cash remove that price risk?

<details>
<summary>Checkpoint 3 worked key — open after all five attempts</summary>

1. Premium `$2.20 × 100 = $220`; intrinsic `($59 − $55) × 100 = $400`; profit `$400 − $220 = $180`.
2. Intrinsic `($70 − $68) × 100 = $200`; premium `$300`; profit `−$100`. The put is in the money, yet unprofitable. Expiration break-even `$70 − $3 = $67`.
3. Sale profit `($1.75 − $1.40) × 100 = $35`. Expiration break-even is separately `$30 + $1.40 = $31.40`. It is not a stock-price requirement for that completed early sale.
4. Premium `$150` less intrinsic obligation `($52 − $45) × 100 = $700` gives `−$550`. An uncovered short call has no finite theoretical loss ceiling.
5. If assigned, pay `$38 × 100 = $3,800` and receive 100 shares. Greatest idealized expiration loss is `$3,800 − $110 = $3,690`. Cash can fund the purchase; it does not keep the shares from falling.

</details>

**Pass rule:** all five correct with units and reasoning; both safety items must be explained without prompts. For any miss, correct the error and solve a changed-number version supplied by your tutor before seeing its answer. Advance once all five are correct. These calculations do not establish live-trading readiness.

[Previous: Part 2](02_CONTRACTS.md) · [Course home](../README.md) · [Next: Part 4 — changing option prices](04_PRICES.md)
