# Teaching volume 2: how options behave before expiration

This volume teaches Sprints 7–12 of [COURSE.md](COURSE.md), weeks 25–48. It assumes you can already draw long and short call and put payoffs, explain assignment, and calculate a contract's dollar size. If any of those are shaky, return to the foundation volume before continuing.

**How to use every four-week module:** Each week, spend 2 hours on the explanation and linked primary lesson, 3 hours working the calculations and exercises, 2 hours observing dated option quotes without placing an order, 2 hours on the week's written artifact and error log, and 1 hour recalling definitions from memory. A module's table tells you what to do with those hours. Use a 100-share multiplier in fictional examples unless a different one is stated. Numbers called “model estimates” are *not* promised market prices or fills. Write your answers before reading each answer key. The worked questions below are teaching checks; use the separate [hedge ledger](DYNAMIC_HEDGING_LAB.md), [order replay](EXECUTION_PRACTICE.md), and [operational casebook](OPERATIONAL_CASEBOOK.md) for fuller, changed-input assessments.

## Module 7 (weeks 25–28): The Greeks are a map of sensitivity

### Lesson

An expiration payoff chart answers, “What is this option worth at expiration if the stock ends at a particular price?” Before expiration, another question matters: “How might the option's *market value* change if one input moves now?” A stock option's quoted premium depends on the stock price, strike, time left, expected volatility, rates, expected dividends, and trading demand. The **Greeks** are model-based measurements of how theoretical option value responds to *small* changes in some of those inputs. They are local approximations, much as a car's current speed estimates where it will be one second later but cannot predict every turn over an hour. [OIC explicitly cautions that Greeks do not guarantee exact price changes](https://www.optionseducation.org/advancedconcepts/understanding-options-greeks).

