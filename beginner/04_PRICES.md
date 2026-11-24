# Module 4 · Why option prices change

[Course home](README.md) · [Previous: profit and loss](03_PROFIT.md) · [Next: operations](05_OPERATIONS.md) · [Full library](../README.md)

**Lessons 25–32.** Take one lesson per study day: about 5–10 minutes to read, work the example, and answer; then 3–5 minutes to recall yesterday's idea. These are fictional standard stock/ETF options with a **100 multiplier**. Fees are **$0 for teaching arithmetic** throughout this module; actual trading includes fees and bid/ask costs. A model estimate is not a tradable price.

Your goal: explain why a correct guess about stock direction can still lose money. You do not need a pricing formula or coding.

## Lesson 25 · Today's sale price and expiration value are different

Before expiration, you may sell an option you own if a buyer is available. Your result then depends on the actual sale price. You do not have to exercise it or wait until its last day. At expiration, the simple payoff calculations from Module 3 use the stock price and strike; before then, remaining time and market conditions also affect the option's price. [SEC's introduction explains selling, exercising, and expiration](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63).

**Worked example:** Buy a $50 call for $2.00: pay $200. A week later, with time remaining, you sell at an actual $2.60 fill: receive $260. Profit is **$60**. You do not need the stock above the $52 *expiration* break-even to sell the option profitably before expiration. The sale price is what matters to this closed trade.

**Try it:** Buy one option for $1.80 and sell it before expiration for $1.45. What is the result? What extra information would you need to value a different option still open?

<details><summary>Check your reasoning</summary>

`(1.45 − 1.80) × 100 = −$35`. For an open option, the current executable bid/ask and contract details matter; its expiration break-even alone cannot tell you today's value.

</details>

**Recall:** Which price determines a closed option trade's sale proceeds?

## Lesson 26 · Extrinsic value is the part beyond immediate exercise value

**Intrinsic value** is the option's immediate exercise value per share: for a call, stock minus strike if positive; for a put, strike minus stock if positive. Otherwise it is zero. **Extrinsic value**, sometimes called time value, is the option premium minus intrinsic value. It reflects the remaining possibilities and other pricing inputs, rather than a separate cash payment. Use coherent, current quotes; stale or wide markets can make this decomposition misleading. [OIC explains intrinsic and time value](https://www.optionseducation.org/optionsoverview/options-pricing).

**Worked example:** Stock is $54. A $50 call trades for $5.20. Intrinsic value is `$54 − $50 = $4`; extrinsic value is `$5.20 − $4 = $1.20`. The contract premium is **$520**, consisting of **$400 intrinsic** and **$120 extrinsic**. These parts are values, not profit: you still compare with what you paid.

**Try it:** Stock is $47. A $50 put has a $4 premium. Find intrinsic and extrinsic value per share and per contract.

<details><summary>Check your reasoning</summary>

Put intrinsic value is `50 − 47 = $3/share`, or $300. Extrinsic is `4 − 3 = $1/share`, or $100. Total premium is $400. A put gains immediate exercise value when stock is below its strike.

</details>

**Recall:** Can an option with zero intrinsic value still have a sale price before expiration? Explain why.

## Lesson 27 · Theta describes one effect of time passing

