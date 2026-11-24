# Executable options research apprenticeship

**All data in this directory are synthetic teaching data.** The symbols, quotes, forecasts, P&L, and dates were invented. The program does not connect to a broker or price feed. Its outputs establish whether the stated rules and accounting are internally consistent; they cannot establish a market edge or live fill rate.

This lab is for a learner who can already program in Python. If programming is new, first complete [Sprint 15](../LESSONS_03_QUANT.md). Work each arithmetic example by hand before checking it in code. Use Python 3.10 or newer; the project uses only the standard library.

From the project root, run:

```sh
python3 -m unittest discover -s labs -v
python3 labs/options_lab.py
```

The first command checks accounting, timing, pricing, research, and stress behaviors. The second runs the teaching report with the final forecast segment reserved. Only after fixing and dating a research rule should you run `python3 labs/options_lab.py --open-final`. Treat opening that segment as one evaluation of the frozen rule; a later change requires new forward observations.

## Inputs and their boundaries

| File | Use |
| --- | --- |
| [manifest.json](data/manifest.json) | Synthetic source statement, contract terms, assumptions, split, and SHA-256 hashes. `check_manifest()` stops if a fixture changes without a new manifest. |
| [quotes.csv](data/quotes.csv) | Fictional quotes with offset-aware times, bid/ask, sizes, one crossed row, and one zero-bid row. |
| [decisions.csv](data/decisions.csv) | Six prewritten fictional long-call decisions, including a nonfill and a rejected quote. |
| [daily_observations.csv](data/daily_observations.csv) | Twelve development and six validation rows of separate invented forecast and portfolio observations. These are **not** the P&L generated from `decisions.csv`. |
| [final_observations.csv](data/final_observations.csv) | Six reserved fictional forecast outcomes. Open only after writing the forecast evaluation rule. |
| [trial_log.csv](data/trial_log.csv) | An example of recording all three attempted variants, including poor validation results. Extend your own copy for further trials. |

