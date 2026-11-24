# Answer key for the foundation bridge and assessments

Use this only after writing and saving your first attempt at [the math bridge](FOUNDATION_MATH_BRIDGE.md) or [the practice bank](FOUNDATION_ASSESSMENTS.md). If an answer is wrong, identify whether the error was the contract specification, units, formula, sign, arithmetic, or interpretation. Correct it, then solve a new version with changed numbers without viewing the key. A tutor or peer should supply the new case for a safety-critical retest.

## Math-bridge diagnostic

1. `0.0025 × $12,000 = $30`.
2. `($60 − $80) / $80 = −25%`.
3. `($80 − $60) / $60 = 33⅓%`.
4. `$1.40 × 100 = $140` quoted premium.
5. `$140 + $2 = $142` total hypothetical cost.
6. `S = 105 + 3 = $108`: `$105` is strike; `$3` is premium per share; this is expiration break-even before fees.
7. `max(−3, 0) = 0` is call intrinsic value per share; `max(3, 0) = 3` is put intrinsic value per share.
8. `$100 × 0.60 − $200 × 0.40 = −$20`. An average over assumed outcomes does not predict the next result.

## Math-bridge practice

- **Units and percentages:** The three quoted premiums cost `$35`, `$275`, and `$1,200` for one standard 100-multiplier contract before fees. The account loses `$2,000 / $10,000 = 20%` from its first value, then rebounds `$1,000 / $8,000 = 12.5%` from the low. It still stands `$1,000`, or 10% of the original $10,000, below the start.
- **Algebra:** The $50 put bought for $1.20 breaks even at `$50 − $1.20 = $48.80` at expiration before fees. With total $4 fees and multiplier 100, break-even is `$50 − $1.20 − $4/100 = $48.76`. A $60 call at $2 costs `$200 + $3 = $203` per contract including the stated fee. `floor($500 / $203) = 2` whole contracts; three would cost $609.
- **Functions:** A $105 call bought for $3 with multiplier 100 and no fees has expiration P&L of `−$300, −$300, $0, +$400` at final stock prices `$90, $105, $108, $112`, respectively.
- **Probability:** `0.90 × $10 + 0.10 × (−$120) = −$3` per toy outcome on average. The probabilities are hypothetical and a short observed streak does not establish their accuracy or an after-cost edge.

## Week 1 transfer check

1. Premium paid `$1.25 × 100 = $125`. Intrinsic value `($48 − $45) × 100 = $300`. Expiration profit `$300 − $125 = $175`; break-even `$45 + $1.25 = $46.25` before fees.
2. Ask cost `$1.40 × 100 = $140`; unchanged bid proceeds `$1.10 × 100 = $110`; difference `$30` before fees. A midpoint limit order may remain unfilled.

## Payoff formulas used for the 40 cases

All formulas below use the **per-share** premium `P`, stock price at expiration `S`, strike `K`, premium multiplier `M = 100`, and total hypothetical fees `F`. Intrinsic value in the table is the holder's favorable value, and it is the writer's obligation amount in the simplified expiration accounting.

| Position | Net expiration P&L | After-fee break-even | Greatest idealized expiration loss |
| --- | --- | --- | --- |
| Long call | `M × max(S − K, 0) − M × P − F` | `K + P + F/M` | `M × P + F` |
| Long put | `M × max(K − S, 0) − M × P − F` | `K − P − F/M` | `M × P + F` |
| Short uncovered call | `M × P − M × max(S − K, 0) − F` | `K + P − F/M` | No finite theoretical ceiling |
| Short put | `M × P − M × max(K − S, 0) − F` | `K − P + F/M` | `M × K − M × P + F`, at `S = 0` |

An in-the-money short standard call creates an obligation to deliver 100 shares and receive `100 × K` strike cash if assigned. An in-the-money short standard put creates an obligation to pay `100 × K` and receive 100 shares if assigned. The table is arithmetic at expiration; it does not predict assignment timing or the broker's account treatment.

