# Part 2: what an option contract says

[Previous: money and markets](01_MARKETS.md) · [Course home](../README.md) · [Next: value and profit](03_PROFIT.md)

Take one 5–10 minute lesson at a time. These lessons use fictional ABC **standard U.S. stock options with a 100-share deliverable and premium multiplier 100**, unless a question says information is missing. All examples ignore fees and taxes. Learn the meaning before doing more arithmetic. No orders are part of this section.

## Lesson 09: an option is a contract tied to something else

**Time: 5–10 minutes. One idea:** the option and its underlying are separate things.

The **underlying** is the asset or measure an option refers to. An ABC stock option refers to ABC shares. Owning that option is not the same as owning ABC stock. The option gives a right defined by its contract; later lessons explain that right. [OIC: what is an option?](https://www.optionseducation.org/optionsoverview/what-is-an-option).

**Worked example:** A shop offers you a written right to buy a bicycle next month for a stated price. Holding the paper is different from owning the bicycle. Similarly, an ABC stock option is a contract about ABC shares; it is not already 100 shares sitting in your account. This is an analogy, not a tradable bicycle option.

**Try it:** Nia owns one ABC call option and has not bought any shares or used the option's right. Does this alone mean Nia owns 100 ABC shares?

<details>
<summary>Answer — open after your attempt</summary>

No. Nia owns one option contract. The underlying is ABC stock, but a contract tied to stock and ownership of the stock are different positions.

</details>

## Lesson 10: a call gives its buyer a right to buy

**Time: 5–10 minutes. One idea:** a stock call buyer has a purchase right.

A **call** gives its buyer the right to buy the specified shares at the contract's agreed price, under its terms. That agreed price is the **strike price**. Using the right is called **exercise**. The buyer pays for the right; the option does not promise a profit. [OIC: long call](https://www.optionseducation.org/strategies/all-strategies/long-call).

**Worked example:** One standard ABC $40 call gives its holder the right to buy 100 shares at $40 each. If exercised, the strike payment is `100 × $40 = $4,000` for 100 shares. This payment is separate from what the call itself costs.

**Try it:** What purchase right does one standard ABC $35 call give its buyer? State shares, price per share, and total strike payment if exercised.

<details>
<summary>Answer — open after your attempt</summary>

The right to buy 100 ABC shares at $35 each under the contract terms. Exercise requires `100 × $35 = $3,500` strike cash. That is not the option's purchase premium.

</details>

## Lesson 11: a put gives its buyer a right to sell

**Time: 5–10 minutes. One idea:** a stock put buyer has a sale right.

A **put** gives its buyer the right to sell the specified shares at the strike, under the contract terms. Call means a right to buy; put means a right to sell. You can buy either kind of option. [OIC: long put](https://www.optionseducation.org/strategies/all-strategies/long-put).

**Worked example:** One standard ABC $30 put gives its holder the right to sell 100 shares for $30 each. If a holder with 100 shares exercises, those shares leave and `100 × $30 = $3,000` strike cash arrives. We will study what happens without owned shares in [operations](05_OPERATIONS.md).

**Try it:** A learner owns 100 ABC shares and one standard $25 put. If the put is exercised, what share and strike-cash movements occur, ignoring the premium?

<details>
<summary>Answer — open after your attempt</summary>

The holder delivers 100 ABC shares and receives `100 × $25 = $2,500`. A put is a right to sell shares, even though the holder initially bought the option.

</details>

## Lesson 12: the strike is a contract term

**Time: 5–10 minutes. One idea:** distinguish the strike from the changing stock price.

The **strike** is the price specified for exercise. The **stock price** is the current market price of the underlying. They are different fields. The stock moving does not, by itself, reset your contract's strike. Corporate actions can require contract adjustments; defer those to [operations](05_OPERATIONS.md). [OIC: options basics](https://www.optionseducation.org/optionsoverview/options-basics).

**Worked example:** ABC trades at $48 and a call has strike $50. Tomorrow ABC trades at $53. For the same unadjusted contract, its strike remains $50. The stock moved by `$53 − $48 = $5`; the agreed exercise price did not move by $5.

**Try it:** ABC moves from $60 to $56. An existing unadjusted put has a $58 strike. What is its strike after this ordinary market move?

<details>
<summary>Answer — open after your attempt</summary>

$58. The market price is now $56; the contract still specifies $58. Keep these in separate notebook columns.

</details>

## Lesson 13: the right has an expiration

**Time: 5–10 minutes. One idea:** an option does not last indefinitely.

The **expiration** is when the contract ends under its rules. Two options on ABC with the same strike can have different expirations. An expired option does not wait for your prediction to become right. Exact last trading times and exercise cutoffs belong on the operations checklist; the date alone is not the full procedure. [OIC: what is an option?](https://www.optionseducation.org/optionsoverview/what-is-an-option).

**Worked example:** In a made-up calendar, one $50 ABC call expires Friday A and another expires Friday B, a week later. ABC rises the Monday after Friday A. That later rise cannot bring the expired Friday A contract back to life.

**Try it:** You predict a rise within two months but study an option that expires after one week. If the stock rises only in the second month, does that revive the expired option?

<details>
<summary>Answer — open after your attempt</summary>

No. A correct eventual direction does not extend an expired contract. The timing of the move matters because the option has an ending date.

</details>

## Lesson 14: the premium quote is not the contract's dollar cost

**Time: 5–10 minutes. One idea:** use the premium multiplier to convert a quote into dollars.

The **premium** is the option's price. For our standard contracts it is quoted per share, with a multiplier of 100. One contract's premium dollars equal `quoted premium × multiplier`. Check the actual multiplier for a real contract; the number 100 is an assumption in these examples. [SEC: stock-options introduction](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63).

**Worked example:** One call is bought for $1.20 quoted premium. With multiplier 100, payment is `$1.20 × 100 = $120`, before fees. That $120 buys the option right. It does not pay the separate strike cash required if shares are purchased through exercise.

**Try it:** A standard put has a $0.85 premium quote and multiplier 100. What do two contracts cost before fees?

<details>
<summary>Answer — open after your attempt</summary>

One costs `$0.85 × 100 = $85`; two cost `2 × $85 = $170`. A quote below $1 can still represent tens of dollars per contract.

</details>

## Lesson 15: identify the exact contract

**Time: 5–10 minutes. One idea:** similar-looking option names can describe different contracts.

Record underlying, call or put, strike, and expiration. Also check the **premium multiplier** and **deliverable**—what exercise transfers—as separate fields. An adjustment can change the deliverable while leaving the premium multiplier unchanged. Do not guess about an unfamiliar contract. [OIC: contract adjustments after splits](https://www.optionseducation.org/news/splits-happen).

**Worked example:** “ABC call, $50 strike, Friday A expiration” and “ABC call, $50 strike, Friday B expiration” are different contracts because the expirations differ. If a display says only “ABC $50,” the option type, expiration, multiplier, and deliverable remain unknown; there is no complete dollar calculation to trust yet.

**Try it:** A screen shows “ABC Friday A $45 put, premium $1.10” but hides the multiplier and deliverable. Can you confidently calculate the contract's premium dollars and exercise share quantity? What is missing?

<details>
<summary>Answer — open after your attempt</summary>

No. The premium multiplier is needed to convert the quote into dollars, and the deliverable is needed to know what exercise transfers. Check the exact series' contract specification and any applicable OCC adjustment memo.

</details>

## Lesson 16: selling an owned option differs from writing a new one

**Time: 5–10 minutes. One idea:** track whether an action opens or closes a position.

**Long** means you own the option. **Short** means you have written it and carry its obligation. Buying to open creates a long option; selling to close removes an owned option. Selling to open creates a short option; buying to close removes it. Selling does not always mean opening a new obligation. These words describe the option position, not simply a bullish or bearish view. [FINRA: opening long and short options positions](https://www.finra.org/investors/insights/trading-options-understanding-assignment).

**Worked example:** You own 1 ABC call. Sell **that same contract** to close, and your quantity goes `+1 − 1 = 0`. Start at zero and sell 1 to open instead, and your quantity becomes `−1`: a short call with obligations.

**Try it:** You own 2 ABC puts and sell both identical puts to close. What option quantity remains? Did this action itself create a short put position?

<details>
<summary>Answer — open after your attempt</summary>

`+2 − 2 = 0`; no puts remain. This closing sale did not create a short put position. Selling additional contracts beyond the owned quantity would be a different situation.

</details>

## Checkpoint 2: read the contract carefully

Use standard 100-share stock options with multiplier 100, ignoring fees, except when fields are explicitly missing.

1. **Safety:** What right does one $32 call give its buyer, and what strike payment does exercise require?
2. **Safety:** A holder owns 100 shares and exercises one $28 put. State the share and strike-cash flows.
3. **Safety:** You buy 3 options quoted at $0.70 each with multiplier 100. What premium dollars are paid? Is that also the strike payment for shares?
4. A Friday A $40 call and Friday B $40 call have the same underlying. Are they identical contracts? Why?
5. **Safety:** You own 1 call and sell the same call to close. What remains? If a different chain hides its multiplier and adjusted deliverable, may you assume they are both 100?

<details>
<summary>Checkpoint 2 worked key — open after all five attempts</summary>

1. Right to buy 100 shares at $32 each under the terms; strike payment `100 × $32 = $3,200`.
2. Deliver 100 shares and receive `100 × $28 = $2,800`. Premium was a separate earlier cash flow.
3. `3 × $0.70 × 100 = $210`. This pays for the options. Any exercise share purchase uses separate strike cash.
4. No. Different expirations mean different contracts, even if the underlying and strike match.
5. Quantity becomes `+1 − 1 = 0`. No option remains from that position. No, hidden contract terms must be verified; adjusted contracts can have different deliverables.

</details>

**Pass rule:** all five correct, with every safety answer and unit explained without notes. On a miss, correct the reasoning, then have a tutor change the numbers or contract identity and attempt that fresh version before seeing its key. Proceed once all are correct. This is an educational checkpoint.

[Previous: Part 1](01_MARKETS.md) · [Course home](../README.md) · [Next: Part 3 — value and profit](03_PROFIT.md)
