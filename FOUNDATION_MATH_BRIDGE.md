# Practical math bridge for options

Use this bridge alongside Modules 1–6 if percentages, algebra, or probability are new. The numbers are classroom examples. No coding is required. If you already know Python, use the optional code checks **after** working each example by hand; otherwise use an ordinary calculator. Continue a topic until you can explain the units and solve a new version without notes. The bridge can extend the 104-week calendar; it is not a race.

## Quick diagnostic

Write an answer and units for each question before opening [the separate answer key](FOUNDATION_ANSWER_KEY.md). A wrong answer is a topic to study, not a reason to guess about a real contract.

1. What is 0.25% of $12,000?
2. A share falls from $80 to $60. What percentage did it lose, using $80 as the starting amount?
3. What percentage gain on $60 returns it to $80?
4. An option is quoted at $1.40 per share with a 100-share premium multiplier. What is the quoted premium for one contract before fees?
5. The same contract requires a total hypothetical $2 fee. What is the buyer's total cost?
6. Solve `S − 105 − 3 = 0` for `S`. Label what each number means for a $105 call bought for $3.
7. Calculate `max(92 − 95, 0)` and `max(95 − 92, 0)`. Which is a call's intrinsic value and which is a put's at stock price $92 and strike $95?
8. A hypothetical outcome is +$100 with 60% probability and −$200 with 40% probability. What is its expected dollar result? Does that result predict the next outcome?

If questions 1–5 are difficult, begin with the first two lessons below. If question 6 is difficult, work the algebra lesson. If question 8 is difficult, use the probability lesson before Module 13. Regardless of the diagnostic, complete Modules 1–6 and their operational gates.

## 1. Units and percentages

An option premium is commonly quoted **per underlying share** for a standard stock option. If the contract's premium multiplier is 100, a quote of $1.40 represents `1.40 dollars/share × 100 shares/contract = $140/contract`. Add actual applicable fees to determine cost. Record the multiplier and exercise deliverable in separate fields; an adjusted contract can keep its premium multiplier while its deliverable changes.

A percentage describes a ratio with a chosen denominator: `percentage change = (new − old) / old × 100%`. A $20 fall from $80 is `−20 / 80 = −25%`. The return from $60 back to $80 is `20 / 60 = 33⅓%`. Label the starting amount before calculating.

**Hand practice:** (a) Convert quotes of $0.35, $2.75, and $12 into dollars for one *standard* 100-multiplier contract. (b) A hypothetical account moves $10,000 → $8,000 → $9,000. Find the initial drawdown, the rebound from the low, and the remaining difference from the initial amount. Check [the key](FOUNDATION_ANSWER_KEY.md) after trying.

## 2. Algebra through break-even

An equation says two expressions are equal. To find a long call's expiration break-even, set its before-fee profit per share to zero when it finishes above the strike: `stock price − strike − premium = 0`. Add the strike and premium to both sides: `stock price = strike + premium`. A $105 call bought for $3 therefore breaks even at $108 at expiration before fees. For a long put finishing below the strike, `strike − stock price − premium = 0`, so `stock price = strike − premium`.

Fees change the equation. If a standard one-contract $105 call costs $3 per share plus a total hypothetical $2 fee, `100 × (S − 105) − 300 − 2 = 0`, giving `S = 108.02`. The extra two cents is `$2 / 100`, **not** $2 added to the stock price. Break-even is a description of expiration payoff under stated assumptions, not a forecast.

**Hand practice:** (a) Find the expiration break-even for a $50 put bought for $1.20 with no fees. (b) Repeat with a total hypothetical $4 fee and multiplier 100. (c) A standard $60 call bought for $2 has a $3 total fee. What is the highest whole number of contracts that fits a hypothetical $500 premium-plus-fee budget? Do not round a fractional contract upward. Answers are in [the key](FOUNDATION_ANSWER_KEY.md).

## 3. Functions, signs, and graphs

`max(x, 0)` chooses the larger of `x` and zero. A long call's intrinsic value per share at expiration is `max(S − K, 0)`; a long put's is `max(K − S, 0)`. The buyer's profit is intrinsic value times the premium multiplier, less premium paid and fees. The writer receives the premium but has the opposite intrinsic obligation. These are **expiration** calculations; option prices before expiration can differ.

Draw a payoff as a table first. For a standard $105 call bought for $3, calculate profit at final stock prices $90, $105, $108, and $112. Plot stock price horizontally and profit vertically. The kink at $105 is where intrinsic value first becomes positive; the zero-profit crossing is $108.

Then check your hand results with Python:

```python
import math

def long_call_expiry_pnl(final_stock, strike, premium, multiplier=100, fees=0):
    assert all(isinstance(x, (int, float)) for x in (final_stock, strike, premium, multiplier, fees))
    assert all(math.isfinite(x) for x in (final_stock, strike, premium, multiplier, fees))
    assert final_stock >= 0 and strike > 0 and premium >= 0 and multiplier > 0 and fees >= 0
    return multiplier * max(final_stock - strike, 0) - multiplier * premium - fees

for final_stock in (90, 105, 108, 112):
    print(final_stock, long_call_expiry_pnl(final_stock, 105, 3))
```

The expected P&L outputs are `−300, −300, 0, 400` dollars. Try a new strike and premium only after you can reproduce those figures by hand. This tiny function values a standard unadjusted expiration payoff under its stated assumptions; it is not a position or broker simulator.

## 4. Probability and evidence

Expected value is a weighted average over specified outcomes: `sum(probability × outcome)`. For +$100 with probability 60% and −$200 with probability 40%, the expected result is `$100 × 0.60 − $200 × 0.40 = −$20`. A 60% winning chance can still have a negative average if the losses are larger. A probability you invented for a classroom example is an **assumption**. A model estimate is also uncertain and needs validation.

The code check is straightforward:

```python
outcomes = [(0.60, 100), (0.40, -200)]
assert abs(sum(p for p, _ in outcomes) - 1) < 1e-12
print(sum(p * dollars for p, dollars in outcomes))  # -20.0
```

**Hand practice:** (a) A toy position has a 90% chance of +$10 and a 10% chance of −$120. Calculate expected P&L. (b) Say why neither toy probability nor a small streak of wins establishes a trading edge. Check [the key](FOUNDATION_ANSWER_KEY.md). Module 13 teaches probability and statistical evidence in greater depth.

## Readiness check

Move ahead when you can calculate contract dollars, percentage loss and recovery, fee-adjusted break-even, four-position expiration P&L, and a two-outcome expected value from fresh numbers. Write the units at every step. If a multiplier, deliverable, or contract term is unknown, ask for the specification instead of assuming it. Continue to [the 40-case practice bank](FOUNDATION_ASSESSMENTS.md) after Module 3; passing that bank is a separate gate.
