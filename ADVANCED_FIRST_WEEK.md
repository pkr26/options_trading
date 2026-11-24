# Week 1: your first options lesson

**Goal:** understand what a listed option is, what one contract can cost or obligate you to do, and why a favorable stock move does not guarantee a profit. First read the opening lesson in [Volume 1, Module 1](LESSONS_01_FOUNDATIONS.md) for stocks, ETFs, indexes, and brokers. Try the short diagnostic in [the practical math bridge](FOUNDATION_MATH_BRIDGE.md); use its lessons alongside this week if percentages or algebra are new. This week is study and observation only.

## The simplest mental model

A **stock** is an ownership interest. An **option** is a time-limited contract tied to an underlying asset. This first lesson uses **standard, physically settled stock options**: a **call** gives its buyer the right to buy shares at a stated **strike price**; a **put** gives its buyer the right to sell shares at the strike. The buyer pays a **premium**. The seller receives the premium and takes the corresponding obligation if assigned. Standard U.S. listed equity options generally deliver 100 shares, but check each contract's **premium multiplier** and **exercise deliverable** separately, especially after an adjustment. The [SEC's stock-options introduction](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63) is the reference for these basics. Some index options instead [settle in cash](https://www.optionseducation.org/advancedconcepts/equity-vs-index-options); they do not deliver shares.

An option has an **expiration date**. Its price before expiration responds to the underlying price, time remaining, expected volatility, rates, dividends, and market supply and demand. The payoff arithmetic below applies **at expiration**. Before then, the market price can be different from its intrinsic value.

### Example 1: buying a call

Assume a stock is at $100. You buy one call with a $105 strike for a quoted premium of $3.00 per share. Assume a 100-share multiplier and ignore fees for this exercise.

- Up-front cost: **$3 × 100 = $300**.
- At expiration, if the stock is $112, the call's intrinsic value is **($112 − $105) × 100 = $700**. Profit is **$700 − $300 = $400**.
- At expiration, if the stock is $106, the call is worth $100, yet your profit is **$100 − $300 = −$200**. The stock went up, but not enough to cover the premium.
- If the stock finishes at or below $105, the call expires without intrinsic value and the full **$300** premium is lost.
- Expiration break-even stock price: **$105 + $3 = $108**, before fees.

The long-call expiration-profit formula is `multiplier × max(stock price − strike, 0) − multiplier × premium − fees`.

### Example 2: buying a put

Assume the same stock is at $100. You buy one $95-strike put for $2.00 per share, again with a 100-share multiplier and no fees.

- Cost: **$200**.
- At expiration, with the stock at $88, intrinsic value is **($95 − $88) × 100 = $700**. Profit is **$500**.
- Expiration break-even stock price: **$95 − $2 = $93**.
- At or above $95 at expiration, the full $200 premium is lost.

The long-put expiration-profit formula is `multiplier × max(strike − stock price, 0) − multiplier × premium − fees`.

### The other side has obligations

If you **sell** a call without owning the shares or another offsetting position, you may have to deliver shares at the strike even when the market price is much higher. A stock has no fixed upper price limit, so the uncovered short call's theoretical loss is unlimited. A short put can require buying the shares at the strike after they have fallen substantially. Premium received is payment for taking risk, not a guaranteed income stream. See the [SEC risk explanation](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63) and the [OCC disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document).

An apparently limited-risk spread can still produce a temporary stock position if its short American-style option is assigned and its other leg remains open. The exact outcome depends on the contract and your broker's procedures. You will rehearse this before simulation in [RISK_AND_OPERATIONS.md](RISK_AND_OPERATIONS.md).

### The cost hidden in a quote

Suppose an option is quoted **$2.10 bid / $2.30 ask**. Buying one at the ask costs $230. Selling it immediately at the bid brings back $210, a **$20 loss before commissions**. The $2.20 midpoint is a calculation, not a promised fill. Options with wide spreads can turn an attractive payoff into a poor trade. See [Cboe's liquidity explanation](https://optionsfacts.cboe.com/).

## Your 10-hour plan

| Day | Time | Task |
| --- | ---: | --- |
| 1 | 1 h | Read the SEC introduction through terminology. Write your own definitions of stock, call, put, strike, premium, multiplier, expiration. |
| 2 | 1.5 h | Work Example 1 again without looking; draw its profit at stock prices $90, $100, $105, $108, $112, $120. If needed, practice units and percentages in [the math bridge](FOUNDATION_MATH_BRIDGE.md) and verify the drawing with its short Python example after solving by hand. |
| 3 | 1.5 h | Work Example 2 again; draw its profit at $80, $88, $93, $95, $100, $110. |
| 4 | 1.5 h | Read the SEC's risk section, then use the guided questions below while reading the stock-option definitions in Chapter I and holder/writer risks in Chapter X of the [OCC disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document). Bookmark any unfinished section for weeks 13 and 21. |
| 5 | 1.5 h | Look at a delayed option chain using [OIC's tools](https://www.optionseducation.org/Options-Quotes-Calculators). Record the date, underlying, expiration, strike, call/put, premium multiplier, exercise deliverable, bid, ask, and source. If a field is missing, mark it unknown and consult the contract specification. Calculate one-contract bid/ask cost only when its multiplier is known. Do not place an order. |
| 6 | 2 h | Start [OIC Options 101](https://prd-web.optionseducation.org/theoptionseducationcenter/occ-learning). Correct your definitions and payoff drawings. |
| 7 | 1 h | Take all ten questions below without notes, then complete the two [new-number transfer cases](FOUNDATION_ASSESSMENTS.md) before reading their separate key. Write three questions you still have. |

### Guided questions for Day 4

As you read, write one sentence for each: (1) What right does a call or put holder receive? (2) What can an assigned writer have to deliver or buy? (3) When can a buyer lose the full premium? (4) Why can a writer lose more than the premium collected? (5) What cash or shares might be needed if one leg of a stock-option spread is assigned? Highlight unfamiliar terms and revisit them in Modules 4 and 6. The [OCC disclosure](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) is a reference to learn over time; finish any longer reading after this introductory session.

## Check yourself

Use a 100-share multiplier and ignore fees for questions 4–8. Answer before opening the key.

1. For a standard stock call, what right does the buyer have? What obligation can the seller have?
2. For a standard stock put, what right does the buyer have? What obligation can the seller have?
3. Which contract details must you confirm before computing its dollar size?
4. You buy one $105 call for $3. What is your maximum premium loss, and your expiration break-even stock price?
5. The call in question 4 expires with the stock at $112. What is its profit?
6. You buy one $95 put for $2. The stock ends at $88. What is its profit?
7. You buy an option at a $2.30 ask and immediately sell at a $2.10 bid. What is the result before fees?
8. A stock rises from $100 to $106 by expiration. Did the $105 call bought for $3 earn a profit? Why?
9. Does a high option premium guarantee an option seller a profit?
10. Can a short American-style option be assigned before expiration?

<details>
<summary>Answer key</summary>

1. The buyer can buy the shares at the strike under the contract terms; an assigned seller must deliver them.
2. The buyer can sell the shares at the strike; an assigned seller must buy them.
3. At least the underlying, call or put type, strike, expiration, premium multiplier, and exercise deliverable as separate fields; also confirm any adjustment and settlement details before acting.
4. $300 premium loss; $108 expiration break-even, before fees.
5. $400 profit.
6. $500 profit.
7. A $20 loss before fees.
8. No. Its $100 intrinsic value is less than the $300 premium; profit is −$200 before fees.
9. No. Losses can exceed premium collected and may be very large.
10. Yes. Check product style and your broker's procedures; [OIC explains exercise and assignment](https://www.optionseducation.org/optionsoverview/exercising-options).

</details>

**Pass standard:** Correct **all ten** questions and explain the rights, obligations, and arithmetic in plain language. Complete the two [new-number transfer cases](FOUNDATION_ASSESSMENTS.md) before checking [their separate answers](FOUNDATION_ANSWER_KEY.md). Rework any error with changed numbers, then continue Sprint 1 in [COURSE.md](COURSE.md).
