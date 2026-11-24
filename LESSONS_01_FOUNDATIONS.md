# Lessons 1–6: the beginner foundation

This is the first **24 weeks** of the course, written as lessons rather than a list of topics. Read Module 1's lesson below, then complete its [Week 1 practice](ADVANCED_FIRST_WEEK.md) and return to the chapter plan. If percentages or algebra are new, use the [practical math bridge](FOUNDATION_MATH_BRIDGE.md) from the beginning; if you already know Python, use its code checks while still solving by hand. The [foundation assessment bank](FOUNDATION_ASSESSMENTS.md) supplies fresh cases and a separate answer key. Continue these chapters in order. All prices and contracts below are invented classroom examples. Unless a section says otherwise, examples use a **standard, physically settled stock option for 100 shares**, ignore fees until explicitly added, and value positions **at expiration**. Actual contract terms and a broker's procedures must be checked before any real order. The [SEC's stock-options bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63) and the [OCC disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) are the primary references.

Each of the four weeks in a chapter uses the same 10-hour budget: **2 hours lesson/source reading, 3 hours worked practice, 2 hours observation without orders, 2 hours notes or a small project, and 1 hour recall and error correction**. The table in each chapter tells you what to do with those hours. Write answers before opening the key. Rework misses without looking, then explain the idea aloud in ordinary language.

## Module 1 (weeks 1–4): money, markets, and the purpose of trading

### Lesson

Start with an everyday distinction. **Saving** puts money aside for a future need. **Investing** puts money into assets whose value and cash flows are uncertain, often for years. **Trading** means making shorter-horizon decisions to buy, sell, or hedge. None of these words describes a guaranteed return. An options position can change value much faster than a stock position, so the first trading skill is knowing which money is available for risk and which money pays for ordinary life. In your notebook, keep living expenses, emergency reserves, debt obligations, and potential trading capital as separate lines. A classroom exercise can use hypothetical capital even if you have no money available for trading.

A **share of stock** is a unit of ownership in a company. An **exchange-traded fund (ETF)** is a fund whose shares trade on an exchange and hold assets according to its rules. An **index** is a calculated measure, such as a basket's level; the index itself is not a share you can take home. Options can reference a stock, ETF, or index, but their contract terms may differ. Before learning an option, learn to ask what its underlying actually is. The [SEC's investing basics](https://www.investor.gov/introduction-investing/investing-basics/investment-products) is a starting reference for products. We will use an imaginary company, ABC, rather than a real ticker so that examples cannot be mistaken for recommendations.

Trading needs infrastructure. A **broker** is the firm through which a customer submits orders and maintains an account. An **exchange** organizes trading and publishes market rules and prices. The **Options Clearing Corporation (OCC)** clears standardized U.S. listed securities options and sets out the rights, obligations, exercise, and assignment framework in its [disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document). The broker determines what option strategies an account is approved to use; [the SEC says approval levels and allowed strategies vary by firm](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-77). You do not need an options account to complete the first part of this course.

Measure outcomes in both dollars and percentages. If 100 ABC shares cost $50 each, the position costs $5,000. At $55 each, its market value is $5,500 and its gain is $500, or `500 / 5,000 = 10%` before costs and taxes. At $45, the loss is $500, or 10%. A loss and its recovery are asymmetric: $5,000 falling by 50% becomes $2,500. A later 50% rise produces $3,750, still below the start. To return to $5,000 from $2,500 requires a 100% gain. This is why avoiding a severe loss matters more than collecting impressive small wins.

Time and alternatives matter as much as the percentage. A 10% gain over one year and a 10% gain over ten years describe different outcomes. A $500 profit from risking nearly all of a small account is different from the same profit on a well-controlled exposure. A trading journal should therefore record the starting amount, dates, capital tied up, worst loss along the way, and a sensible comparison such as holding the underlying or staying in cash. This does not mean cash is always better; it means you should be able to describe what extra risk an option is supposed to solve. The eventual aim is a repeatable decision process, not a striking single result.

**Vocabulary to own:** asset, stock, ETF, index, broker, exchange, clearinghouse, cost basis, return, drawdown, liquidity, risk capital. A *drawdown* is a decline from a prior peak; it is not automatically the same as the total loss on one trade. Do not use a high percentage return to judge skill until you know the starting capital, risk taken, fees, and the time period.

**Common mistakes to catch:** calling an index a share, treating all account cash as available for a loss, or comparing two percentages without their time periods and drawdowns.

### Four teaching weeks

| Week | Use the 2/3/2/2/1-hour pattern |
| --- | --- |
| 1 | Complete [ADVANCED_FIRST_WEEK.md](ADVANCED_FIRST_WEEK.md); rewrite its seven key definitions in your own words; observe one stock and one ETF quote without placing an order; correct the quiz. |
| 2 | Read the SEC product overview. Make a one-page map of stock, ETF, index, broker, exchange, and OCC; calculate ten stock-position dollar values and returns. Use the [math bridge](FOUNDATION_MATH_BRIDGE.md) for percentages and units as needed. |
| 3 | Write a hypothetical budget separating essential money from an imaginary practice account; observe how a stock and ETF price move over five sessions; note that an index is a calculation, not a deliverable share. |
| 4 | Work drawdown and recovery problems, teach the broker/exchange/OCC map aloud, and take the closed-note check below. Correct the math-bridge diagnostic if needed. |

### Try it before opening the answers

1. You buy 20 ABC shares at $40. What was the cost, and what is the percentage return if the share price becomes $44, before costs?
2. An account moves from $8,000 to $6,000. What is its drawdown from that peak? What return on $6,000 is needed to reach $8,000 again?
3. Which is a calculated level rather than a share: ABC stock, ABC ETF, or ABC index?
4. Name the distinct jobs of broker, exchange, and OCC in one sentence each.
5. Why is a 40% gain by itself insufficient evidence that someone is a skilled trader?

<details><summary>Module 1 worked answers</summary>

1. Cost is `20 × $40 = $800`. New value is `20 × $44 = $880`. Gain is `$80 / $800 = 10%`.
2. Loss is `$2,000 / $8,000 = 25%`. Recovery requires `$2,000 / $6,000 = 33⅓%`, not 25%.
3. The index. A stock or ETF has tradable shares; an index is a calculated reference level.
4. Broker handles the customer account and order; exchange runs the trading venue and rules; OCC clears listed option contracts and their exercise/assignment obligations.
5. You need the time period, starting capital, losses and drawdowns, position size, fees, and a fair benchmark; one gain could follow a large gamble.

</details>

**Pass gate:** 5/5 with correct arithmetic and a plain-language explanation. Produce a one-page map of the market and a hypothetical budget; no real order is part of this gate.

## Module 2 (weeks 5–8): how to read an option quote

### Lesson

A quote is an invitation to trade at indicated prices, not a record of what you will earn. The **bid** is the displayed price at which someone is currently willing to buy; the **ask** or offer is the displayed price at which someone is willing to sell. The **bid–ask spread** is the difference. If a standard 100-share stock option has a bid of $2.10 and an ask of $2.30, buying one at the displayed ask costs `$2.30 × 100 = $230`. If the market is unchanged and you immediately sell at the displayed bid, you receive `$2.10 × 100 = $210`. The $20 difference is a cost before commissions. The $2.20 **midpoint** is just `(bid + ask) / 2`; nobody has promised a fill there. Quotes can move or disappear before an order arrives.

An option quote must identify more than a ticker. Record the **underlying**, **call or put**, **strike**, **expiration**, **premium multiplier**, and **exercise deliverable** as separate fields. The premium multiplier converts a per-share quote into contract dollars; the deliverable describes what exercise transfers. They can differ on adjusted contracts. The **last trade** is a past transaction, possibly at an old price. **Volume** counts contracts traded during the session. **Open interest** counts outstanding contracts under the reporting convention and may not reflect today's trades yet. Neither volume nor open interest alone guarantees that you can enter or leave at a good price. A liquid contract often has a narrower spread and accessible size, but liquidity can change when a stock moves or news breaks. [OIC's options tools](https://www.optionseducation.org/options-quotes-calculators) show delayed quotes and calculators; delayed data are for learning, not a live execution assumption.

Consider a displayed quote: `ABC Dec 18 $50 call, bid $1.45, ask $1.65, last $1.80, volume 200, open interest 4,000`. Read it from left to right. ABC is the underlying, December 18 is the expiration, $50 is the strike, and this is a call. If the deliverable is standard 100 shares, the ask represents $165 per contract. The last price of $1.80 does **not** mean the current option can be sold for $180. At the displayed bid, one contract would bring in $145 before fees. The displayed spread is $0.20 per share, or $20 per contract. Check the quote timestamp, particularly when using free delayed data.

A **market order** asks to trade promptly against available interest and can fill at prices worse than the screen last showed. A **limit order** specifies your worst acceptable price for a buy or sale, but may never fill. Imagine a buy limit at $1.55 when the ask is $1.65. The order might be filled if someone sells at $1.55; it might also sit unfilled. The $10 improvement from ask to limit is not a saving until a fill actually occurs. In later research you will count rejected and unfilled orders as part of the process, rather than inventing midpoint trades.

The same $0.20 per-share spread has different importance for different option prices. On a $10 option it is a small fraction of the premium; on a $0.30 option it consumes most of the quoted price. Calculate both the **dollar spread** and its size relative to the ask. An option may display one contract at the best bid and many at other prices, so a larger order may not all fill at the best quote. Nor does a tight screen guarantee the same liquidity during a sudden move. As a beginner, read the chain to learn how markets work, not to identify the option with the biggest percentage movement.

**Vocabulary to own:** bid, ask, midpoint, spread, last, volume, open interest, multiplier, deliverable, market order, limit order, timestamp. Read a quote as a bundle of exact contract terms plus a time-specific market, not as a single option price.

**Common mistakes to catch:** multiplying a premium quote by 100 before checking the actual premium multiplier; assuming the share deliverable must equal that multiplier; treating a last trade as today's bid; assuming a limit order must fill; or mistaking open interest for the number of contracts traded today.

### Four teaching weeks

| Week | Use the 2/3/2/2/1-hour pattern |
| --- | --- |
| 5 | Label every field in ten invented quotes; practice converting quoted per-share premiums into contract dollars; observe OIC's delayed chain. |
| 6 | Record five real delayed quotes with timestamps; compute each spread in dollars and as a fraction of the ask; watch how the quote changes without trading. |
| 7 | Compare last, bid, ask, volume, and open interest for ten contract rows. Draft ten hypothetical limit orders and state whether the screen guarantees a fill. |
| 8 | Build a 20-row quote notebook, including the underlying and contract identifiers. Audit every multiplier, timestamp, and round-trip spread calculation. |

### Try it before opening the answers

1. A standard contract is quoted $0.80 bid / $1.00 ask. What is the displayed spread per share and per contract? What is the immediate ask-to-bid loss before fees?
2. A call's last price is $2.40, but its current bid is $1.70 and ask is $1.90. At the displayed prices, how much would a one-contract marketable sale bring in before fees?
3. What contract identifiers and separate multiplier and deliverable fields should you write down before converting a quoted premium into dollars?
4. A buy limit is $1.50 while the displayed ask is $1.60. Does the limit order guarantee a $1.50 fill? What is the most it authorizes you to pay per share if it fills?
5. A contract shows high open interest but a very wide spread. What can you conclude about the price at which you will exit tomorrow?

<details><summary>Module 2 worked answers</summary>

1. Spread is `$1.00 − $0.80 = $0.20` per share, or `$20` for 100 shares. An unchanged immediate buy at ask and sell at bid loses $20 before fees.
2. `$1.70 × 100 = $170`. The $2.40 last trade does not set the current sale price. This assumes the displayed bid remains and has enough size when the order reaches it.
3. Underlying, call/put type, strike, expiration, actual **premium multiplier**, and actual **exercise deliverable** in separate fields; also record timestamp and exercise/settlement terms before acting.
4. No. It may not fill. If it fills as a standard buy limit order, it authorizes at most $1.50 per share, excluding fees.
5. You cannot know tomorrow's exit price or spread from today's open interest; market conditions and quotes can change.

</details>

**Pass gate:** 5/5 and a 20-row quote notebook with accurate dollar conversions. You must never substitute last or midpoint for a guaranteed execution price.

## Module 3 (weeks 9–12): calls, puts, buyers, and sellers

### Lesson

An option is a contract with two sides. The **buyer** or *holder* pays a premium for a right. The **seller** or *writer* receives that premium when opening a short position and accepts an obligation if assigned. For the standard stock options in this chapter, one contract covers 100 shares. A **call** buyer may buy those shares at the strike; a **put** buyer may sell them at the strike. The call writer may have to sell or deliver shares, and the put writer may have to buy them. These rights and obligations are described in the [SEC options bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63) and [OCC disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document).

To learn option arithmetic, hold time still and imagine the moment of expiration. A call's **intrinsic value** per share is `max(stock price − strike, 0)`. A put's is `max(strike − stock price, 0)`. The `max(..., 0)` part says the holder need not exercise a right that has no favorable intrinsic value. **Profit** then subtracts the premium paid by a buyer or adds the premium received by a writer. Before expiration, an option can have **extrinsic value** on top of intrinsic value because time and uncertain future moves still matter. So an expiration break-even price is neither a forecast nor the price where you must sell before expiration.

Work through a call slowly. ABC is $100 today. You pay $3 per share for one $105 call: `$3 × 100 = $300` leaves your account. If ABC ends at $112, the right to buy at $105 is worth `$7 × 100 = $700`; subtract $300 and your expiration profit is $400 before fees. If ABC ends at $106, the right is worth $100 and the profit is **negative $200**. A correct prediction that the stock would rise was not enough. The expiration break-even is `$105 + $3 = $108`. Below the strike the call's intrinsic value is zero and the premium can be lost in full. A put works in the opposite stock direction: a $95 put costing $2 has a $93 expiration break-even. At a stock price of $88, it is worth `$7 × 100 = $700`, leaving $500 after its $200 premium.

Now reverse the position. If someone **writes an uncovered $105 call** for $3, $300 is the most premium they can keep from that call. At $112 expiration, the intrinsic obligation is $700, producing `+$300 − $700 = −$400` before fees. If the stock rose to $200, the obligation would be far larger; because a stock has no fixed upper price ceiling, the uncovered call has no fixed theoretical loss ceiling. A **short $95 put** sold for $2 can require buying 100 shares for $9,500 even if the shares have collapsed. If the stock went to zero, its expiration loss would be `$9,500 − $200 = $9,300` before fees. Receiving premium therefore does not make a position low risk or turn it into a salary.

You will also hear **in the money** and **out of the money**. A call is in the money when the stock is above its strike; a put is in the money when the stock is below its strike. This says only whether exercise has immediate intrinsic value. It does **not** say whether the original buyer has made a profit. For example, the $105 call at stock $106 is in the money by $1 per share but still loses $2 per share after its $3 purchase premium. Before expiration, a call might trade above its intrinsic value because time remains. If the $105 call is quoted at $7 while the stock is $110, $5 is intrinsic and $2 is extrinsic in that illustrative quote. The actual quote can change for many reasons. At expiration, that extra time value disappears from the simple payoff model.

**Vocabulary to own:** holder, writer, long, short, strike, premium, intrinsic, extrinsic, in the money, out of the money, expiration break-even, obligation. The words *long* and *short* refer to owning and writing the option, not automatically to optimism or pessimism about the stock. A short put, for example, often benefits when a stock stays up, yet it can lose heavily when the stock falls.

**Common mistakes to catch:** calling an in-the-money option profitable without subtracting the premium, assuming a writer's premium is the maximum possible loss, or using an expiration break-even as a price forecast.

### Four teaching weeks

| Week | Use the 2/3/2/2/1-hour pattern |
| --- | --- |
| 9 | Draw and label the rights and obligations of the four basic positions. Work 20 intrinsic-value problems without a calculator, then observe five calls and five puts. |
| 10 | Build call and put expiration payoff tables for six different strikes and premiums. Mark premium paid or received separately from the position's ending value. |
| 11 | Invert each of your long positions to a short position. Explain how the sign changes and where a loss can exceed premium received. Work the five exercises below. |
| 12 | Work the [40 fresh payoff cases](FOUNDATION_ASSESSMENTS.md), each with stated hypothetical fees. Explain aloud why a correct price direction can still be an unprofitable long option. |

### Try it before opening the answers

1. One $60 call costs $4. What is the dollar premium and expiration break-even? What is its profit if the stock ends at $68?
2. One $40 put costs $1.50. What is its expiration break-even and profit if the stock ends at $35?
3. A $50 call sold uncovered for $2 expires with stock at $58. What is its profit/loss? What is the theoretical maximum loss of this uncovered call?
4. A $30 put sold for $1 ends with the stock at zero. What is its expiration profit/loss before fees?
5. ABC rises from $100 to $106. Why did a long $105 call bought for $3 still lose money at expiration?

<details><summary>Module 3 worked answers</summary>

1. Premium `$4 × 100 = $400`; break-even `$60 + $4 = $64`. At $68, intrinsic value is `$8 × 100 = $800`; profit is `$800 − $400 = $400`.
2. Break-even `$40 − $1.50 = $38.50`. At $35, intrinsic value `$5 × 100 = $500`; subtract $150 premium for a `$350` profit.
3. Premium received is $200; intrinsic obligation is `($58 − $50) × 100 = $800`; profit is `−$600`. With no offsetting shares or option, the theoretical loss has no finite upper bound.
4. Premium received is $100. Obligation at $0 is `$30 × 100 = $3,000`; expiration result is `−$2,900`.
5. The call's intrinsic value is only `($106 − $105) × 100 = $100`. It cost $300, leaving a $200 loss. Rising stock price alone was not enough.

</details>

**Pass gate:** At least 90% on the [40 fresh payoff cases](FOUNDATION_ASSESSMENTS.md), with **all** multiplier, obligation, and maximum-loss cases correct after a new-number retest when missed. Save the first attempt before opening [the separate key](FOUNDATION_ANSWER_KEY.md). Stay in observation mode.

## Module 4 (weeks 13–16): the contract's life and what happens at expiration

### Lesson

Options have a life cycle: an option is opened, its market value changes, and it can be **closed**, **exercised**, or reach **expiration**. To close a long option, sell the same contract. To close a short option, buy back the same contract. Closing an option position is different from exercising it. When a holder exercises a standard stock call, the contract produces a purchase of shares at the strike; exercising a standard stock put produces a sale of shares at the strike. The writer on the other side can be **assigned** the matching obligation. [OIC explains exercise and assignment](https://www.optionseducation.org/optionsoverview/exercising-options), including the fact that an American-style short option can be assigned before expiration.

Take a $50 stock call covering 100 shares. If its holder exercises, they pay `$50 × 100 = $5,000` and receive 100 shares. If its writer is assigned, that writer must deliver 100 shares and receive $5,000. A writer who already owns the 100 shares can deliver them; a writer without them faces a stock-delivery obligation and broker treatment that must be understood. A put reverses the share movement: a holder who exercises a $50 put delivers 100 shares and receives $5,000; an assigned writer pays $5,000 and receives 100 shares. The premium paid or received earlier is separate from these exercise cash flows. Broker rules and fees can change the precise account display.

Expiring long equity options can enter **exercise-by-exception**, often called automatic exercise: OCC generally processes options that are at least $0.01 in the money, subject to contrary instructions, exceptions, and broker procedures. Do not assume an expiring long option simply pays its intrinsic value in cash. A stock call's exercise can create a share purchase requiring strike cash; a put's exercise can create a short stock position when shares were not owned, subject to broker handling. A stock position created by exercise has separate price and funding risk beyond the option premium. Check the product rules, the broker's instruction cutoff, and any risk-liquidation procedure before expiration. [OIC's exercise FAQ](https://www.optionseducation.org/referencelibrary/faq/options-exercise) explains exercise-by-exception; [its long-put example](https://www.optionseducation.org/strategies/all-strategies/long-put) distinguishes the put from the short stock it can create.

**American-style** means the holder can exercise before expiration; **European-style** means exercise only at expiration. These names describe exercise timing, not where the option trades. Most standard U.S. stock/ETF options are American-style and physically settled. Some index products, such as SPX, SPXW, and XSP, are European-style and cash settled, while SPY ETF options deliver shares. [Cboe's comparison](https://www.cboe.com/tradable_products/sp_500/spx_weekly_options/specifications) shows these specific products and also warns that A.M. versus P.M. settlement can differ by expiration type. For a cash-settled $100-strike index call with settlement value 107 and multiplier 100, the holder receives `($107 − $100) × 100 = $700` cash when exercised; no index shares arrive.

Short American-style options can be assigned **early**. Around a stock's ex-dividend date, an in-the-money short call is a common case to examine, because the long holder's exercise decision can change. Early assignment is possible on other days too. Near expiration, an option that appears out of the money at the regular close can still be exercised after an after-hours stock move. Your broker's exercise instruction cutoff is a deadline for **holders**; a short writer's way to eliminate a position is to buy it back while it is tradable, and the closing order must fill. [FINRA's assignment case study](https://www.finra.org/investors/insights/trading-options-understanding-assignment) shows why after-hours moves and multi-leg positions need special attention.

A **spread** is two or more option legs. Its diagram may show a bounded loss while both legs remain intact, but assignment of the short stock-option leg can create a share position while the long option is still open. The long leg does not automatically erase the newly created share obligation. In a classroom example, you are short one $50 call and long one $55 call. If the $50 call is assigned early, you must deliver 100 shares at $50; the $55 call still exists. Depending on whether you had shares, your account can now show short stock plus a long call. You must know the shares and cash involved, the broker's treatment, and the remaining option's status. This is an operations question before it is a profit-and-loss question.

An **adjusted contract** needs two separate calculations. In [OIC's illustrative 1-for-10 reverse split](https://www.optionseducation.org/news/splits-happen), a contract's quoted-premium multiplier can remain 100 while exercise delivers 10 current shares; the aggregate exercise payment remains tied to the contract's adjusted terms. For a classroom call with a $50 aggregate exercise payment, delivery of 10 shares worth $8 each produces `$80 − $50 = $30` intrinsic value. If its quoted premium were $0.20 with multiplier 100 and total hypothetical fees $2, the net expiration result would be `$30 − $20 − $2 = $8`. Applying a standard 100-current-share payoff would be wrong. Check the exact [OCC adjustment memo](https://infomemo.theocc.com/infomemo/search-memo) for a real series. Rework this in [the mixed safety exam](FOUNDATION_ASSESSMENTS.md).

**Vocabulary to own:** opening, closing, exercise, assignment, American-style, European-style, physical settlement, cash settlement, deliverable, ex-dividend date, expiration, adjusted contract. Corporate actions such as a split or merger can change deliverables; do not assume every option always represents exactly 100 current shares. The [OCC disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) is required reading before trading options, and you should check the exact contract and broker instructions for each product.

**Common mistakes to catch:** saying a closing sale exercises an option, using a long holder's exercise deadline as a short writer's exit deadline, or assuming a spread's long leg automatically removes shares created by early assignment.

### Four teaching weeks

| Week | Use the 2/3/2/2/1-hour pattern |
| --- | --- |
| 13 | Draw a timeline from opening to closing, exercise, or expiration; work ten call/put exercise cash-flow cases for standard stock options. |
| 14 | Compare Cboe's SPX, SPXW, XSP, and SPY specifications. Record exercise style, settlement type, multiplier, and A.M./P.M. settlement for specific expirations. |
| 15 | Read OIC and FINRA assignment explanations. Rehearse early assignment, ex-dividend, one-leg spread assignment, and after-hours decisions using written position tables. |
| 16 | Create a contract-specification sheet with separate premium multiplier, exercise deliverable, and aggregate exercise payment fields. Pass fresh scenario cases from [the assessment bank](FOUNDATION_ASSESSMENTS.md). Locate a broker's published exercise and risk-liquidation procedures without opening a live position. |

### Try it before opening the answers

1. You exercise one standard $40 stock call. What shares and strike cash move? Ignore premium.
2. You wrote one standard $35 stock put and are assigned. What shares and strike cash move? Ignore premium.
3. A cash-settled index call has strike 2,000, settlement value 2,018, and multiplier 100. What is the cash settlement amount? Are index shares delivered?
4. You are short one standard $50 call and long one $55 call. The short call is assigned early. Does the long call automatically close the stock-delivery obligation? What remains?
5. Does a short American-style call that appears out of the money at the regular close have zero assignment risk that evening? Explain briefly.

<details><summary>Module 4 worked answers</summary>

1. Pay `$40 × 100 = $4,000` and receive 100 shares. This is the strike cash flow, not the full trade profit.
2. Pay `$35 × 100 = $3,500` and receive 100 shares. The premium collected earlier affects total economics but not this assignment cash flow.
3. `(2,018 − 2,000) × 100 = $1,800` cash; no index shares are delivered.
4. No. The short call creates an obligation to deliver 100 shares at $50. The long $55 call remains open unless separately sold or exercised under its terms; the account may have short stock if shares were not owned.
5. No. Exercise instructions and after-hours moves can lead to assignment even when the short appeared out of the money at the regular close. Confirm product rules and broker procedures.

</details>

**Pass gate:** Every share/cash-flow and assignment scenario must be correct. Produce one verified contract-specification sheet. Any confusion about a broker deadline, settlement type, or deliverable blocks simulated order entry until resolved.

## Module 5 (weeks 17–20): building a position from parts

### Lesson

A named options strategy is just a combination of positions. Do not memorize the name first. Write down each leg, its opening cash flow, and what it will be worth at the evaluation time. Then **add the pieces**. For the first exercises, all options have the same expiration and a standard 100-share deliverable. This lets you calculate an idealized expiration payoff with arithmetic. Real positions can be closed earlier, and exercise, assignment, dividends, spread prices, and fees can change the account path. The [OIC strategy catalog](https://www.optionseducation.org/strategies/all-strategies-en) is useful for checking leg definitions after you build them yourself.

Start with **protective put**: own 100 ABC shares and own one ABC put. Suppose you bought the shares at $100 and one $95 put for $2. Your total initial outlay is `$10,000 + $200 = $10,200`. If ABC is $80 at expiration, the stock has lost `$2,000`, but the put is worth `($95 − $80) × 100 = $1,500`. Total P&L is `−$2,000 + $1,500 − $200 = −$700`. At $0 the put offsets almost all further stock decline; the expiration loss still includes the $5 gap between share purchase and strike plus the $2 premium, or `$7 × 100 = $700`. The put offers a floor at expiration, but the floor costs money and does not make the position profitable by itself.

Now **covered call**: own 100 shares bought at $100 and sell one $105 call for $3. At ABC $120, the stock gained `$2,000`, but the short call owes `($120 − $105) × 100 = $1,500`; add the `$300` premium and the total is `$800`. Above $105, the share gain is effectively capped at `$5 × 100`, plus $300 premium, under the idealized expiration calculation. At ABC $80, the call may expire with no intrinsic value, but the shares lost $2,000; the $300 premium only reduces that loss to $1,700. A covered call is not a hedge against a major stock collapse. If assigned, the writer must deliver shares at the strike. Dividends and early assignment require separate attention.

A **vertical spread** buys one option and sells another of the same type and expiration at a different strike. For a debit call vertical, buy a $100 call for $6 and sell a $105 call for $3. The net debit is `$3 × 100 = $300`. At ABC $110, the long call is worth $1,000 and the short call owes $500, leaving $500 value and `$500 − $300 = $200` profit. Below $100, both options have no expiration intrinsic value and the $300 debit is lost. Above $105, the idealized spread value remains $500, so the net expiration gain is capped at $200. A one-to-one matching vertical limits the *intact position's* payoff but the short American leg can still be assigned before expiration, creating an operational problem as Module 4 explained.

A **straddle** is one call and one put at the same strike and expiration; a **strangle** uses different strikes. For a long $100 straddle with a $4 call and $3 put, total premium is `$7 × 100 = $700`. At ABC $100 expiration, neither leg has intrinsic value, so the full $700 is lost. At $90, the put is worth $1,000 and the position profits `$300`. Its expiration break-even levels are $93 and $107. Do not interpret these as probabilities or promises of a volatility trade. A butterfly and an iron condor also combine legs; you will build their payoff tables by adding each leg rather than memorizing a diagram. Calendar spreads use **different expirations** and need a live-leg valuation, so they wait until the later Greeks and term-structure lesson.

**Vocabulary to own:** protective put, covered call, cash-secured put, vertical debit or credit spread, straddle, strangle, butterfly, iron condor, net debit, net credit, capped payoff. A **cash-secured put** is a short put with cash set aside for the possible share purchase; the cash does not eliminate share-price loss. Every diagram here is an *expiration* calculation under stated assumptions, not a statement about what a broker will allow or how a position will behave on every path.

**Common mistakes to catch:** believing a covered call protects a large stock decline, treating the intact spread's expiration loss as the only possible account obligation, or drawing a calendar as though both of its expirations occurred at the same time.

### Four teaching weeks

| Week | Use the 2/3/2/2/1-hour pattern |
| --- | --- |
| 17 | Build stock-plus-put and stock-plus-call tables at five final stock prices each. Observe how long stock's downside remains in a covered call. |
| 18 | Build four call and four put verticals, writing each leg's cash flow separately. Mark both idealized expiration loss and early-assignment obligation. |
| 19 | Derive straddle and strangle break-even prices, then construct a same-expiration butterfly and iron condor from individual legs using an OIC definition as a check. |
| 20 | Finish a 12-structure payoff notebook. For each structure include entry cash flow, at least five final-price outcomes, downside and upside, and an operational note. |

### Try it before opening the answers

1. Shares bought at $100 are paired with one $95 put bought for $2. What is expiration P&L at stock $80? What is the worst idealized expiration P&L if the stock goes to $0?
2. Shares bought at $100 are paired with one $105 call sold for $3. What is expiration P&L at stock $120 and at stock $80?
3. Buy one $100 call for $6 and sell one $105 call for $3. What is net entry cash flow, maximum idealized expiration loss, and P&L at stock $110?
4. Buy one $100 call for $4 and one $100 put for $3. What is total premium, and what are its two expiration break-even stock prices?
5. A short $95 put is backed by $9,500 cash and sold for $2. Does holding the cash remove downside exposure? What is the expiration loss if ABC reaches $0, before fees?

<details><summary>Module 5 worked answers</summary>

1. At $80, shares lose $2,000; put intrinsic is $1,500; put premium costs $200: total `−$700`. At $0, shares lose $10,000; put intrinsic is $9,500; subtract $200 premium: still `−$700`.
2. At $120: stock `+$2,000`, short call `−$1,500`, premium `+$300`, total `+$800`. At $80: stock `−$2,000`, short call expires without intrinsic value, premium `+$300`, total `−$1,700`.
3. Net debit `($6 − $3) × 100 = $300` paid. Idealized expiration maximum loss is $300; at $110 the spread is worth `$5 × 100 = $500`, giving `$200` profit. Assignment/fees may complicate the account path.
4. Total premium `$7 × 100 = $700`; break-evens `$100 − $7 = $93` and `$100 + $7 = $107`.
5. No. The cash funds the assigned share purchase but the shares can still become nearly worthless. At $0, obligation is `$95 × 100 = $9,500`; after the $200 premium, expiration loss is `$9,300`.

</details>

**Pass gate:** Reproduce all five answers without notes and submit 12 leg-by-leg tables. Correct every maximum-loss, deliverable, and assignment error before continuing.

## Module 6 (weeks 21–24): risk is more than a payoff diagram

### Lesson

This is the safety chapter. A strategy's expiration diagram tells you one possible accounting view at one time. A complete risk view also asks **how the market and account can get from here to there**. The stock can gap overnight. Implied volatility can change while the stock barely moves. A bid/ask spread can widen, so closing costs more than expected. A short stock option can be assigned early. A broker can change buying-power requirements or liquidate a position. Options on the same underlying or related companies can lose together. These are not rare trivia items to memorize after learning strategy names; they are part of each position's definition. Read Chapter X of the [OCC options disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) and the [SEC margin bulletin](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-29) alongside this chapter.

Separate **modeled loss** from **funding obligation**. A one-to-one, matching vertical's idealized expiration payoff may have a finite maximum loss. Yet if its short leg is assigned early, a stock position and cash or share obligation may appear while its long leg stays open. The account must survive that interval. A cash-secured put has cash for assignment but can still lose when the purchased stock falls. An uncovered short call has no finite theoretical loss ceiling. Never use a short-option premium collected or a platform's colored payoff picture as the sole measure of money at risk. If one contract's size already breaches your rule, abstaining is a valid outcome; buying a contract with a shorter expiry merely because its price is lower can introduce other risks.

To practice **position sizing** without recommending a real account limit, suppose a classroom policy says a new defined-risk idea may put at most 0.25% of a hypothetical $10,000 practice account at modeled loss. That budget is `$10,000 × 0.0025 = $25`. A one-contract long option costing $1.00 per share costs $100 before fees, so it cannot fit this particular policy. The right arithmetic answer is *no trade*, not half a contract (usually unavailable), borrowed money, or a promise to exit before the loss. These numbers are training rules, not universally safe thresholds; your personal finances and broker terms would matter before any live order. [RISK_AND_OPERATIONS.md](RISK_AND_OPERATIONS.md) contains the sample policy and a pre-order card.

Your **pre-order card** should identify exact contracts and deliverables, bid and ask, estimated fees, entry limit, why the position exists, what would disprove the idea, the exit/expiration plan, events and dividends, how much the entire account could lose in a stress case, and what shares/cash assignment could require. Keep a **decision journal** even when you choose not to trade. This trains you to distinguish a bad outcome from a bad decision and exposes repeated process errors. A paper simulator can help with mechanics but can grant unrealistic fills; [IBKR documents simulation limitations](https://www.ibkrguides.com/orgportal/aboutpapertradingaccount.htm). There is no requirement to produce a profitable paper record during this safety stage.

Broker permissions are not universal. A broker decides which option strategies a specific account may use based on its application and policies. Margin rules can also change. As of October 26, 2026, [FINRA's new intraday margin standards](https://www.finra.org/investors/insights/intraday-margin-requirements) took effect June 4, 2026, but brokers have a transition period through October 20, 2027; check what your own firm applies rather than assuming a single old pattern-day-trader rule. At this stage, the point is to recognize margin as a possible funding and liquidation risk, not to use it. Taxes and records matter too: premiums, opening/closing dates, exercise, assignment, fees, and stock basis should be tracked; treatment varies by contract and situation, so [IRS Publication 550](https://www.irs.gov/publications/p550) is a reference for later review rather than a one-rule shortcut.

**Vocabulary to own:** market risk, gap, volatility risk, liquidity risk, assignment risk, margin, buying power, concentration, stress test, modeled maximum loss, funding requirement, risk policy, decision journal. In this course, a **stress test** asks what happens under a specified adverse scenario; it cannot prove the largest possible future loss. A trader who is prepared to say *I do not know enough to place this order* is using the material correctly.

**Common mistakes to catch:** treating a stop order as guaranteed loss protection, buying a smaller premium solely to meet a risk limit, logging only trades that filled, or assuming margin is a source of free capital.

### Four teaching weeks

| Week | Use the 2/3/2/2/1-hour pattern |
| --- | --- |
| 21 | Read OCC Chapter X's holder, writer, and combination risk sections. For ten earlier payoff exercises, add a gap and a wider bid/ask exit. |
| 22 | Rehearse all eight [risk scenarios](RISK_AND_OPERATIONS.md) with share/cash tables. Add two scenarios from your own imagination and explain which data or broker rule you must check. |
| 23 | Build a hypothetical account risk sheet, pre-order card, and no-trade journal. Compute position size and aggregate exposure for ten examples, including cases too large for the classroom policy. |
| 24 | Take the safety exam below and [the mixed fresh safety exam](FOUNDATION_ASSESSMENTS.md). Correct every error; produce a dated plan for the later paper-trading stage without opening live orders. |

### Try it before opening the answers

1. A hypothetical account has $12,000 and a classroom per-position modeled-loss cap of 0.25%. What is the dollar cap? Does a $0.60 standard long option fit before fees?
2. Why is the quoted premium collected on a short put not the amount of risk in that position?
3. A one-to-one stock-option vertical's short leg is assigned while its long leg remains. Name two exposures that an expiration payoff diagram alone can hide.
4. You plan to buy an option at a $1.00 ask. During a shock the best bid falls to $0.40. What is the one-contract mark-to-exit loss before fees if those quotes were executable at their displayed size? What else could make the real exit differ?
5. A friend says the current U.S. day-trading margin rule always requires $25,000. Is that a safe universal statement in October 2026? What source and account information would you check?
6. Name at least five fields that belong on a pre-order card and explain why one of them matters.

<details><summary>Module 6 worked answers</summary>

1. `$12,000 × 0.0025 = $30`. A $0.60 option costs `$60` before fees for a standard 100-share contract, so it does not fit this illustrative cap. The policy would say no trade.
2. Assignment can require buying 100 shares at the strike, and those shares can fall substantially; loss can exceed the premium received.
3. Possible stock delivery or purchase, cash/margin requirement, and the still-open long option's changing value. The broker may act before a planned exit.
4. Buy for `$1.00 × 100 = $100`; sell at `$0.40 × 100 = $40`; loss `$60` before fees. The bid can change, lack enough size, or disappear; a limit order may fail to fill.
5. No. FINRA's new standards became effective June 4, 2026 with broker phase-in through October 20, 2027. Check [FINRA's explanation](https://www.finra.org/investors/insights/intraday-margin-requirements) and the specific broker's implemented rules and house requirements.
6. Examples: exact contract, multiplier, deliverable, exercise style, settlement type, bid/ask, entry limit, fees, event/dividend calendar, thesis, exit plan, modeled loss, assignment funding, account aggregate exposure. Each matters because an error can change cash at risk or the position created at exercise.

</details>

**Pass gate:** 6/6 plus the [mixed safety exam](FOUNDATION_ASSESSMENTS.md), including all fresh assignment, contract-size, settlement, and margin-funding scenarios correct after remediation. Complete the [risk and operations checklist](RISK_AND_OPERATIONS.md). This gate permits later *simulation*, not live trading; the full course has further research and risk gates.
