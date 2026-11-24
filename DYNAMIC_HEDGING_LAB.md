# Discrete hedge and option P&L lab

Use this fictional calculation after [Module 9](LESSONS_02_BEHAVIOR.md). It shows how an option's changing value, a stock hedge, cash, and execution costs fit into one account. Short stock is used here **only as a shadow calculation**; borrow availability, margin, interest, dividends, and real execution are excluded. This is not an entry-level live strategy. [OIC explains Greek sensitivities](https://www.optionseducation.org/advancedconcepts/understanding-options-greeks); they are local model readings, not guaranteed next prices.

## Data and first decision

Start with $6,000 cash. Buy one standard 100-share call at $5.00 per share, then model selling short **50 shares** at a $100 stock price. At this moment, the call's model delta is +0.50 per share, gamma +0.02 per $1 stock move, theta −$0.05 per day, and vega +$0.10 per one IV percentage-point change. Assume no opening fees, and treat short-sale proceeds as cash for the simplified accounting ledger. A real broker can restrict their use.

| Event | Cash | Call | Stock shares | Account equity under stated marks |
| --- | ---: | --- | ---: | ---: |
| Start | $6,000 | None | 0 | $6,000 |
| Buy call at $5 | $5,500 | +1 call worth $500 | 0 | $6,000 |
| Sell 50 shares at $100 | $10,500 | +1 call worth $500 | −50 | `$10,500 + $500 − $5,000 = $6,000` |

The long call's local stock exposure is `+0.50 × 100 = +50` share equivalents. The stock short is −50 shares, giving a near-zero **initial local delta**. It does not give zero risk.

## One day later: reconcile model and observed marks

The stock rises **$4 to $104**, IV falls **one percentage point**, and **one day** passes. The call is then marked at an invented **$7.30 per share**. Holding the initial Greeks fixed for a rough approximation:

```text
Call model change per share = delta × 4 + ½ × gamma × 4² + vega × (−1) + theta × 1
                            = 0.50 × 4 + 0.5 × 0.02 × 16 − 0.10 − 0.05
                            = $2.01
Model call mark           = $5.00 + $2.01 = $7.01
Observed call mark        = $7.30
Unexplained residual      = ($7.30 − $7.01) × 100 = +$29
```

The $4 stock move is large for a *local* Greek estimate; changing Greeks, the volatility surface, model inputs, and the invented mark can all contribute to the $29 gap. Do not label the residual as free profit.

At the observed marks **before rebalancing**, call P&L is `($7.30−$5.00)×100 = +$230`. Short-stock P&L is `−50×$4 = −$200`. Portfolio P&L is **+$30**, and equity reconciles to `$10,500 + $730 − 50×$104 = $6,030`. The initial-Greek model would have estimated call +$201 and stock −$200, or **+$1**; the $29 residual connects that estimate to the observed +$30.

Suppose the new approximate call delta is +0.58, or +58 share equivalents. Selling **8 more shares at $104** brings the short-stock count to −58. Assume this rebalance costs $2. Cash becomes `$10,500 + 8×$104 − $2 = $11,330`. The call remains worth $730 and the 58-share short is marked at `$58×$104 = $6,032`, so account equity is **$6,028**. Rebalancing changed exposure and cost $2; it did not create an immediate $832 gain from the short-sale proceeds.

## A second move and an executable exit

The next day the stock reference falls to **$100**. The call reference mark is **$4.90**. Before an exit, equity is `$11,330 + $490 − 58×$100 = $6,020`, a **$20 gain** from the start after the $2 rebalance fee. The hedge's result depended on the path and rebalancing choice.

Now assume an actual close requires buying 58 shares at the **$100.10 ask**, selling the call at its **$4.80 bid**, and paying a further **$2 total exit fee**. Cash after both fills is `$11,330 − 58×$100.10 + $480 − $2 = $6,002.20`; no positions remain. Final realized P&L under these fictional fills is **+$2.20**. This difference from the $20 reference-mark gain is the cost of crossing the stated stock and option quotes plus the exit fee.

## Fresh checks before the answer key

1. If the first stock move were **+$1** with IV unchanged and one day passing, what would the initial Greeks estimate for the call's value change per share and for the option-plus-50-share hedge before fees?
2. If the one-day $4 rise occurred but the option's *executable bid* were $7.10 instead of the $7.30 reference mark, what is the liquidation-style equity before rebalancing if the short stock can be covered at a $104.10 ask? State the assumption about fills.
3. At the +$4 snapshot, what is the approximate new share-equivalent delta, and what stock action would bring it toward zero? Why might the result differ from exactly zero one moment later?
4. Name four reasons a live account's cash, equity, or feasible trade could differ from this shadow ledger.

<details>
<summary>Answers and interpretation</summary>

1. Call estimate is `0.50×1 + ½×0.02×1² − 0.05 = +$0.46/share`, or **+$46 per contract**. A 50-share short loses **$50** on a $1 stock rise, so approximate combined P&L is **−$4** before fees. Gamma and theta still matter when first-order delta is offset.
2. Assuming fills at those specified prices and no additional fee, equity would be `$10,500 + $710 − 50×$104.10 = **$6,005**`, or **+$5** from the $6,000 start. Bid/ask and available size can change; this is a scenario, not a promised liquidation.
3. Approximate call delta is `0.50 + 0.02×4 = 0.58`, or **+58 shares** for the call, so selling about **8 more shares** offsets the current −50-share hedge locally. Gamma, IV, time, discrete shares, and trading delay can immediately change delta again.
4. Any four of stock-borrow availability or fees, margin requirements, restrictions on short-sale proceeds, dividends, financing costs, partial or failed fills, wider bid/ask, stale option marks, different model Greeks, corporate-action adjustment, and broker liquidation policy. Say which would affect funding versus P&L versus ability to maintain the hedge.

</details>

**Pass standard:** Reconcile cash plus marked option minus short-stock liability at every row; explain the $29 approximation residual; distinguish marks from executable bids/asks; and solve the fresh checks without the key. For a deeper research build, feed timestamped price paths into the pricing, ledger, and execution labs under `labs/`, while preserving the omitted real-world costs as explicit assumptions.