**Delta** measures the approximate premium change for a $1 move in the underlying, holding the other inputs fixed. A long call with delta +0.55 is modeled to gain about $0.55 *per share* if the stock rises $1, or about $55 for a standard 100-share contract. A long put usually has negative delta: it tends to gain value when the stock falls. The signs reverse when you sell an option because your position is the negative of the long holder's position. Delta is neither a fixed stock-equivalent share count nor a guaranteed probability of expiring in the money. It changes as price, time, and volatility change. [OIC's delta lesson](https://prd-web.optionseducation.org/advancedconcepts/delta) provides examples.

**Gamma** measures the approximate change in delta for a $1 underlying move. If a call has delta +0.55 and gamma +0.04, a $1 rise might move delta toward +0.59; a $1 fall might move it toward +0.51, all else equal. A long, plain call or put usually has positive gamma, and a short option has negative position gamma. This is why an option's response is curved rather than a straight-line copy of stock. A common small-move correction to delta's estimate is `½ × gamma × (stock move)²`. This works only locally, with the model's inputs held sufficiently stable.

**Theta** estimates how theoretical value changes as time passes, often quoted per calendar day; conventions vary by platform, so check the label. A long option commonly has negative theta because it loses time value as expiration approaches, but that statement alone does not tell you its actual next-day P&L. A favorable stock move or volatility change can dominate a day's time decay. **Vega** estimates the change in option value when **implied volatility** (IV) changes by one *percentage point*: from 25% to 26% is one point, not a 1% proportional change. A long plain option usually has positive vega; short options usually have negative position vega. **Rho** estimates the effect of a one-percentage-point interest-rate change; near-term stock options often show less rho sensitivity than stock-price or volatility sensitivity, but it should not be silently assumed to be zero. [OIC describes the five common Greeks and their units](https://prd-web.optionseducation.org/advancedconcepts/volatility-the-greeks).

Here is a **fictional local model example**. A call's theoretical premium is $4.00 per share. Its current Greek readings are delta +0.55, gamma +0.04 per $1, theta −$0.05 per day, and vega +$0.12 per IV percentage point. Suppose the stock rises $1, IV rises from 25% to 26%, and one day passes; assume rates and dividends stay fixed. A rough model change is `0.55 × 1 + ½ × 0.04 × 1² + 0.12 × 1 − 0.05 × 1 = $0.64`. The modeled premium is about $4.64, or about $64 more per standard contract. This is **not** a forecast of the trade's realized profit: the original $4 may have been a midpoint, bid/ask can move, Greeks themselves change, and the stock and IV do not usually move independently.

For every Greek, first ask: “Per share or per contract? Per $1, per day, or per percentage point? Long position or short position? Which model and timestamp?” Misreading one unit can turn a sensible estimate into a 100-fold error.

**Common mistakes:** Treating delta as a guaranteed probability, treating theta as promised daily income, and multiplying a per-share Greek by 100 twice.

### Four-week teaching plan

| Week | Use the 2h lesson / 3h practice / 2h observation / 2h artifact / 1h recall allocation for… |
| --- | --- |
| 25 | Delta. Copy five dated call and put quotes, their delta, stock price, and multiplier; estimate a small $1 stock move and explain the sign. |
| 26 | Gamma. Draw how delta can change after a $1 move; compare a delta-only estimate with a delta-plus-gamma estimate in ten fictional cases. |
| 27 | Theta, vega, and rho. Change one model input at a time with [OIC's delayed calculator](https://www.optionseducation.org/options-quotes-calculators), recording the original and changed assumptions. |
| 28 | Combine the Greeks. Build a one-page “units and assumptions” reference, solve the exercises below, and explain aloud where the approximation fails. |

### Try it before the answers

1. One long call has delta +0.40. With a 100-share multiplier, what is the *delta-only* estimate for a $0.50 stock rise? Why is it not an actual profit figure?
2. A long put has delta −0.35. Estimate its premium change if the stock falls $2, with all other inputs fixed.
3. A long call has delta +0.50 and gamma +0.06. Estimate its new delta after a $1 stock rise. What would you expect after a $1 fall?
4. An option has vega +$0.08 per IV point. IV rises from 20% to 22%. What is the vega-only theoretical change per share and per 100-share contract?
5. Use the fictional $4 call above. Recalculate the local estimate if the stock is unchanged, IV falls one point, and a day passes.

<details><summary>Worked answers — Module 7</summary>

1. `0.40 × $0.50 × 100 = $20` of modeled *option-value* increase. The paid premium, quote spread, fees, and other changed inputs determine actual P&L.
2. `−0.35 × −$2 = +$0.70` per share, or about $70 for one standard contract. This is local; delta can change over a $2 move.
3. After a rise, about `0.50 + 0.06 = 0.56`; after a fall, about `0.50 − 0.06 = 0.44`, under the simplified one-input model.
4. Two IV points × $0.08 = **+$0.16 per share**, or about **+$16 per contract**. Do not multiply by 2% of the premium; vega's stated unit is dollars per IV point.
5. Vega contributes −$0.12 and theta contributes −$0.05; delta and gamma contribute zero. The theoretical change is about **−$0.17 per share**, so the model premium is about **$3.83**. A real quote may differ.

</details>

**Pass gate:** In fresh examples, label every Greek's sign and unit, calculate dollar exposure with the multiplier, and state at least three reasons a Greek estimate can differ from an observed fill or mark.

## Module 8 (weeks 29–32): Volatility measures movement, not direction

### Lesson

When someone says a stock is “volatile,” they usually mean its price moves around a lot. That does not say whether it will rise or fall. For options, separate two different questions. **Realized** or **historical volatility** summarizes price movement that already occurred over a chosen window. **Implied volatility** is a model input reverse-engineered from today's option price: choose the volatility that makes the model price match the observed option premium. It reflects the option market's pricing of future uncertainty under a model, including risk compensation and demand; it is not a guaranteed forecast of actual future movement. OIC distinguishes historical and implied volatility and notes that past movement need not repeat ([OIC volatility and Greeks](https://www.optionseducation.org/advancedconcepts/volatility-the-greeks), [OIC vega](https://www.optionseducation.org/advancedconcepts/vega)).

To calculate a simple realized-volatility measure, take a sequence of daily percentage returns, compute their standard deviation, and often multiply by `√252` to express a daily value on a trading-year scale. That multiplication is a *convention* under simplifying assumptions, not a claim that each future day is independent or normally distributed. For a tiny illustration, imagine four daily returns of +1%, −1%, +1%, −1%. Their average is 0%; treating these four as the entire example population, their standard deviation is 1%. Annualizing gives `1% × √252 ≈ 15.9%`. A four-day estimate is far too fragile to trade from. A different lookback, return definition, adjustment, or sampling convention changes the result.

Implied volatility must always be compared like with like. A 30-day at-the-money (ATM) option and a six-month far-out-of-the-money (OTM) option do not answer the same question. **Moneyness** describes strike relative to the underlying. A **term structure** shows implied volatility across expirations for similar moneyness. **Skew** shows implied volatility across strikes for the same expiration. An earnings announcement inside one expiration can lift its IV relative to a nearby expiration without proving it is “overpriced.” The event may truly have a wide range of outcomes. An option can lose value after IV falls even if the stock moves in the direction the buyer hoped; the stock move, IV move, time, and bid/ask all matter.

Two common context measures are **IV rank** and **IV percentile**. If 52-week IV minimum is 15%, maximum 35%, and current IV is 25%, rank is `(25 − 15)/(35 − 15) = 50%`. Percentile asks how many days in the lookback had lower IV than today. If 180 of 252 observations were below 25%, percentile is `180/252 ≈ 71.4%`. Rank is 50% while percentile is about 71% because one uses range endpoints and the other uses the whole distribution. OIC gives these definitions ([OIC IV rank and percentile](https://prd-web.optionseducation.org/news/april-webinar-key-takeaways-understanding-volatility-and-options-skew)). Neither says whether IV is above *future* realized volatility or whether buying or selling the option has positive expected return after costs.

Do not use “high IV” as a trade plan. Ask *high compared with what, for which strike and expiration, around which event, and with what loss if the event exceeds the price embedded in options?* Record both the model's story and the uncertainty it leaves out.

**Common mistakes:** Calling IV rank a forecast, comparing different strikes or expirations as if they were identical contracts, and treating past realized volatility as the next period's outcome.

### Four-week teaching plan

| Week | Work for the 10-hour allocation described at the start |
| --- | --- |
| 29 | Learn returns and standard deviation; calculate a small return series by hand and with a calculator. Note the lookback and price-adjustment choices. |
| 30 | Read IV from two dated option chains. Compare the same underlying's similar-moneyness options at two expirations; list events between those dates. |
| 31 | Compare strikes within one expiration and draw a basic skew chart. Label it as observed prices/model IV, not a forecast distribution. |
| 32 | Calculate IV rank and percentile from a sample history. Write a two-page memo on why neither proves an option is “cheap” or “expensive.” |

### Try it before the answers

1. A stock rose 8% last month. Does that fact determine next month's direction or volatility? Explain.
2. In the four-return example above, compute the population-style daily standard deviation and annualized figure using `√252 ≈ 15.87`.
3. IV has a 52-week low of 12%, high of 42%, and current value 27%. Compute IV rank.
4. Current IV is above 150 of 250 historical observations. Compute IV percentile. Is it the same as rank in question 3?
5. A one-month call has IV 35% before earnings and 25% afterward. The stock rises. Must a long call gain value? Name at least two other things to check.

<details><summary>Worked answers — Module 8</summary>

1. No. A past return is an observed outcome. It neither fixes the sign nor the size of future price changes; one month is also a small sample.
2. Mean return is 0. Squared returns average to `(1²+1²+1²+1²)/4 = 1` in percent-squared units, so daily standard deviation is **1%**. Annualized illustration is `1% × 15.87 = 15.87%`. This uses a four-observation population convention, not a statistically reliable estimate.
3. `(27 − 12)/(42 − 12) = 15/30 = **50%**`.
4. `150/250 = **60%**`. It need not equal rank, which uses only the historical minimum and maximum.
5. No. Check how far the stock rose relative to the strike and premium, the IV decline's vega effect, remaining time/theta, and executable bid/ask prices. A favorable direction alone does not guarantee a gain.

</details>

**Pass gate:** Explain realized versus implied volatility without calling either a promise, calculate rank and percentile correctly, and produce a dated strike/expiration comparison with its event calendar and limitations.

## Module 9 (weeks 33–36): Add exposures across legs; understand calendars

### Lesson

In a multi-leg position, you own some options and owe on others. The position's *model sensitivities* are the signed sum of its legs' sensitivities. This follows ordinary arithmetic: a long option's value rising helps you, while the same rise hurts if you are short it. The position's actual P&L still depends on executable prices, changing Greeks, exercise, assignment, and what happens if a leg disappears. OIC emphasizes **net** rather than short-leg-only exposure for spreads ([OIC Greek exposure FAQ](https://www.optionseducation.org/news/may-office-hours-faqs)).

Suppose you buy one call whose current per-share delta is +0.55, gamma +0.04, vega +$0.12 per IV point, and theta −$0.04/day. You also sell one different call whose *long-contract* model readings are delta +0.25, gamma +0.02, vega +$0.06, and theta −$0.03. Because the second call is short in your account, multiply its readings by −1. The combined position has delta `0.55 − 0.25 = +0.30`, gamma `0.04 − 0.02 = +0.02`, vega `0.12 − 0.06 = +$0.06/IV point`, and theta `−0.04 − (−0.03) = −$0.01/day`. With 100-share multipliers, its delta-only modeled value change for a $1 stock rise is about +$30. Do not multiply one leg by 100 and forget the other. If quantities or deliverables differ, convert all legs to the same dollar basis before adding them.

Net Greeks help answer *which small change hurts*, but they do not specify the worst loss. Consider a position with almost zero net delta. A large move can make its gamma change delta rapidly; a jump can leap over every small-step approximation. Nor does “positive theta” mean daily profit is due. A short option's time decay may be outweighed by a sudden price or IV move.

Work the [discrete hedge and P&L lab](DYNAMIC_HEDGING_LAB.md) after this net-Greek calculation. It follows a call, stock hedge, cash, rebalance, and executable close through changing prices, then reconciles the difference between a local Greek estimate and the option's observed mark. Keep it as a shadow calculation; the stock short is not part of the beginner live policy.

A **calendar spread** uses options with different expirations, often at the same strike. Consider a fictional long calendar: buy a 60-day $100 call for $5 and sell a 30-day $100 call for $3, both standard contracts. Your initial debit is `$5 − $3 = $2 per share`, or $200. At the front option's expiration, if the stock is exactly $100, the short call might expire without intrinsic value. The back call still has **30 days left** and must be valued then. If its *actual tradable sale price* at that moment were $2.50, closing it would yield `$250 − $200 = $50` before fees. If it were worth $1.50, the same stock price would produce a $50 loss. There is no single expiration payoff formula from stock price alone while the back leg still has time value. Different IV, time, and spreads change its price. Do not read either hypothetical $2.50 or $1.50 as a prediction.

For physically settled American-style calls, the short front call can be assigned early. You may then have a stock delivery obligation while still holding the later call. The later call does **not** automatically exercise to settle the stock position. [FINRA explains one-leg assignment in multi-leg options](https://www.finra.org/investors/insights/trading-options-understanding-assignment). Every scenario worksheet should include stock and cash requirements, not only an idealized line on a payoff chart.

**Common mistakes:** Forgetting the minus sign on short legs, reading near-zero net delta as low risk, and drawing a calendar's value as if both legs expired together.

### Four-week teaching plan

| Week | Work for the 10-hour allocation described at the start |
| --- | --- |
| 33 | Make a signed-position table for ten two-leg examples; calculate position delta, gamma, theta, and vega after quantities and multipliers. |
| 34 | Draw five price/IV/time scenario matrices. Complete the [hedge ledger](DYNAMIC_HEDGING_LAB.md), including its fresh checks and model-residual explanation. |
| 35 | Work through the calendar example at several possible back-leg market prices; record the assumptions required for each result. |
| 36 | Rehearse short-leg assignment and expiration with the [FINRA case study](https://www.finra.org/investors/insights/trading-options-understanding-assignment) and [operational casebook](OPERATIONAL_CASEBOOK.md). Produce the module's scenario worksheet. |

### Try it before the answers

1. You own two calls with per-share delta +0.40 each and are short one put whose *long-option* delta is −0.30. What is net position delta in standard-share equivalents?
2. A long call's vega is +$0.10 per point; a short call's corresponding long-option vega is +$0.07. What is net position vega for one of each? What is the rough model change for a two-point IV fall?
3. In the calendar example, the far call sells for $1.50 when the front call expires worthless. What is the calendar's total P&L before fees?
4. Why is “both calls have a $100 strike, so the calendar is worth zero when the stock is $100” wrong?
5. A short stock call is assigned while a later long call remains. Does the long call automatically deliver the shares? What obligation must you identify immediately?

<details><summary>Worked answers — Module 9</summary>

1. Long calls contribute `2 × +0.40 = +0.80`. The short put contributes `−1 × (−0.30) = +0.30`. Total is **+1.10 share-price delta per share of contract quote**, or roughly **+110 stock-share equivalents** with standard 100-share contracts. This is local, not a fixed hedge.
2. Net vega is `+$0.10 − $0.07 = +$0.03 per share per IV point`, or $3 per standard contract pair per point. A two-point fall suggests `−$0.06 per share`, about **−$6** for the position, with all else fixed.
3. Initial debit is $200; sale proceeds are $150. P&L is **−$50** before fees.
4. The near call may be expiring, but the far call still has time and can retain market value. Its sale price depends on IV and other inputs as well as stock price.
5. No. Identify the resulting short-stock delivery obligation, number of shares, funding/margin, and broker deadline. Contact the broker if procedures are unclear; the long call is a separate position.

</details>

**Pass gate:** Correctly sign and scale each leg, reconcile its net Greeks and the hedge lab's cash/option/stock ledger, price a calendar only with an explicit far-leg value assumption, and solve an assignment scenario without assuming the long leg acts automatically.

## Module 10 (weeks 37–40): Turn a market opinion into a testable decision

### Lesson

“I think this stock will rise” is a beginning, not a trade plan. An option needs the move to happen by a certain time and often by enough to cover its premium, spread, and fees. You must also decide whether you expect **implied volatility** to rise or fall, whether an event can cause a gap, and what you will do when the facts change. A **thesis** is a written, falsifiable statement of what you expect and why. A **position** is one possible expression of that thesis. A good question is “What is the simplest position, including holding cash, that expresses this view at a risk I can afford?”

Return to the basic expiration equation from the first volume. A $100-strike call bought for $4 needs the stock above $104 at expiration to show a profit before fees. If the stock rises from $100 to $102, the buyer was right about *direction* but still loses $2 per share of premium at expiration. If the stock reaches $105, profit is only `$105 − $100 − $4 = $1 per share`. Buying 100 shares at $100 would gain $5 per share at $105, but it requires much more capital and has different downside, dividends, and time exposure. Neither is automatically “better.” They are different exposures and must be compared at a common cash and risk budget. [The SEC's stock-option examples show how an underlying move can still leave an option buyer with a loss](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63).

Expected value asks what the average payoff would be *if your probability estimates were correct*. Consider a made-up one-month scenario with stock starting at $100 and finishing at $110 with 25% probability, $100 with 50%, or $90 with 25%. A long $100 call costing $4 finishes with profits of +$6, −$4, and −$4 per share. Its hypothetical expected profit is `0.25×6 + 0.50×(−4) + 0.25×(−4) = −$1.50 per share`, before costs. Owning stock at $100 has hypothetical outcomes +$10, $0, and −$10 per share, with expected change $0. The call looks exciting in the up state, yet loses on average under these *invented* probabilities. This is a lesson in arithmetic, not a claim that either market price is mispriced. Your probabilities may be wrong; the three states omit many outcomes, early exits, volatility changes, and transaction costs. Expected value alone also hides painful drawdowns and funding needs.

Build every hypothetical **trade ticket** in this order: (1) observable thesis and horizon; (2) exact underlying and option contract terms; (3) entry and exit rules that someone else could follow; (4) what would disprove the thesis; (5) payoff across several outcomes, including a gap; (6) bid/ask and total costs; (7) maximum modeled loss and any exercise/assignment obligations; (8) stock, a different option structure, and **no trade** as alternatives. Write the ticket *before* seeing what happened. If you change a rule after an unfavorable outcome, record that as a new version rather than rewriting history.

“No trade” is a real decision. You may lack data, find the spread too wide, see an event you cannot price, or conclude one contract breaches your risk limit. Do not invent a position just because the course asks for examples. In this module you will write ten hypothetical tickets and ten documented abstentions. Your pass standard is clear reasoning, not profitable paper P&L.

**Common mistakes:** Assuming a correct direction guarantees option profit, treating guessed probabilities as facts, and changing entry or exit rules after seeing the outcome.

### Four-week teaching plan

| Week | Work for the 10-hour allocation described at the start |
| --- | --- |
| 37 | Rewrite five vague market statements as falsifiable theses with dates, observations, and a condition that would reject each. |
| 38 | For five fictional long-option tickets, calculate expiration break-even and a three-state payoff table; compare with stock or cash. |
| 39 | Draft ten hypothetical tickets using the eight-item sequence above. Check product terms and event dates, without submitting orders. |
| 40 | Write ten no-trade decisions. Review tickets from Week 39 and mark which facts were known at decision time versus learned afterward. |

### Try it before the answers

1. A stock is at $100. One $100 call costs $4. At expiration the stock is $102. What is one contract's profit before fees?
2. For the same call, calculate expiration break-even and profit if the stock is $110.
3. Compute the expected per-share payoff for the made-up $110/$100/$90 scenario with probabilities 25%/50%/25%.
4. Give two reasons the stock-versus-call expected values in that scenario are not a complete choice rule.
5. Rewrite “I like this company, so I will buy calls” as a falsifiable *research question*, naming an observation, time horizon, and potential rejection condition.

<details><summary>Worked answers — Module 10</summary>

1. Intrinsic value is $2 per share; after the $4 premium the result is **−$2 per share**, or **−$200** for a standard contract.
2. Break-even is **$104**. At $110, intrinsic value is $10, so net profit is `$10 − $4 = $6 per share`, or **$600 per contract**, before fees.
3. Payoffs are +$6, −$4, −$4. `0.25×6 + 0.50×(−4) + 0.25×(−4) = 1.5 − 2 − 1 = **−$1.50 per share**`.
4. The probabilities are guesses and omit other stock outcomes; positions have different capital, loss limits, liquidity, dividends, and path behavior. Any two of these, explained, suffice.
5. Example: “For stocks meeting prespecified criteria on the day before an earnings release, does a defined one-month call rule earn positive *net* returns over the next month versus holding the underlying at equal cash risk? Reject if the untouched test is negative or the result disappears under adverse fills.” This is a research question, **not** a suggestion to place such a trade; the full protocol comes in the research lab.

</details>

**Pass gate:** Produce ten complete hypothetical tickets and ten justified passes. Every ticket names an expiration, break-even or payoff cases, cost assumption, assignment/settlement rule, invalidation condition, and simpler alternative.

## Module 11 (weeks 41–44): A good idea can be lost in execution

### Lesson

The **bid** is the displayed price at which someone is currently willing to buy; the **ask** or **offer** is the displayed price at which someone is currently willing to sell. The **bid/ask spread** is ask minus bid. The midpoint is halfway between them, but a midpoint is just arithmetic. A displayed option chain often shows a last trade too; that trade may have happened earlier under different stock and volatility conditions. [Cboe describes liquidity through the ease of entry and exit and the width of bid/ask quotes](https://optionsfacts.cboe.com/). OIC's [FAQ](https://www.optionseducation.org/referencelibrary/faq/basics) notes that an option's last trade may be hours or even days old. A dated quote with bid, ask, and size is usually a better starting observation than “last.”

The **national best bid and offer** (NBBO) gathers the best displayed bid and ask from eligible U.S. option markets at that moment. It is not a promise that you can trade any quantity at those prices forever. Quote sizes, prices, exchange participation, and the underlying move. For a buy, a **limit order** sets the highest price you are willing to pay; for a sell, it sets the lowest price you will accept. The limit controls your worst stated *price if executed*, but the order may not fill. A marketable order can fill quickly yet pay the spread and possibly more if displayed size is small or quotes move. Learn the precise order behavior of the platform before relying on it.

Suppose a standard option shows `$2.10 bid / $2.30 ask`, with enough displayed size for the illustration. Buying one at $2.30 costs $230. Immediately selling at $2.10 brings back $210: **−$20 before any underlying move or fees**. For ten contracts, the same simple quote-side round trip is −$200 before fees, assuming the quote sizes actually support ten contracts. If fictional fees are $0.65 per contract on each side, ten round trips add `$0.65 × 10 × 2 = $13`, for a total −$213. A limit buy at $2.20 might fill at or below $2.20, but it might never fill. A backtest that credits every hypothetical midpoint order as a trade creates a winner that may not have existed in the market.

Execution becomes harder with a **multi-leg order**. A two-leg spread can be sent as a package at a net limit where the broker supports it, or individual legs might be executed separately. If you execute one leg and the other does not fill, you have **leg risk**: an unintended position, perhaps with much larger exposure. Even an intact package can be hard to close if one leg's market becomes thin. A theoretical payoff chart assumes a position exists at the specified prices; it does not guarantee a way in or out. Read [FINRA's assignment discussion](https://www.finra.org/investors/insights/trading-options-understanding-assignment) for why closing the entire short exposure matters.

Execution study means timestamping what you *could see* and what a proposed order might plausibly have done. Record underlying price, exact option symbols, bid, ask, size if available, quote age, fees, order limit, and whether the order actually filled. A 20-minute-delayed educational quote from [OIC's tools](https://www.optionseducation.org/options-quotes-calculators) is fine for learning mechanics but not evidence of a live executable price. For research, model nonfills and adverse prices and preserve rejected opportunities; otherwise you select only situations that looked good in hindsight.

The [synthetic execution replay](EXECUTION_PRACTICE.md) adds broker order reports to changing quotes. Reconcile its confirmed fills, nonfills, partial fills, pending cancellation, and platform-outage drill before interpreting paper-trading results. For a spread whose leg status is uncertain, use the [account casebook](OPERATIONAL_CASEBOOK.md) to find the actual exposure.

**Common mistakes:** Assuming midpoint execution, using the last trade as a current quote, and counting only hypothetical limit orders that would have filled.

### Four-week teaching plan

| Week | Work for the 10-hour allocation described at the start |
| --- | --- |
| 41 | Collect ten dated single-option quote observations; compute spread in dollars and as a percentage of midpoint, and note stale last trades. |
| 42 | Draft ten hypothetical buy and sell limits; for each, state the permitted fill price and what happens if it never fills. |
| 43 | Build five hypothetical two-leg orders and calculate net debit or credit from quote sides and from midpoint. Identify the gap between them. |
| 44 | Complete 30 total quote observations and the [execution replay](EXECUTION_PRACTICE.md). Summarize typical, widest, and event-day spreads and write rules for when an order is rejected. |

### Try it before the answers

1. A bid is $1.40 and ask $1.70. What is the spread and midpoint per share and per standard contract?
2. You buy five contracts at the $1.70 ask and immediately sell at the $1.40 bid. What is the quote-side result before fees?
3. A buy limit is $1.55 while the best displayed ask is $1.70. Can you assume the order fills immediately? What price ceiling applies *if* it fills?
4. Why might a last trade of $1.50 be a poor current entry estimate when the displayed market is $1.40/$1.70?
5. One leg of a planned two-leg spread fills and the other does not. What are the first three things to recheck before any further action?

<details><summary>Worked answers — Module 11</summary>

1. Spread is `$1.70 − $1.40 = **$0.30/share**`, or $30 per contract. Midpoint is `($1.40 + $1.70)/2 = **$1.55/share**`, or $155 per contract. The midpoint is not an offered fill.
2. `($1.40 − $1.70) × 100 × 5 = **−$150**` before fees.
3. No. $1.55 is below the displayed ask, so nonfill is possible. If the buy limit fills under ordinary limit-order operation, it should not execute above **$1.55**; verify platform and order status rather than assuming an outcome.
4. The last trade may have occurred when the stock, IV, and quotes were different; it says what traded earlier, not what is now offered to you.
5. Confirm the *actual* filled position and size, its immediate directional/Greek and assignment exposure, and the current bid/ask plus available funds or buying power. Then follow the written contingency process; this exercise is not a live order instruction.

</details>

**Pass gate:** Reconcile 30 quote records and all seven execution-replay answers, correctly calculate per-contract cost, identify stale last prices and nonfills, and explain the added risk of a partial multi-leg fill. A pending cancellation or missing acknowledgement never counts as a confirmed zero position.

## Module 12 (weeks 45–48): Paper trading is a laboratory, not a track record

### Lesson

A **paper trade** is a simulated order with no real financial settlement. It lets you rehearse contract selection, order entry, operational checks, and recordkeeping. It does **not** prove that a strategy will fill or earn money with live capital. [IBKR's own paper-account guide](https://www.ibkrguides.com/orgportal/aboutpapertradingaccount.htm) says fills are simulated from the top of the book, deep-book access is absent, combo trading is limited, and some order types differ from production behavior. If you do not have a paper platform, a dated **shadow ledger** of hypothetical decisions can still teach the process; label every fill assumption honestly.

The most important paper-trading habit happens *before* the hypothetical order: write down what you knew at that time. Save the date and time zone, underlying and exact option series, current bid/ask and size, thesis, event calendar, intended limit, maximum modeled loss, and the condition for exit. Then record whether the order filled, partly filled, or did not fill. Do not backfill an order because the market later moved favorably. Include **no-trade decisions**, especially when the option spread is wide, the contract is unclear, or the rule does not produce a signal. Without rejected and unfilled opportunities, your journal will flatter your decision process.

Separate **gross P&L** from **net P&L**. Gross is sale proceeds minus purchase cost for a long option, or initial credit minus repurchase cost for a short option, before fees. Net subtracts broker/exchange fees, financing when relevant, and any other actual costs. An example using fictional fills: Paper trade A buys one call at $2.30 and later sells at $2.60, producing `($2.60 − $2.30) × 100 = +$30` gross. If fees total $2, net is **+$28**. Paper trade B buys one put at $1.80 and sells at $1.20, producing `($1.20 − $1.80) × 100 = −$60` gross and **−$62** after the same $2 fees. Across both, net P&L is `28 − 62 = −$34`, even though **win rate** is one winner out of two, or 50%. Two observations say nearly nothing about expected performance; they do show how to keep an honest ledger.

Also measure **drawdown**, the decline from the highest account value or cumulative P&L reached so far. A 50% win rate, a high premium collected, or a pretty ending balance can hide severe interim losses. Track rule violations separately from P&L. A winning trade that broke the pretrade risk limit is a process failure. A losing paper trade that followed the plan may be valuable evidence. The review question is not “Did I win?” but “Was the decision recorded beforehand, were the fills plausible, and what would I do differently *before the next comparable decision*?”

For these four weeks, your goal is a complete decision log, not a quota of trades. At the end, write a one-page audit: number of eligible signals, orders submitted, nonfills, no-trade decisions, total gross and net hypothetical P&L, fees, largest modeled loss, largest drawdown, and rule violations. Put “unknown” beside any measure a simulator cannot provide credibly. This first month starts the **eight-week minimum** in [Risk Gate 2](RISK_AND_OPERATIONS.md); keep the same record during at least weeks 49–52 of the probability module, or longer until all gate evidence is complete. The later forward-validation research record is a separate, frozen-protocol study.

**Common mistakes:** Deleting no-trade days, reporting gross P&L as if it were take-home gain, and declaring an edge from a short paper record.

### Four-week teaching plan

| Week | Work for the 10-hour allocation described at the start |
| --- | --- |
| 45 | Set up a paper account or shadow ledger. Rehearse every pretrade field with two fictional examples before logging any market observations. |
| 46 | Log every eligible observation, including no trades and nonfills. Reconcile hypothetical entry prices against timestamped bid/ask. |
| 47 | Continue the log. Review one decision each day for an unrecorded assumption, event, exercise/assignment path, or unrealistic fill. |
| 48 | Reconcile the ledger and write the one-page audit. Correct the process, freeze the next version of the rules, and keep all original entries. |

### Try it before the answers

1. Recalculate gross and net P&L for paper trade A above if the total fees are $2.
2. Recalculate paper trade B and the two-trade total. What is the win rate? Does it tell you the strategy's edge?
3. A simulated buy order fills at a midpoint that no real order reached. What do you record?
4. Your rules signaled a trade, but the observed spread exceeded your written maximum. Do you delete this opportunity from the journal because you did not trade it?
5. You break a position-size rule and make a paper profit. Did you pass the process check? Explain.

<details><summary>Worked answers — Module 12</summary>

1. `($2.60 − $2.30) × 100 = +$30` gross; `30 − 2 = **+$28 net**`.
2. B is `($1.20 − $1.80) × 100 = −$60` gross and **−$62 net**. Combined net is **−$34**. One of two trades won, so win rate is **50%**. With two trades and no fair benchmark, it says almost nothing about a persistent edge.
3. Preserve the simulator's reported fill *and* a separate conservative quote-side or nonfill scenario. Mark the discrepancy; do not silently treat the midpoint as live execution evidence.
4. No. Record the signal and the **no-trade decision**, with the spread and the rejection rule. Removing it would hide the strategy's actual opportunity set.
5. No. The profit does not erase a rule violation. Mark the trade as a process failure and explain how the size check will work next time.

</details>

**Pass gate:** Four complete weeks of time-stamped decisions, including passes and nonfills; a reconciled gross/net ledger; a drawdown and rule-violation report; and a clear statement of which paper outcomes cannot be treated as live evidence. Continue the record through at least four further weeks under [Risk Gate 2](RISK_AND_OPERATIONS.md), including its final four weeks of full policy adherence, before treating the paper gate as passed.