`options_lab.py` checks a SHA-256 hash for each fixture, but hashes prove only that these particular files have not changed. They do not attest to market accuracy, vendor quality, or independent provenance. One crossed quote and one zero-bid quote exercise the classroom policy for unusable fills. A real zero bid can be genuine illiquidity; flag it and retain the raw observation and any held position rather than deleting its loss or inventing an exit. Visible size merely caps an illustrative assumed fill; queue position, routing, hidden liquidity, and adverse selection are not modeled. [IBKR's simulator documentation](https://www.ibkrguides.com/orgportal/aboutpapertradingaccount.htm) also identifies fill and combination-order limitations in paper trading.

The code uses Python floating-point arithmetic for concise classroom examples and rounds report fields for display. A real cash ledger should use integer cents or decimal arithmetic and reconcile every broker cash flow. The `toy_backtest` sample is restricted to one standard 100-multiplier fictional call; an open option is kept as an exposure with no finished P&L.

## Build skill in small steps

1. **Payoff and exercise ledger, beginning during the foundation lessons.** Use `Contract`, `expiration_profit`, and `Ledger`. Hand-check a standard $105 call bought for $3 at a $112 expiry value. Then sell one $100 call for $3 in a hypothetical $10,000 account and assign it at $110. The program must leave short shares and the corresponding cash, not simply erase the option. Try an adjusted 10-share deliverable with a 100 premium multiplier. The program handles a share-only adjusted deliverable; an actual adjustment can also involve cash or another asset, which requires the exact [OCC memo](https://infomemo.theocc.com/infomemo/search-memo).
2. **Pricing and model limits, after probability and replication.** Reproduce the $7.9656 European call value for `S=K=100`, one year, zero rate, and 20% volatility. Compare finite-difference delta with a smaller and larger step. Check put-call parity for matching European calls and puts. Invert the price of a $90 call; the implied-volatility routine expands its bracket instead of assuming volatility cannot exceed 300%. Compare an American put tree with the European put and check convergence as the tree gains steps. Use `call_slice_violations` on three same-expiry strikes; treat violations in *quotes* with care because non-synchronous or wide markets can create apparent violations.
3. **Quote QA and chronology.** Use `quote_flags` and `select_quote` to explain why two of the 13 quote rows are rejected. A valid decision requires a signal timestamp before the selected quote and an order time after it. The selected quote may be no more than five minutes old in this exercise. Change a quote so the latest row is crossed; the code should reject that decision instead of silently taking an earlier favorable row. Real product data require vendor-specific validation and corporate-action rules; [Cboe describes the fields and changing quote-size convention in one historical product](https://datashop.cboe.com/option-quote-intervals).
4. **Order and backtest accounting.** Run `toy_backtest` under optimistic, base, and adverse assumptions. For the base case, D1 is `(2.60−2.20)×100−$2=$38`; D2 is `−$42`. D5 has no entry fill, and D6 has no usable entry quote. Write down why each remains in the decision ledger. Change the entry limit or size and note how a nonfill or partial fill changes your outcome. An open residual position retains its entry price, cash outlay, and quantity for marking and review; this tiny demonstration intentionally does not compute P&L for an unclosed option. A midpoint fill is only an optimistic assumption here.
5. **Forecasts, dependent observations, and selection.** Before examining `final_observations.csv`, write the event definition, forecast date, Brier-score calculation, development baseline, chosen variant, primary outcome, and rejection rule. The example baseline is `5/12 ≈ 0.4167`, computed from development rows only. The toy report keeps the six final rows separate. Compare independent-observation uncertainty with `block_bootstrap_mean_interval`; vary block length and report how your conclusion changes. A moving-block calculation on 18 artificial observations does not justify a population claim. Use `label_event` to exclude a trade whose outcome crosses a development/validation boundary and preserve all variants in the trial log.
6. **Portfolio stress.** Build a hypothetical long call, put, or vertical portfolio using `stress_portfolio`. Show at least eight joint changes in stock price, volatility, elapsed time, and liquidation spread. The function reprices standard European options with one volatility input and an explicit haircut. Separately use `Ledger` to show possible shares and cash after assignment. This is a classroom stress engine: it does not compute broker margin, actual early exercise likelihood, a volatility surface, or executable liquidation prices.

The implementation rejects exit decisions dated before entry, fractional or boolean contract quantities, nonfinite opening cash, invalid displayed sizes, negative elapsed days, and negative liquidation haircuts. `Ledger` validates opening balances and rechecks its public methods, so direct field edits cannot silently create a fractional contract settlement. It models signed whole-share positions; fractional-share balances and cash-in-lieu adjustments need a separate explicit model. Failed validations leave balances unchanged. Quote sizes must be non-boolean integers, and zero/negative visible size blocks an assumed fill. Premium multipliers and adjusted share deliverables remain separate contract fields. A haircut is a cost subtracted from modeled value; entering it as a negative number would incorrectly improve the reported liquidation value. Zero stock value and zero volatility remain valid boundary scenarios.

The suggested record for each stage is: original hand calculation, code output, assumptions, failing counterexample, corrected result, and a one-paragraph explanation. A passing run of the supplied tests shows that the reference implementation behaves as specified on those tests. To pass a course gate, add an unseen case and explain the result without relying on the reference output.

## Three feasible capstone levels

| Evidence level | Appropriate project | Defensible conclusion |
| --- | --- | --- |
| A. Simulator validation | Extend these fictional inputs with adjustments, rejected quotes, funding and assignment tests. | The code follows its specified rules on audited cases. No market-performance inference. |
| B. Published-index analysis | Compare a published options index with a matched published benchmark, documenting methodology, dates, financing, and what the index assumed. | A descriptive comparison of published histories. It does not reconstruct executable option trades. |
| C. Historical contract replay | Use licensed point-in-time option quotes, product specifications, underlying prices, corporate actions, fees, and documented fill rules. | A conditional historical estimate with data, execution, uncertainty, benchmark, and forward limitations. |

Choose the level before [Module 21](../LESSONS_04_RESEARCH.md). The [research lab protocol](../RESEARCH_LAB.md) gives the full audit standard. A paid dataset or inaccessible tool is not required for levels A or B; a credible claim about historical contract-level execution requires suitable contract-level data.
