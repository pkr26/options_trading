# Options Research Lab

This lab turns an options idea into a decision that can be inspected, challenged, and reproduced. A profitable chart or a high win rate is not evidence of an edge by itself. For a historical contract-level performance claim, the research standard is **net performance under plausible execution and adverse market conditions, measured on data that did not choose the strategy**.

This is an educational research workflow for U.S. listed options. Sources rechecked October 26, 2026. It does not recommend a security, strategy, or position size. Contract rules, data products, fees, margin, and broker behavior must be checked again when a study is run.

Choose the evidence level **before** writing a confirmatory protocol: **A** validates accounting and chronology on explicitly synthetic cases; **B** compares published index histories and methodologies; **C** replays historical option contracts using suitable point-in-time data. Each level has a different defensible conclusion. Level A cannot measure market profitability. Level B cannot prove option-order fills from an index series. Level C can estimate historical net results under stated data and execution assumptions, then needs separate forward evidence. The [runnable apprenticeship](labs/README.md) supplies level A fixtures, expected behavior, and automated checks. Screen data access, licensing, timestamp fields, budget, and reproduction feasibility before committing to level C.

## The research record

Keep a versioned, append-only record for each experiment:

```text
research/<experiment-id>/
  hypothesis.md          # dated, written before inspecting test results
  evidence_level.md      # A/B/C, feasible data, source rights, permitted claim
  data_manifest.yaml     # source, license, timestamp, coverage, adjustments
  contract_rules.md      # A/C: exercise, settlement, multiplier, expiry
  methodology.md         # B: published index rules and unknown account fills
  code/                  # versioned ingestion and level-appropriate analysis
  tests/                 # A/C: payoff, chronology, fill, accounting checks
  runs/<run-id>/          # config, code commit, inputs hash, outputs, logs
  report.md              # results, failures, limitations, next decision
```

Use the files relevant to the chosen level. B needs published methodology and source series in place of a reconstructed contract ledger. Record the clock time and time zone of every market observation and simulated decision where applicable, and the release date of published series for B. Store raw data separately from cleaned data. Save the exact universe, data version, code commit, parameters, calendar, fees, and random seed used by each run as applicable. A second person should be able to rerun the report from the manifest. MIT's [Analytics of Finance](https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/pages/syllabus/) combines derivatives pricing, simulation, econometrics, estimation, and volatility modeling; its [notes and problem sets](https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/pages/lecture-notes/) are a useful technical standard for the lab.

## Study workflow

### 1. Write a falsifiable hypothesis first

Specify a claim appropriate to the evidence level. A/C specify the option universe, selection rule, entry and exit times, holding period, hedge rule, risk budget, and conditions expected to break the idea. B specifies published index and comparator series, methodologies, release dates, date alignment, and what would change the descriptive conclusion. State what result would make you reject the claim. Freeze the primary metric before viewing a genuinely reserved final segment. Record every parameter search, rejected variant, and change of mind; trying many versions and reporting only the winner inflates apparent performance. The [Probability of Backtest Overfitting](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253) explains why conventional holdout practices can fail after repeated strategy selection.

Example hypothesis template:

```text
Claim:
Economic reason someone would pay for this exposure:
Exact option and underlying universe, or B index/comparator series:
Observable inputs and when each becomes available:
Rules fixed before testing:
Primary outcome and benchmark:
Expected failure regimes:
Maximum parameter trials and decision rule:
Development / validation / genuinely untouched period, if available:
Evidence level, available data, and claims the data cannot support:
```

### 2. Build a point-in-time data set

For level C, first confirm a legally usable and affordable source. For each option observation retain the full contract identifier, underlying, expiration, strike, put/call, multiplier, deliverable, quote timestamp, bid, ask, sizes, volume, and open interest where supplied. Include contemporaneous underlying prices, distributions or dividends, rates, corporate actions, exchange calendar, and product-specific exercise and settlement terms. Reconstruct the **contracts that existed then** and the information visible at that time; do not select today's surviving symbols and project them backward. For level A, label every fixture synthetic and retain its generation rules and hashes. For level B, archive the published index series, current methodology, release dates, comparator series, and any methodology changes; do not fabricate the missing option quotes.