| Case | Premium cash | Intrinsic value/obligation | Net P&L | After-fee break-even | Greatest modeled expiration loss |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 01 | −$150.00 | $0.00 | −$152.00 | $51.52 | $152.00 |
| 02 | −$250.00 | $200.00 | −$52.00 | $62.52 | $252.00 |
| 03 | −$400.00 | $900.00 | +$496.00 | $104.04 | $404.00 |
| 04 | −$80.00 | $0.00 | −$82.00 | $40.82 | $82.00 |
| 05 | −$300.00 | $700.00 | +$398.00 | $78.02 | $302.00 |
| 06 | −$100.00 | $200.00 | +$96.00 | $31.04 | $104.00 |
| 07 | −$220.00 | $0.00 | −$222.00 | $97.22 | $222.00 |
| 08 | −$500.00 | $500.00 | −$4.00 | $125.04 | $504.00 |
| 09 | −$60.00 | $100.00 | +$38.00 | $15.62 | $62.00 |
| 10 | −$700.00 | $1,500.00 | +$796.00 | $207.04 | $704.00 |
| 11 | −$175.00 | $300.00 | +$123.00 | $53.23 | $177.00 |
| 12 | −$225.00 | $0.00 | −$227.00 | $62.73 | $227.00 |
| 13 | −$450.00 | $900.00 | +$446.00 | $100.46 | $454.00 |
| 14 | −$90.00 | $0.00 | −$92.00 | $44.08 | $92.00 |
| 15 | −$320.00 | $500.00 | +$178.00 | $76.78 | $322.00 |
| 16 | −$110.00 | $300.00 | +$186.00 | $33.86 | $114.00 |
| 17 | −$240.00 | $0.00 | −$242.00 | $87.58 | $242.00 |
| 18 | −$525.00 | $600.00 | +$71.00 | $124.71 | $529.00 |
| 19 | −$70.00 | $100.00 | +$28.00 | $17.28 | $72.00 |
| 20 | −$800.00 | $1,400.00 | +$596.00 | $201.96 | $804.00 |
| 21 | +$180.00 | $500.00 | −$322.00 | $53.78 | unbounded |
| 22 | +$260.00 | $0.00 | +$258.00 | $64.58 | unbounded |
| 23 | +$410.00 | $1,000.00 | −$594.00 | $106.06 | unbounded |
| 24 | +$85.00 | $0.00 | +$83.00 | $42.83 | unbounded |
| 25 | +$310.00 | $300.00 | +$8.00 | $80.08 | unbounded |
| 26 | +$120.00 | $400.00 | −$284.00 | $33.16 | unbounded |
| 27 | +$230.00 | $0.00 | +$228.00 | $99.28 | unbounded |
| 28 | +$520.00 | $800.00 | −$284.00 | $127.16 | unbounded |
| 29 | +$75.00 | $100.00 | −$27.00 | $17.73 | unbounded |
| 30 | +$750.00 | $1,300.00 | −$554.00 | $212.46 | unbounded |
| 31 | +$165.00 | $400.00 | −$237.00 | $46.37 | $4,637.00 |
| 32 | +$235.00 | $0.00 | +$233.00 | $55.67 | $5,567.00 |
| 33 | +$420.00 | $900.00 | −$484.00 | $93.84 | $9,384.00 |
| 34 | +$95.00 | $0.00 | +$93.00 | $37.07 | $3,707.00 |
| 35 | +$330.00 | $500.00 | −$172.00 | $69.72 | $6,972.00 |
| 36 | +$105.00 | $300.00 | −$199.00 | $26.99 | $2,699.00 |
| 37 | +$250.00 | $0.00 | +$248.00 | $90.52 | $9,052.00 |
| 38 | +$540.00 | $800.00 | −$264.00 | $112.64 | $11,264.00 |
| 39 | +$65.00 | $100.00 | −$37.00 | $12.37 | $1,237.00 |
| 40 | +$725.00 | $1,500.00 | −$779.00 | $187.79 | $18,779.00 |

## Mixed safety exam answers

1. A physically settled standard stock call holder can buy the shares at the strike; an assigned call writer must deliver them. A put holder can sell the shares at the strike; an assigned put writer must buy them. Premium is compensation received, not a loss ceiling. An uncovered short call has no finite theoretical loss ceiling.
2. Ask cost `$1.45 × 100 = $145`; displayed bid proceeds `$1.25 × 100 = $125`; unchanged ask-to-bid difference `$20` before fees. The $1.70 last trade is a historical execution, not a current sale price. Displayed prices can change or have insufficient size.
3. Premium dollars `$0.20 × 100 = $20`. Delivered shares are worth `10 × $8 = $80`; after paying the specified `$50`, intrinsic value is `$30`. Net expiration profit is `$30 − $20 − $2 = $8`. The premium multiplier and exercise deliverable are separate. A naive 100-current-share payoff misstates the adjusted contract. [OIC's reverse-split example](https://www.optionseducation.org/news/splits-happen) illustrates this distinction; the exact OCC adjustment memo controls a real contract.
4. The assigned short call can leave a **short 100-share stock position** when no shares were owned, with `$52 × 100 = $5,200` strike proceeds; the long $57 call remains open unless separately acted on. The long call does not automatically close the short shares. Actual broker treatment and funding should be checked.
5. Pay `$45 × 100 = $4,500` and receive 100 shares. Relative to $1,000 free cash alone, the purchase needs `$3,500` more; other account assets and the broker's actions can affect how the account handles it.
6. Intrinsic value `($83 − $80) × 100 = $300`; premium paid `$400`; after-fee P&L `$300 − $400 − $2 = −$102`. After-fee break-even `$80 + $4 + $2/100 = $84.02` at expiration.
7. Loss `($60 − $80) / $80 = −25%`. Recovery from $60 requires `($80 − $60) / $60 = 33⅓%`.
8. Cap `$20,000 × 0.0025 = $50`. First contract costs `$0.45 × 100 + $2 = $47`, so one fits and two cost $94. Second quote costs `$0.55 × 100 + $2 = $57`, so zero fit. Choose the largest **whole-number** quantity whose total exposure stays at or below the budget; never round a fraction upward.
9. No. A short American-style option can be assigned following holder exercise; an after-hours move and exercise instructions may matter. Check exact product rules, last trading time, long-holder instruction cutoff, and the broker's procedures. A closing order must actually fill to remove the short-option exposure. [FINRA's assignment explanation](https://www.finra.org/investors/insights/trading-options-understanding-assignment) covers the risk.
10. `(2,015 − 2,000) × 100 = $1,500` cash; zero index shares arrive under the stated cash-settled contract.
11. The shares gain `(80 − 70) × 100 = $1,000`; assigned short call loses `(80 − 75) × 100 = $500` of that rise; premium received is `$200`; fees are `$2`. Combined P&L is `$1,000 − $500 + $200 − $2 = $698`. Equivalently, shares sold at $75 make `$500` over their $70 cost, plus $200 premium less $2 fees.
12. No. The premium multiplier and adjusted exercise deliverable are missing; the exercise payment and settlement terms also need checking. Confirm the exact series and applicable [OCC information memo](https://infomemo.theocc.com/infomemo/search-memo), then verify with the broker's contract display before calculation.