An option has a deadline. With everything else held fixed, a purchased plain option commonly loses value as time passes. **Theta** is a model estimate of that time effect. Many platforms show it per calendar day, but you must check the platform's units. It is not a fee collected daily, and it does not promise tomorrow's price. Some options and conditions have different signs; learn the convention before using a number. [OIC's theta lesson explains time sensitivity](https://www.optionseducation.org/advancedconcepts/theta).

**Worked example:** A long call is valued at $2.00 and its displayed theta is **−$0.03 per share per day**. Holding the model's other inputs unchanged, the one-day estimate is `$2.00 − $0.03 = $1.97`, or **$3 less per contract**. If the stock rises strongly, the option can gain despite that time effect. Theta also changes; multiplying today's value by 30 is not a reliable month forecast.

**Try it:** A long put's theta is −$0.04/share/day. What is the time-only estimate for one standard contract over one day? Does it determine the full day's profit?

<details><summary>Check your reasoning</summary>

`−0.04 × 100 = −$4`. No. Stock price, implied volatility, rates, dividends, changing sensitivities, and the market's bid/ask can change the result.

</details>

**Recall:** Why is positive theta on a short position not guaranteed daily income?

## Lesson 28 · Realized volatility looks backward; implied volatility comes from price

**Volatility** describes the size and variability of price movement, rather than simply whether price rose or fell. **Realized volatility** summarizes movement already observed over a stated period. **Implied volatility (IV)** is the volatility input that makes a pricing model match an observed option price. IV reflects market pricing under a model, including demand and compensation for risk. It is not a promised future movement. [OIC distinguishes historical and implied volatility](https://www.optionseducation.org/advancedconcepts/volatility-the-greeks).

**Worked example:** A platform reports a stock's past 30-day realized volatility as 18% and one option's IV as 28%, both annualized. You can say **28% is 10 percentage points above 18%**. You cannot conclude the option is overpriced: the next month may include an event that the previous month did not. Different strikes and expirations can have different IVs.

**Try it:** Past realized volatility is 20% and an option's IV is 30%. Is that a 10 percentage-point gap or a 10% proportional increase? Does it establish a profitable selling opportunity?

<details><summary>Check your reasoning</summary>

It is **10 percentage points**. The proportional increase from 20 to 30 is 50%. Neither number proves future profit; the future movement, contract terms, prices, costs, and risks are still unknown.

</details>

**Recall:** Which measure comes from past movement, and which is backed out of an option quote?

## Lesson 29 · Delta estimates a small stock-price effect

**Delta** estimates how much an option's value changes for a $1 stock move, with other model inputs fixed. A long call usually has positive delta; a long put usually has negative delta. A short position reverses the corresponding long option's sign. Delta changes as conditions change. It is not a guaranteed probability of profit. [OIC's delta explanation gives the units and limitations](https://www.optionseducation.org/advancedconcepts/delta).

**Worked example:** One long call has delta +0.40. For a small **$0.50 stock rise**, the delta-only estimate is `0.40 × $0.50 = +$0.20/share`, or **+$20 per contract**. This is a value-change estimate, not final profit; your entry cost, other changing inputs, fees, and actual sale price still matter.

**Try it:** One long put has delta −0.30. For a small $1 stock decline, what is its delta-only value change per share and contract?

<details><summary>Check your reasoning</summary>

`−0.30 × −$1 = +$0.30/share`, or **+$30 per contract**. Both signs are negative in the multiplication, producing a positive estimate. This assumes the delta remains sufficiently stable and other inputs do not change.

</details>

**Recall:** What must you multiply a per-share delta estimate by to get one standard contract's dollar estimate?

## Lesson 30 · Gamma explains why delta changes

Delta is a snapshot. **Gamma** estimates how much delta changes for a $1 stock move, with other inputs fixed. This is why a straight-line delta estimate becomes less reliable over a large move. Long plain calls and puts generally have positive gamma; short positions have the opposite exposure. You only need that idea today. [OIC explains gamma](https://www.optionseducation.org/advancedconcepts/gamma).

**Worked example:** A long call starts with delta +0.50 and gamma +0.04 per $1. After a small $1 stock rise, its new delta might be approximately `0.50 + 0.04 = 0.54`. After a small $1 decline, it might be `0.50 − 0.04 = 0.46`. These are new **delta readings**, not option premiums or profits. Near expiration, certain options can change exposure quickly, especially near the strike.

**Try it:** A call has delta +0.35 and gamma +0.03. Estimate its new delta after a $1 rise. Why should you avoid applying that same arithmetic to a $20 overnight jump as if it were exact?

<details><summary>Check your reasoning</summary>

Approximately **+0.38**. Over a large jump, gamma itself and the other inputs can change substantially; a local approximation cannot promise the new delta or price.

</details>

**Recall:** Does a position's current delta stay fixed until expiration?

## Lesson 31 · Vega and rho measure two other inputs

Two more labels appear on option screens. **Vega** commonly estimates the per-share value change for a **one percentage-point IV change**, such as 25% to 26%. **Rho** commonly estimates the value change for a **one percentage-point interest-rate change**. Check the platform's units. For now, recognize the labels; you need not predict interest rates or memorize every sign. [OIC lists the five Greeks](https://www.optionseducation.org/advancedconcepts/volatility-the-greeks).

**Worked example:** A long call has vega +$0.08/share per IV point. IV rises from 25% to 27%: two points. Its vega-only estimate is `0.08 × 2 × 100 = +$16`. Separately, if rho is +$0.05/share per rate point and the rate rises from 4% to 5%, the rho-only estimate is **+$5 per contract**. Neither estimate includes the other moving inputs. Plain long calls and puts generally benefit from higher IV under otherwise fixed model inputs.

**Try it:** One long option has vega +$0.12/share/IV point. IV falls from 30% to 28%. What is the vega-only dollar effect?

<details><summary>Check your reasoning</summary>

The change is **−2 IV points**. `0.12 × (−2) × 100 = −$24`. Do not multiply by 2% of the premium; the stated unit already tells you the calculation.

</details>

**Recall:** What is the difference between a percentage point and a percentage change?

## Lesson 32 · An earnings event can remove uncertainty and lower option value

An **earnings announcement** is a company's report of financial results. Before it arrives, option prices can include substantial uncertainty about the stock's reaction. After the news, IV may fall sharply, sometimes called **IV crush**. A call can lose money even when the stock rises, because the favorable move may not offset the IV fall, time passage, and trading costs. This is a possible outcome, not an automatic rule around every announcement. [OIC explains how volatility affects option prices](https://www.optionseducation.org/advancedconcepts/vega).

**Worked example:** Buy a call for $4 before an announcement: pay $400. The next day the stock is slightly higher, but the option's actual sale fill is $3.20. The closed trade loses `(3.20 − 4.00) × 100 = −$80`. Without full market and model inputs, you cannot attribute all $80 to IV alone. Direction was one part of the result.

**Try it:** A put costs $3 before news. The stock falls slightly, but the actual option sale price afterward is $2.40. What is the result, and what mistaken belief does it challenge?

<details><summary>Check your reasoning</summary>

`(2.40 − 3.00) × 100 = −$60`. A correct directional guess does not guarantee profit on a purchased option. Check the magnitude and timing of the move, IV, time left, and bid/ask.

</details>

**Recall:** Name two variables besides stock direction that affect an option before expiration.

## Module checkpoint · Answer on paper first

1. Buy a call for $2.20 and sell before expiration for $2.65. Calculate one standard contract's result. Is its expiration break-even needed for that calculation?
2. Stock is $62. A $60 call trades for $3.50. Find intrinsic and extrinsic value per share and contract.
3. A long put has delta −0.40 and the stock falls $0.50. Estimate the delta-only change for one contract. Then explain why it is not a promised sale price.
4. Vega is +$0.10/share/IV point. IV falls from 32% to 29%. Calculate the vega-only contract change. Is IV a guaranteed forecast of future realized movement?
5. A call buyer correctly predicts a small stock rise after earnings. Explain how the call could still lose, and why today's theta cannot simply be multiplied by 30 for an exact monthly loss.

<details><summary>Checkpoint worked key · open after saving your answers</summary>

1. `(2.65 − 2.20) × 100 = +$45`, with $0 teaching fees. No: the completed trade uses actual buy and sell prices.
2. Intrinsic `62 − 60 = $2/share`, **$200/contract**. Extrinsic `3.50 − 2 = $1.50/share`, **$150/contract**. Total is $350; value is not profit.
3. `−0.40 × −0.50 × 100 = +$20`. Other inputs and delta can change; bid/ask and execution determine the sale price.
4. `0.10 × (−3) × 100 = −$30`. No: IV is a model input inferred from current option price, not a promise.
5. IV may fall, time passes, and spread/fees can outweigh a favorable direction. Theta is local and changes with the option's state; it is not a fixed daily bill.

</details>

**Pass and retry:** Answer all five correctly and explain the units aloud. For any miss, record the mistaken idea, repeat that lesson, then solve a changed-number version without the key on your next study day. These are learning checks, not proof of trading readiness. Do one minute of recall on this module after 1, 3, and 7 study days.

[Next: how positions open, close, exercise, and settle](05_OPERATIONS.md)