Reject or flag missing, stale, locked or crossed, zero-bid, impossible, and out-of-session quotes under written rules. Do not silently replace them with interpolated theoretical prices. Audit a random sample of raw rows against the vendor's source specification and manually reconstruct several option chains across ordinary days, earnings, dividends, splits, and expirations. Cboe's [EOD data specification](https://datashop.cboe.com/option-eod-summary) provides 15:45 ET and end-of-day NBBO snapshots; optional implied volatility and Greeks are calculated at the 15:45 snapshot. Its [intraday quote product](https://datashop.cboe.com/option-quote-intervals) provides interval snapshots. Confirm early-close timestamps, quote-size conventions, and whether the purchased product includes underlying index values; these vary by date and license. The [DataShop FAQ](https://datashop.cboe.com/faqs) notes that open interest is from the prior night's OCC report and that digit-bearing roots can identify adjusted, nonstandard options. [OCC volume and open-interest reports](https://www.theocc.com/market-data/market-data-reports/volume-and-open-interest/volume-query) can support cross-checks. Full historical option quotes generally require licensed data; a closing-price series alone is insufficient for a credible fill study.

**Data gate:** All levels identify source rights, observation dates, known missing fields, and the permitted claim. Level A publishes its synthetic rules, fixture hashes, and hand-checked cases. Level B reconciles the published index and comparator dates and explains methodology assumptions. Level C additionally publishes coverage by date and contract, missing and rejected quote counts, stale-quote rule, corporate-action treatment, and at least ten manually checked contract-days including one special-event case. Any unexplained C discrepancy in contract terms, observation time, or deliverable blocks the backtest.

### 3. Validate pricing and accounting before strategy results

Implement payoff and cash-flow accounting independently of the signal. Verify call and put payoff diagrams, put-call parity where its assumptions fit, the contract multiplier, fees, dividends, exercise/assignment, cash settlement or delivery, expirations, and hedges. Reconcile a hand-worked trade from entry to exit against code. Compare theoretical prices and Greeks with a second implementation; investigate differences in rate, dividend, calendar, exercise style, and volatility conventions. The original [Black–Scholes paper](https://www.journals.uchicago.edu/doi/10.1086/260062) derives a no-arbitrage European option model, while MIT's [15.450 lecture notes](https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/pages/lecture-notes/) cover arbitrage-free pricing, simulation, and model extensions. A theoretical price is a model output, not an executable quote.

**Accounting gate:** For A/C, unit checks pass for long and short legs, multi-leg cash flows, expiry outcomes, and a corporate action. Portfolio P&L must reconcile to starting capital plus all cash flows and marked positions on every date. For B, reconcile published index levels, methodology, and comparator returns without implying a trade ledger was reconstructed.

### 4. Model fills and costs explicitly

Never assume every order fills at the midpoint. Start with a conservative, reproducible rule using contemporaneous NBBO and visible size. Model limit-order nonfills, partial fills, leg risk, bid/ask, broker and exchange fees, hedge turnover, market impact for larger size, and slippage in stressed periods. A multi-leg strategy must be executable as a package at the assumed price or simulated with the risk of legging. A signal formed at a bar's close cannot trade at that same close unless the information and order timing make that possible.

For A/C, run at least three execution cases: optimistic modeled assumption, base, and adverse. An assumed midpoint fill is optimistic; its live feasibility is not established by a displayed quote. Compare model fills with observed paper fills when available, but do not treat simulator fills as live execution evidence. Calibrate with actual live execution records if they later exist. For B, audit the published index's own hypothetical execution assumptions and do not substitute them for actual account fills. [Muravyev and Pearson](https://academic.oup.com/rfs/article-abstract/33/11/4973/5732665) find that effective option spreads can be substantially below conventional quoted-spread estimates when traders time execution, while [de Silva, So, and Smith](https://academic.oup.com/rof/article-abstract/30/2/489/8301159) document large spreads and losses for retail option purchases around earnings announcements. Neither finding supplies a universal fill rate for this strategy; estimate its own costs.

**Execution gate:** For A, show that the program handles fills, nonfills, partial fills, and open exposure without claiming an edge. For B, explain the index methodology's costs and unknown live fill differences. For C, show net results under all three cases and the break-even extra slippage per contract. If a small fill adjustment erases a claimed result, label the hypothesis unproven.

### 5. Separate discovery from evaluation

Use chronological development, validation, and untouched final test periods where a genuinely unseen period can be reserved. Tune only on development data. Freeze rules before the final period. For repeated tuning or overlapping trades, use a walk-forward design with appropriate gaps or embargoes so one event does not leak into both training and testing. Level C reports results by market regime, underlying, expiration tenor, liquidity bucket, and calendar year. A reports synthetic case coverage and misses. B reports published index and comparator results by available periods and methodology regimes; a public history you already examined is descriptive, not an untouched confirmatory test. Include every failed trial in the experiment log; use multiple-testing controls or a backtest-overfitting estimate when searching many variants. A strategy that works only in one selected window has not passed.

**Validation gate:** Where a final segment was genuinely reserved, examine it once after the rules are frozen. Any subsequent change starts a new experiment with a new untouched period. For A, validate code on unseen synthetic cases. For B, state selection and methodology limits of the published series, especially if the entire public history was visible during selection. For C, report uncertainty intervals and the number of independent trades or events, not just the raw trade count; compare naive independent-trade inference with dependence-aware analysis on the portfolio series.

### 6. Compare against honest benchmarks

Choose the benchmark before seeing results. Depending on the exposure, compare with cash, the underlying total-return investment, a delta-matched position, a simple fixed-rule options strategy, or a public options index. Align starting capital, cash yield, financing, exposure, rebalance frequency, fees, and risk. The [Cboe BXM](https://www.cboe.com/us/indices/dashboard/bxm/) is a published S&P 500 covered-call benchmark; read its [current methodology](https://cdn.cboe.com/api/global/us_indices/governance/Cboe_BuyWrite_Indices_Methodology.pdf) and hypothetical-index assumptions before using it. For volatility-selling ideas, study the [variance risk premium](https://academic.oup.com/rfs/article-abstract/22/3/1311/1581057) and ask whether the apparent reward compensates for crash and liquidity risk. Historical option premia can change: [Dew-Becker and Giglio](https://www.nber.org/papers/w31833) report that the variance risk premium narrowed toward zero in the last 15 years of their sample ending in 2022, so a past premium is not a permanent edge.

For C, report total **net** return, sample length, drawdown, volatility, tail loss, exposure, turnover, capacity, fee and slippage drag, and return relative to the benchmark. For B, report published-index return and drawdown under its methodology and state account-specific fees, slippage, and capacity as unknown unless independently measured. A reports simulator correctness and modeled costs only. Annualize returns only when the observation period and compounding assumptions make that informative; never present a short sample's annualized rate without its underlying dates and cash flows. Win rate and premium collected are supporting statistics, never primary outcomes.

### 7. Stress the entire portfolio

For A/C portfolios, aggregate positions by underlying, sector, expiry, and correlated risk factor. Record delta dollars, gamma, vega, theta, directional notional, worst contractual loss where defined, cash required after exercise or assignment, and margin utilization where known. Reprice the portfolio under joint shocks: gap up/down, volatility level and skew changes, time passage, correlation breakdown, widening spreads, and reduced liquidity. Test both historical episodes and invented scenarios more severe than the training sample. A spread's displayed expiration max loss does not describe every interim funding or execution problem. For B, report the published index's observed stress-period behavior and methodology assumptions; use a separately labeled hypothetical portfolio for cash/assignment practice. Do not infer actual constituent fills or account funding from index levels.

OCC's [STANS margin overview](https://www.theocc.com/risk-management/margin-methodology) uses portfolio simulation plus dependence and concentration stress components at the clearing-member level; it is a useful model for thinking in portfolio scenarios, though its margin is **not** a personal loss limit. [Cboe's stress-test description](https://www.cboe.com/solutions/options-analytics/portfolio-margin-analytics/stress-tests/) covers price, volatility, time, and historical-event shocks. [IBKR Risk Navigator lessons](https://www.interactivebrokers.com/campus/trading-course/ibkrs-risk-navigator/) demonstrate what-if portfolio and margin scenarios.

**Risk gate:** A/C publish the largest modeled loss and cash requirement for every portfolio scenario, the concentration map, and a written response if a limit is breached. B publishes index drawdown and stress-period sensitivity, the unknowns that published levels cannot reveal, and a separate hypothetical cash/assignment stress exercise. No position is justified by average return alone.

### 8. Forward-validate and audit

For C, run the frozen system in shadow mode using only information available at each decision time. Timestamp the signal, intended order, observed market, hypothetical or paper fill, rejection, and reason for every action. Compare opportunity frequency, spread, modeled fill rate, slippage, Greeks, and P&L with the research assumptions. Maintain a daily risk dashboard and monthly discrepancy review. Stop or redesign when data integrity fails, execution diverges materially, or drawdown breaches the prespecified research limit. For A, preserve unseen synthetic cases and regression results. For B, preserve new published index and comparator values with release dates and methodology notices. Do not quietly retune any evaluation rule while its designated forward record is being measured.

**Forward gate:** Level C presents a dated, complete decision log, including days with no trades and orders that did not fill, and explains material backtest-to-forward differences. Level B tracks newly published index values and methodology changes; level A adds unseen synthetic regression cases. Neither B nor A should present this as forward evidence for an executable edge. Moving to real capital is a separate personal decision and should never follow automatically from a paper result.

## Capstones

| Evidence level | Deliverable | Passing evidence and limit |
|---|---|---|
| **A. Simulator validation** | Synthetic contract and quote audit, special-event ledger, nonfill and adjustment cases, clean-run tests and reproducible manifest. | Another reviewer can reproduce code behavior on seen and unseen cases. No market edge is inferred. |
| **B. Published-index analysis** | Published index methodology, dated history, matched published comparator and sensitivity to stated index assumptions. | Source series and return differences reconcile. Missing option fills are stated, not invented. |
| **C. Historical contract replay** | Preregistered economic hypothesis, point-in-time contract selection, cost-aware ledger, one untouched final test, benchmark, multiple-testing, stress and forward reports. | An independent reviewer reproduces net results, exclusions, sensitivities, cash/share obligations and discrepancies. Historical and forward uncertainty remain explicit. |

The advanced track can extend to implied-volatility surface construction, stochastic-volatility models, and dynamic hedging after these capstones. MIT's [2024 mathematics-in-finance course](https://ocw.mit.edu/courses/18-642-topics-in-mathematics-with-applications-in-finance-fall-2024/) provides problem sets and projects; [Gatheral and Jacquier](https://arxiv.org/abs/1204.0646) address arbitrage-free volatility surfaces. More complex modeling raises the standard of validation; it does not replace the data, execution, and risk gates above.
