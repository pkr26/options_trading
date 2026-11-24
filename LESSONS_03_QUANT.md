# Volume 3 — Quantitative tools for an options trader

**Sprints 13–18, weeks 49–72.** This volume starts with ordinary arithmetic. You do not need to know calculus or programming to begin. Spend about 10 hours a week, and extend a sprint when an exercise is still unclear. Read the lesson, reproduce its worked example without looking, do the exercises, and check the answers only afterward. A calculator or program can verify an explanation; it cannot replace one.

The goal is to think clearly about uncertainty, work with data without fooling yourself, and understand what an option-pricing model does. All prices and outcomes in worked examples are invented for teaching. They are not a trading strategy or a forecast. If you need a refresher on fractions and equations, use [Khan Academy Algebra Basics](https://www.khanacademy.org/mission/algebra-basics). For beginner statistics, use its [Statistics and Probability course](https://www.khanacademy.org/math/statistics-probability). The full [MIT 18.05 course](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/pages/syllabus/) formally expects multivariable calculus, so treat it as later study.

If you already write Python confidently, demonstrate that with a short script and spend Sprint 15's introductory-programming hours on the [executable lab](labs/README.md). Begin its payoff and cash-ledger stages during the foundations volume; do not wait until week 57 to test arithmetic in code. Continue the [math bridge](FOUNDATION_MATH_BRIDGE.md) and solve representative exercises by hand. Coding fluency does not establish knowledge of probability, inference, or contract terms. The original week numbers remain a default pace; a dated gate record determines actual progress.

---

## Sprint 13 (weeks 49–52): Probability is about possible outcomes

### Lesson

Imagine that you will toss a coin. Before the toss, the possible outcomes are heads and tails. That list is a **sample space**. An **event** is a set of outcomes, such as “heads.” A probability is a number from zero to one attached to an event. In this finite coin model, impossible events have probability zero and the whole sample space has probability one. Continuous models need more care: an exact value can have probability zero without being impossible, as with one exact point in a continuous price distribution. Probability one is then called *almost sure*, rather than a guarantee about every conceivable outcome. When you say an event has probability 0.20, you mean 20 chances in 100 *under the stated model*. You have not proved that nature follows the model.

Trading introduces more outcomes than a coin toss. A long option could lose its full premium, return some of it, or make more. A short position can have a large loss even when small gains happen often. This is why **win rate** is a poor standalone measure. To compare outcomes, use **expected value**, the probability-weighted average: multiply each possible payoff by its assumed probability and add the results. All payoffs in this chapter are after the assumed costs unless stated otherwise.

Suppose a hypothetical trade wins $1 with probability 0.90 and loses $12 with probability 0.10. Its expected value is 0.90 × $1 + 0.10 × (−$12) = **−$0.30 per attempt**. Nine wins and one loss in ten attempts would also produce $9 − $12 = −$3. A 90% win rate can therefore coexist with a losing process. The actual sequence may be better or worse than this average. A trader must be able to survive the possible loss, not merely quote the average.

You can turn this around and ask for the *break-even* win probability before costs. Let p be the chance of winning $1; then 1 − p is the chance of losing $12. Expected value is p × 1 + (1 − p) × (−12) = 13p − 12. Set that expression to zero: p = 12/13 ≈ **92.3%**. Once commissions or slippage are included, the required win probability rises further. This calculation still assumes the two payoff sizes and probabilities are stable, which is often least plausible when markets become stressed.

Sometimes a probability depends on information. The notation **P(A | B)** means “probability of event A given that B has happened.” For example, consider an event that happens on 10% of days. A warning lights up on 80% of event days and on 20% of non-event days. In 1,000 hypothetical days, about 100 are event days and 900 are non-event days. The warning appears on 80 event days and 180 non-event days. Among the 260 warning days, only 80 are event days. Thus P(event | warning) = 80/260 ≈ **30.8%**. The warning can be useful yet still wrong more often than right after it appears. The starting 10% **base rate** matters.

A **distribution** lists outcomes and their probabilities. Its mean is the expected value. Its **variance** describes how far outcomes tend to be from that mean, but a single variance number may conceal rare, severe losses. If two losses each have a 10% chance, their joint chance is 1% **only if the events are independent**. Market losses often arrive together; do not multiply probabilities without checking that assumption. A forecast of “a one-standard-deviation move” also relies on a model of returns. It is not a hard boundary.

In options, distinguish **real-world probabilities** (attempts to describe future outcomes) from prices. An option's implied volatility comes from market option prices through a model; it is not a reliable promise that a particular price path will occur. You will learn the pricing distinction in Sprints 17–18. For now, write down the possible payoff amounts, the assumptions behind any probabilities, and what happens if the tail outcome is worse than estimated.

### Four weeks of guided work

| Week | Ten hours of work |
| --- | --- |
| 49 | 2 h read this lesson and Khan's basic probability unit; 3 h solve fraction/probability drills; 3 h invent ten sample spaces; 2 h explain “event” and “probability” aloud without notes. |
| 50 | 2 h conditional probability lessons; 3 h draw 2×2 event tables; 3 h redo the warning example at 5% and 20% base rates; 2 h write why a warning is not certainty. |
| 51 | 2 h expected-value lessons; 3 h solve 20 payoff tables; 3 h compare win rates with expected values after fees; 2 h teach back the $1/−$12 example. |
| 52 | 2 h distributions and spread; 3 h exercises below; 3 h create three severe-loss scenarios; 2 h closed-note quiz and error review. |

### Practice — answer before reading the key

1. A game pays +$2 on 70% of attempts and −$6 on 30%. Find its expected value.
2. A game wins 90% of the time for +$1 and loses 10% for −$12. What happens over exactly nine wins and one loss?
3. Recalculate the warning example for 1,000 days if the event base rate is 20%, warning sensitivity remains 80%, and the false-warning rate remains 20%.
4. Two losses each occur with probability 0.10. When may you say their joint probability is 0.01? Why might that fail in a portfolio?
5. A distribution has outcomes +$2 with probability 0.50, $0 with probability 0.25, and −$3 with probability 0.25. Find expected value and probability of a loss.

<details><summary>Worked answer key</summary>

1. 0.70 × 2 + 0.30 × (−6) = 1.40 − 1.80 = **−$0.40**.
2. 9 × $1 − $12 = **−$3**. The high win rate did not cover the loss.
3. Event days: 200; warning on 0.80 × 200 = 160. Non-event days: 800; false warning on 0.20 × 800 = 160. P(event | warning) = 160/(160+160) = **50%**.
4. **Only if independent:** 0.10 × 0.10 = 0.01. Shared market shocks make portfolio losses dependent, sometimes strongly.
5. Expected value = 0.50 × 2 + 0.25 × 0 + 0.25 × (−3) = **+$0.25**. Loss probability is **25%**.

</details>

**Pass gate:** Explain expected value, base rates, conditional probability, and dependence without notes; solve all five exercises and two new payoff tables correctly. Complete the relevant Khan probability unit checks. A guessed probability must be labeled an assumption, never a fact.

---

## Sprint 14 (weeks 53–56): Statistics tells you how uncertain your evidence is

### Lesson

Probability starts with a model and asks what outcomes it implies. **Statistics** starts with observed outcomes and asks what you can reasonably infer. If a strategy shows 60 wins in 100 observations, the observed win rate is 60%. That number is an **estimate** from a **sample**, not the permanent win probability of a market process. A different set of 100 trades might show a different rate even if nothing fundamental changed. More importantly, option trade payoffs differ in size; a win-rate estimate does not answer whether the strategy makes money after costs.

A useful starting question is “What would we observe if there were no edge?” This is a **null hypothesis**. Suppose, in a deliberately simple coin-like example, the true win probability under the null is 50%, the 100 observations are independent, and every observation uses the same rule. The standard deviation of the win count is approximately the square root of 100 × 0.5 × 0.5 = **5 wins**. Sixty wins is 10 above the expected 50, or roughly two standard deviations away. A conventional two-sided normal approximation gives a p-value near 0.05. That is not a 95% probability that the strategy is good. It means an outcome at least this far from 50 could occur around 5% of the time under the *idealized null and assumptions*. Options trades often overlap, are regime dependent, and differ in size, so the coin-like calculation is not a valid final trading test.

Now imagine testing 20 independent, useless ideas at a 5% false-alarm threshold. Even when all ideas have no edge, the chance that at least one passes is 1 − 0.95^20 ≈ **64%**. Actual strategies are not independent either, but trying many variants and reporting the winner still creates a serious selection problem. Record every idea and parameter tried. Freeze the final rule before looking at the final test sample. A test that influenced your rule is development data, however you label it.

A **confidence interval** is a range made by a procedure with a stated long-run coverage rate under its assumptions. It is not a guarantee that a fixed unknown parameter lies inside the range for this particular sample. In the 60/100 example, a rough normal interval is 0.60 ± 1.96 × square root of (0.60 × 0.40 / 100), or about **0.50 to 0.70**. With small samples or extreme rates, use a better interval method; the rough calculation is for intuition. It already shows that a single observed 60% rate is imprecise.

**Worked dependence check:** Suppose six five-day returns were measured on six consecutive days. Each adjacent pair shares four of its five daily observations. Counting them as six independent five-day bets would overstate the information. In the [lab's statistics stage](labs/README.md), compare an independent-observation standard error with a moving-block resample of the dated P&L series. Vary block length and record the interval each time. The block method still relies on assumptions about how much dependence carries through time; its output is a sensitivity check, not an automatic certificate of significance. Preserve the original portfolio time series and every attempted rule in the trial log.

Financial data create special traps. **Autocorrelation** means today's observation can relate to yesterday's. Two five-day returns measured on adjacent days share four of five daily returns; treating them as independent exaggerates information. **Selection bias** occurs when your sample was chosen because its outcome looked appealing. **Survivorship bias** occurs when failed or delisted assets are missing. **Look-ahead bias** occurs when a test uses information not available at the simulated decision time. A strategy built only from today's surviving stocks and yesterday's final option settlement data may look attractive even though no trader could have followed it then.

Statistics cannot replace economic reasoning. Before testing, explain why a counterparty would repeatedly pay for your proposed exposure, why the reward may compensate for risk, and why competition has not removed it. After testing, examine average **net** payoff, drawdown, tail losses, costs, and a fair benchmark as well as uncertainty. The [original backtest-overfitting paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253) shows why repeatedly searching historical tests can select strategies that disappoint later. This is motivation to keep a complete experiment log, not a claim that any one statistical correction proves an edge.

### Four weeks of guided work

| Week | Ten hours of work |
| --- | --- |
| 53 | 2 h Khan sampling lessons; 3 h compute sample means and rates; 3 h compare multiple toy samples from one assumed process; 2 h describe “sample” versus “population.” |
| 54 | 2 h confidence interval and hypothesis lessons; 3 h reproduce the 60/100 example; 3 h study how changing sample size alters uncertainty; 2 h write what a p-value does and does not mean. |
| 55 | 2 h multiple testing; 3 h calculate false alarms for 5, 10, and 20 searches; 3 h inspect overlapping returns and a selection-bias story; 2 h create an experiment log. |
| 56 | 2 h read [RESEARCH_LAB.md](RESEARCH_LAB.md); 3 h exercises; 3 h critique three published or invented “high win-rate” claims; 2 h closed-note review. |

### Practice

1. A system has 6 wins in 10 trades. Is a 60% observed rate enough to establish a true 60% win probability? Explain.
2. Under a 50% independent-win null, what is the expected number of wins in 100 trials and the approximate standard deviation of that count?
3. With 20 independent tests, each at a 5% false-positive threshold, find the chance of at least one false positive.
4. Why are two consecutive rolling five-day returns not independent pieces of five-day evidence?
5. A researcher tunes an entry threshold after seeing performance from 2020–2024, then calls those same years “out of sample.” What is wrong?
6. An options study includes only stocks still listed today. Name the bias and one consequence.

<details><summary>Worked answer key</summary>

1. **No.** Ten observations carry large sampling uncertainty; costs, payoff size, dependence, and selection also matter.
2. Expected wins = 100 × 0.5 = **50**. Standard deviation = square root of (100 × 0.5 × 0.5) = **5**.
3. Probability none passes by chance = 0.95^20 ≈ 0.3585. At least one = **1 − 0.3585 ≈ 64.2%**, under the independence assumption.
4. They share four daily observations, so they carry overlapping information.
5. The years affected the rule. They are development data. An untouched later period is needed for a final test.
6. **Survivorship bias.** Excluding delisted or failed firms can exaggerate historical performance and understate losses.

</details>

**Pass gate:** Correct all six answers, present three critiques that identify costs, sample selection, and an unseen test period, and complete relevant Khan inference units. In the [statistics lab](labs/README.md), show how an overlapping event can cross a date split and how a chosen block length changes the illustrative uncertainty interval. Never translate a p-value into “probability this trade will win.”

---

## Sprint 15 (weeks 57–60): Python makes your calculations repeatable

### Lesson

You can compute returns with a calculator, but a research project may contain thousands of dated prices. A **program** is a set of exact instructions that can be rerun. It helps another person check your work and helps you catch mistakes that a spreadsheet may hide. Programming is not a source of trading advantage by itself; it is a way to make definitions and assumptions explicit.

If you have never coded, begin with [MIT 6.100L](https://ocw.mit.edu/courses/6-100l-introduction-to-cs-and-programming-using-python-fall-2022/). It was designed for students with little or no programming experience and includes videos and problem sets. The [official Python tutorial](https://docs.python.org/3/tutorial/) is useful afterward, but it explicitly assumes you already understand general programming. You need not finish all of MIT 6.100L in four weeks. Extend the sprint until loops, functions, lists, file reading, and errors feel routine.

Start with three ideas. A **variable** stores a value under a name. A **list** holds ordered values. A **function** accepts inputs and returns an output. A **loop** applies the same steps repeatedly. With closing prices 100 and 102, the simple return is (102/100) − 1 = 0.02, or 2%. With 102 and 101, it is (101/102) − 1 ≈ −0.98%. Returns are ratios, so a $2 move has a different percentage meaning when the starting price changes.

There are several ways to summarize a price path. A **simple return** is useful for the gain on one period of invested capital. A **log return** is ln(new price/old price), where ln is the natural logarithm. Consecutive log returns add across time, which simplifies some models; consecutive simple returns compound by multiplication. For example, a move from 100 to 110 and back to 100 has +10% and about −9.09% simple returns, whose sum is misleadingly positive. Their compounded wealth factor is 1.10 × 0.90909 ≈ 1.00. The log returns sum to zero. State which return definition you use before comparing studies.

The example below creates a tiny *synthetic* CSV file and reads it back. It checks date order and positive prices. It calculates simple returns and a sample estimate of annualized historical volatility from daily **log returns**. Log return means the natural logarithm of today's price divided by yesterday's. The square root of 252 is a conventional trading-day annualization factor. Four observed daily returns are far too few for a useful market estimate; here they merely test the code. Save the following indented code as a Python file named sample_returns.py and run it with Python 3:

    from pathlib import Path
    from datetime import date
    import csv
    import math
    import statistics

    rows = [
        ("2026-01-05", 100.0),
        ("2026-01-06", 102.0),
        ("2026-01-07", 101.0),
        ("2026-01-08", 103.0),
        ("2026-01-09", 102.0),
    ]
    path = Path("synthetic_prices.csv")
    with path.open("w", newline="") as handle:
        writer = csv.writer(handle)
        writer.writerow(["date", "close"])
        writer.writerows(rows)

    with path.open(newline="") as handle:
        loaded = list(csv.DictReader(handle))
    dates = [date.fromisoformat(row["date"]) for row in loaded]
    prices = [float(row["close"]) for row in loaded]
    assert dates == sorted(dates) and len(dates) == len(set(dates))
    assert all(math.isfinite(price) and price > 0 for price in prices)

    simple_returns = [
        prices[i] / prices[i - 1] - 1
        for i in range(1, len(prices))
    ]
    log_returns = [
        math.log(prices[i] / prices[i - 1])
        for i in range(1, len(prices))
    ]
    annualized_vol = statistics.stdev(log_returns) * math.sqrt(252)
    print("simple returns:", [round(x, 4) for x in simple_returns])
    print("annualized sample volatility:", round(annualized_vol, 4))

The **assert** lines are small tests. If a date repeats or a price is nonfinite or nonpositive, the program stops rather than silently producing a result. In real data you must also parse time zones, missing dates, splits, dividends, and option contract changes. This snippet is not yet an options backtest. It is a foundation for one. The [executable lab](labs/README.md) adds contract accounting, quote quality, timing, and research checks with supplied synthetic fixtures.

One frequent mistake is to confuse a code result with a correct answer. A script can faithfully repeat a wrong formula, wrong timestamp, or survivorship-biased universe. Write a hand calculation for one row and compare it with the program. Save the input data and code version. If you change a cleaning rule, record the change. Reproducibility means another person can obtain the same result from the same inputs; credibility also requires that those inputs were available when the simulated decision was made.

### Four weeks of guided work

| Week | Ten hours of work |
| --- | --- |
| 57 | 3 h MIT beginner lessons on variables, types, and conditionals; 3 h short programs; 2 h run and modify sample_returns.py; 2 h explain each line. |
| 58 | 3 h loops, lists, functions; 3 h rewrite the return calculation as a function; 2 h deliberately trigger an assertion; 2 h write what failed and why. |
| 59 | 3 h CSV/file lessons; 3 h add five synthetic rows; 2 h compare hand and program returns; 2 h save code and data with descriptive filenames. |
| 60 | 2 h plotting tutorial of your choice; 3 h make a dated closing-price plot; 3 h exercises and a reproducibility check; 2 h teach back why four returns cannot validate a volatility forecast. |

### Practice

1. A price rises from 100 to 110. Find its simple return.
2. It then falls from 110 to 100. Find that return. Does a +10% followed by this loss leave a gain?
3. What happens if the example CSV contains the same date twice? Why is stopping useful?
4. Which line would you change to use 365 calendar days rather than 252 trading days in the illustrative annualization? Does doing so alone make the estimate more reliable?
5. A program reads tomorrow's close to decide whether it would have bought today. Is it reproducible? Is it a valid historical decision rule?

<details><summary>Worked answer key</summary>

1. 110/100 − 1 = **+10%**.
2. 100/110 − 1 ≈ **−9.09%**. The final price is 100, so the net price gain is zero.
3. The uniqueness assertion fails and stops the script. A duplicate date could otherwise double-count one observation.
4. Change math.sqrt(252) to math.sqrt(365) **only if the observation interval and model warrant that convention**. It does not repair a four-return sample.
5. The code may be reproducible, but the rule has **look-ahead bias** because tomorrow's close was unavailable today.

</details>

**Pass gate:** Run the code as written; explain and hand-check every calculation; produce a CSV, a price plot, and a rerunnable script. If you already program well, demonstrate the same skill on an unseen CSV and complete the [lab's payoff, ledger, and quote-QA stages](labs/README.md) instead of repeating beginner syntax drills. If introductory programming remains difficult, repeat the sprint before working with option-chain data.

---

## Sprint 16 (weeks 61–64): Bad option data can create a fake edge

### Lesson

Before researching an options strategy, ask a simpler question: **What exactly was available at the decision time?** A daily closing stock price is not enough to reconstruct an option order. An option is identified by its underlying, call or put type, strike, expiration, and contract deliverable. A quote has a bid, ask, sizes, and timestamp. A signal also needs the underlying price, calendar, and information that was already public. If these pieces do not line up in time, a backtest can give itself knowledge no trader possessed.

A **point-in-time** dataset preserves the world as it appeared then. Imagine computing a strategy on January 10 using an earnings report published January 11. The program may run perfectly, but the simulated trade is impossible. Another subtle error is using an option's final end-of-day quote to decide a trade said to occur earlier that day. State the decision timestamp and the earliest executable timestamp separately. If data sources use New York time, UTC, or local computer time, convert them explicitly. Around daylight-saving changes, a fixed offset is not always enough.

For an option chain row, write a data dictionary. For example: underlying symbol and identifier; option root; call/put; strike; expiration; standard or adjusted deliverable; multiplier; quote date and time zone; bid/ask and displayed sizes; underlying price timestamp; volume; open interest; and source/license. The distinction between an ordinary 100-share contract and an adjusted contract matters because multiplying every premium by 100 can be wrong. Corporate actions such as splits, mergers, and special dividends may alter deliverables or symbols. [OCC information memos](https://infomemo.theocc.com/infomemo/search-memo) are the source for the particular contract adjustment; do not invent one generic split rule.

Consider these invented observations for the same standard 100-share call when you plan to decide at 15:45 New York time:

| Row | Quote time | Bid | Ask | First action |
| --- | --- | ---: | ---: | --- |
| A | 15:45 | $2.10 | $2.30 | Keep for inspection |
| B | 15:45 | $2.40 | $2.20 | Flag as crossed; investigate |
| C | 09:31 | $2.00 | $2.20 | Flag as stale for a 15:45 decision |
| D | 15:45 | $0.00 | $0.15 | Flag zero bid; determine whether an exit was possible |

For row A, buying at the displayed ask and immediately selling at the bid would lose ($2.30 − $2.10) × 100 = **$20 before fees**. That arithmetic is a conservative *illustration*, not a promise that either order would fill. Row B has bid above ask; this may reflect a crossed or asynchronous record and cannot be silently treated as an ordinary market. Row C is many hours old. Row D may be a real quote, but a long holder assuming it can sell at the $0.075 midpoint would be making an unsupported fill assumption. You can flag rather than automatically delete such records. The choice must be written before seeing strategy results, and the report must say how many rows each rule affects.

Two common biases require more than quote cleaning. **Survivorship bias** arises if you study only stocks listed today and omit names that disappeared. **Corporate-action bias** arises if you connect modern symbols or standard contract terms backward through splits or mergers. A historical option universe must include the contracts that existed on each date. The [Cboe DataShop EOD description](https://datashop.cboe.com/option-eod-summary) describes 15:45 and end-of-day option snapshots and says optional implied volatilities and Greeks are calculated at 15:45. It does not mean every historical quote is an executable opportunity; there is displayed size, latency, and potentially costly access. Confirm the product's fields and license before any purchase.

Data quality is not a glamorous strategy, but it is a prerequisite for honest research. Keep raw data untouched, produce a cleaned copy, write every exclusion rule, and manually reconcile sample rows against contract specifications. Report coverage by date, underlying, expiration, and moneyness; a strategy that works only where data are sparse or stale deserves extra suspicion. A missing observation is missing. It is not a zero return.

### Four weeks of guided work

| Week | Ten hours of work |
| --- | --- |
| 61 | 2 h read this lesson and Cboe product description; 3 h design a data dictionary; 3 h inspect ten delayed option-chain rows; 2 h identify each contract's deliverable. |
| 62 | 2 h learn timestamp and time-zone rules; 3 h flag stale/crossed/zero-bid cases in a toy table; 3 h compare underlying and option times; 2 h explain why same-day data may still leak. |
| 63 | 2 h read OCC corporate-action guidance; 3 h find an adjusted-contract memo; 3 h document what changed and what is unknown; 2 h make a decision-time checklist. |
| 64 | 2 h review survivorship; 3 h exercises; 3 h create a QA report on a small sample; 2 h redo a random five rows manually. |

### Practice

1. Why may a 09:31 option quote be unacceptable for a strategy that claims a 15:45 fill?
2. Row A above has a 100-share multiplier. What is the ask-to-bid round-trip cost before fees?
3. Should row B be accepted at face value? What should your report record about it?
4. An option root has changed after a merger. May you assume the old contract still delivers 100 shares of the old stock? Where do you check?
5. A program uses the full day's high and low to decide a trade at 10:00 that morning. Name the error.
6. Why can a universe of only companies listed today overstate a historical strategy's results?

<details><summary>Worked answer key</summary>

1. It may no longer describe the market at 15:45; bids, asks, sizes, underlying price, and volatility could have changed. Mark it stale under a predefined rule.
2. (2.30 − 2.10) × 100 = **$20**, before commissions and other costs.
3. **No.** Bid exceeds ask. Flag or investigate it and report how many such observations exist and how the cleaning rule affects results.
4. **No.** Check the exact series terms and relevant [OCC information memo](https://infomemo.theocc.com/infomemo/search-memo).
5. **Look-ahead bias:** later prices were unavailable at 10:00.
6. It omits firms that failed, merged, or delisted and may understate past losses: **survivorship bias**.

</details>

**Pass gate:** Deliver a data dictionary, raw-to-clean rule list, counts of every rejected or flagged condition, and a manual reconciliation of at least ten contract-days, including one adjusted or special-event case. Use the [supplied synthetic quote fixture](labs/README.md) to show that a later invalid quote cannot be silently replaced by an earlier favorable one. Stop if contract terms or timestamps cannot be explained.

---

## Sprint 17 (weeks 65–68): Replication explains an option's theoretical price

### Lesson

Two positions that will pay exactly the same amount in every possible future state should have the same price today in a frictionless market. If they did not, one could theoretically buy the cheaper payoff and sell the dearer payoff. This is the **no-arbitrage** idea. It is a pricing principle, not an invitation to assume free money in a real market: bid/ask spreads, funding, stock borrowing, exercise style, dividends, and timing can erase apparent gaps.

Start with a European call and put on the same non-dividend-paying stock, with the same strike and expiration. Call the current stock price **S₀**, strike **K**, call price **C**, put price **P**, annual continuously compounded interest rate **r**, and time to expiration in years **T**. At expiration, the call pays max(S_T − K, 0) and the put pays max(K − S_T, 0), where S_T is the stock price then. Their difference is always **S_T − K**. Check both cases: if S_T is above K, the call pays S_T − K and the put zero; if S_T is below K, the call pays zero and the put K − S_T, so call minus put is again S_T − K.

Owning the call and writing the put therefore reproduces the future payoff of owning one share while owing K at expiration. A bond that pays K at expiration costs K × exp(−rT) today. Matching today's costs gives **C − P = S₀ − K × exp(−rT)**. This is *European put-call parity* under the stated assumptions. [OIC's parity explanation](https://www.optionseducation.org/advancedconcepts/put-call-parity) uses the same non-dividend formula. At zero interest, with S₀ = K = $100, the call and put must have the same theoretical price. If C = $8, then P = $8 in this idealized case.

A **binomial tree** makes replication more concrete. Assume a stock starts at $100 and, after one period, can be $110 or $90. A $100-strike European call pays $10 in the up state and $0 in the down state. Consider a portfolio of **0.5 shares** and a loan of **$45** that must be repaid at the end. In the up state it is worth 0.5 × 110 − 45 = $10. In the down state it is worth 0.5 × 90 − 45 = $0. It exactly matches the call's payoff. At zero interest the portfolio costs 0.5 × 100 − 45 = **$5 today**, so the call's no-arbitrage price is $5 under this one-period model.

You can compute the same $5 by assigning a **risk-neutral probability** of 0.5 to each branch and averaging the payoffs: 0.5 × $10 + 0.5 × $0 = $5. That 0.5 is a mathematical weight that makes the stock's discounted price consistent with the tree; it does **not** say the true chance of the stock rising is 50%. A trader's expected profit requires real-world probabilities, costs, and risk capacity. This difference between pricing weights and actual forecasts is central to options research.

For a general one-period tree, the replicating share amount is the difference between the option's up and down payoffs divided by the difference between the stock's up and down prices. The remaining part of the option payoff is reproduced with lending or borrowing. With a nonzero interest rate, both that cash leg and the expected option payoff under risk-neutral weights must be discounted consistently. The exercise teaches *why* a model price follows from assumptions. It does not mean an individual can continuously hedge one contract at negligible cost or trade the model's theoretical price.

Real equity options are often American-style, so exercise can occur before expiration. Dividends also matter. A simplified European parity equality need not hold directly for American options on dividend-paying stocks. A one-period tree ignores jumps between its two states, changes in volatility, and difficulty hedging. Treat its $5 as a model value under visible assumptions, then test how changing those assumptions changes the result. The [MIT Finance Theory I options lectures](https://ocw.mit.edu/courses/15-401-finance-theory-i-fall-2008/pages/video-lectures-and-slides/options/) provide further examples after this lesson.

### Four weeks of guided work

| Week | Ten hours of work |
| --- | --- |
| 65 | 2 h no-arbitrage lesson; 3 h compare two identical-payoff portfolios; 3 h draw call-minus-put payoffs above and below strike; 2 h explain the idea aloud. |
| 66 | 2 h OIC parity reading; 3 h solve ten zero-rate parity problems; 3 h add positive interest and present value; 2 h list every assumption. |
| 67 | 2 h binomial-tree lesson; 3 h reproduce the 100/110/90 tree; 3 h change the up/down prices and calculate the replicating shares and loan; 2 h explain risk-neutral versus real-world probability. |
| 68 | 2 h MIT option lecture; 3 h exercises below; 3 h contrast European and American exercise; 2 h closed-note model-assumption check. |

### Practice

1. At expiration with K = $100 and S_T = $120, what is call payoff minus put payoff? Repeat for S_T = $80.
2. At r = 0, no dividends, S₀ = K = $100, and C = $8, what is P under European parity?
3. In the 100/110/90 tree, show both terminal values of 0.5 share minus a $45 loan. What is its initial cost?
4. Change the tree to up = $120, down = $80, K = $100, r = 0. Find the replicating share amount, loan, and call price.
5. Is a risk-neutral probability of 0.5 a forecast that the stock will rise half the time?
6. Give two reasons an observed stock-option call-put price difference might fail the simple no-dividend European equation without offering a usable arbitrage.

<details><summary>Worked answer key</summary>

1. At 120: 20 − 0 = **+$20**. At 80: 0 − 20 = **−$20**. Both equal S_T − K.
2. C − P = S₀ − K = 0, so **P = $8**.
3. Up: 0.5 × 110 − 45 = **$10**. Down: 0.5 × 90 − 45 = **$0**. Initial cost: 0.5 × 100 − 45 = **$5**.
4. Call payoffs are $20 and $0. Shares = (20 − 0)/(120 − 80) = **0.5**. Down-state shares are worth $40, so borrow **$40**. Initial cost = $50 − $40 = **$10**.
5. **No.** It is a pricing weight under the tree and interest-rate assumption, not an estimate of the real probability.
6. Examples: American early exercise, dividends, mismatched expiration or deliverable, financing/borrow costs, bid/ask spread, stale quotes, and inability to execute all legs simultaneously.

</details>

**Pass gate:** Derive call-minus-put terminal payoff in both price regions; solve two new binomial trees by replication; state parity assumptions and explain why the risk-neutral weight is not a trading forecast. Compare a European put model with a [small American put tree](labs/README.md), checking step convergence and the different exercise rights.

---

## Sprint 18 (weeks 69–72): Black–Scholes is a model, not a trading signal

### Lesson

The binomial tree had two possible future stock prices. A Black–Scholes–Merton model allows a continuous range of prices and assumes the stock's *log returns* follow a particular distribution with constant volatility. Under idealized conditions, continuous rebalancing of a hedge and no arbitrage lead to a formula for a **European** option. The model gives a disciplined common language for price and sensitivities. It does not reveal a “true” option value in the messy market.

Define the inputs before touching the formula. **S** is the current stock price, **K** the strike, **T** the remaining years, **r** a continuously compounded annual risk-free rate, and **σ** (sigma) an assumed annualized volatility. **N(x)** is the cumulative probability below x for a standard normal distribution. For a non-dividend-paying European call,

    d1 = [ln(S/K) + (r + σ²/2)T] / [σ√T]
    d2 = d1 − σ√T
    C = S N(d1) − K exp(−rT) N(d2)

You can use the formula without memorizing its derivation. The key is to understand its inputs and exclusions. For S = K = $100, T = 1 year, r = 0, and σ = 0.20, we obtain d1 = 0.10 and d2 = −0.10. Standard-normal tables or code give N(0.10) ≈ 0.53983 and N(−0.10) ≈ 0.46017. The model call value is 100 × (0.53983 − 0.46017) ≈ **$7.97 per share**. For a standard 100-share contract, that is approximately $797 in quoted premium if a market happened to transact at the model value. Actual bids and asks can differ.

The formula also lets you reverse the question: if the market price is observed, what σ makes the model price equal it? That σ is **implied volatility**. Implied volatility is an input backed out of a market quote using a model; it is not itself a forecast that realized volatility will equal it. Two strikes or expirations can have different implied volatilities, producing a **volatility smile or skew**. A model that assumes one constant σ for all states cannot explain every observed option price with the same σ.

The next code extends Sprint 15. Save it as bsm_demo.py. It uses only Python's standard library. The finite-difference calculation estimates the call's **delta** by repricing with S slightly above and below $100. This is a local sensitivity, not a promise about a large overnight move.

    import math

    def normal_cdf(x):
        return 0.5 * (1.0 + math.erf(x / math.sqrt(2.0)))

    def european_call(S, K, T, r, sigma):
        if not all(math.isfinite(x) for x in (S, K, T, r, sigma)):
            raise ValueError("inputs must be finite")
        if S <= 0 or K <= 0 or T <= 0 or sigma < 0:
            raise ValueError("invalid price, time, or volatility")
        if sigma == 0:
            return max(S - K * math.exp(-r * T), 0.0)
        d1 = (math.log(S / K) + (r + 0.5 * sigma**2) * T) / (
            sigma * math.sqrt(T)
        )
        d2 = d1 - sigma * math.sqrt(T)
        return S * normal_cdf(d1) - K * math.exp(-r * T) * normal_cdf(d2)

    def implied_vol_call(market_price, S, K, T, r):
        if not math.isfinite(market_price):
            raise ValueError("market price must be finite")
        lower = european_call(S, K, T, r, 0)
        if market_price < lower or market_price >= S:
            raise ValueError("outside finite-volatility call bounds")
        if market_price == lower:
            return 0.0
        low, high = 0.0, 0.5
        while european_call(S, K, T, r, high) < market_price:
            high *= 2
            if high > 1024:
                raise ValueError("could not bracket volatility")
        for _ in range(90):
            middle = (low + high) / 2
            if european_call(S, K, T, r, middle) < market_price:
                low = middle
            else:
                high = middle
        return (low + high) / 2

    model_price = european_call(100, 100, 1, 0, 0.20)
    h = 0.01
    delta_estimate = (
        european_call(100 + h, 100, 1, 0, 0.20)
        - european_call(100 - h, 100, 1, 0, 0.20)
    ) / (2 * h)
    print("call value:", round(model_price, 4))
    print("delta estimate:", round(delta_estimate, 4))
    print("IV for a $10 call:", round(implied_vol_call(10, 100, 100, 1, 0), 4))

Five departures from the simple model deserve immediate attention: stock prices can jump; volatility changes; dividends affect stock options; actual hedging is discrete and costly; and some contracts permit early exercise. Bid/ask spreads, liquidity, borrowing, and contract adjustments add more. If your calculation says $7.97 and the market asks $8.50, you have not proved the option is expensive: perhaps your volatility input is wrong, a dividend or event is omitted, or the spread absorbs any apparent gap. [MIT's pricing notes](https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/pages/lecture-notes/) develop the model more rigorously when your calculus and probability are ready.

The [executable model-validation lab](labs/README.md) extends this one-call teaching example to dividend-aware European calls and puts, put-call parity, an American put tree, strike-slice checks, and stress repricing. Its tests include zero stock value, nonfinite inputs, and a valid price whose implied volatility exceeds the old fixed 300% bracket. For each model, state what the price represents and which actual contract terms it leaves out.

### Four weeks of guided work

| Week | Ten hours of work |
| --- | --- |
| 69 | 2 h review the binomial tree; 3 h label every BSM input; 3 h reproduce the $7.97 example with a calculator; 2 h list model assumptions. |
| 70 | 2 h run bsm_demo.py; 3 h change S, T, and σ one at a time; 3 h compare numerical Greeks with earlier qualitative predictions; 2 h explain local approximation. |
| 71 | 2 h learn implied-volatility inversion; 3 h run the bisection function on several legal prices; 3 h draw an invented skew; 2 h separate market quote from model output. |
| 72 | 2 h read MIT's relevant pricing notes at your level; 3 h exercises; 3 h write a one-page model-limit report; 2 h closed-note Gate C review. |

### Practice

1. For S = K = 100, T = 1, r = 0, σ = 0.20, calculate d1 and d2.
2. Using N(0.10) ≈ 0.53983 and N(−0.10) ≈ 0.46017, calculate the call price to the nearest cent.
3. Run the code. What approximate call value and delta does it print? Explain the delta in words.
4. If an otherwise identical market call costs $10 rather than $7.97, is its model-implied volatility above or below 20%? Does that fact alone establish a bad trade?
5. List five concrete ways a real option or market can differ from the model.
6. A script calculates $8.00 while the displayed market is $7.90 bid/$8.50 ask. Can the script alone justify a buy or sell?

<details><summary>Worked answer key</summary>

1. d1 = (0 + 0.20²/2)/0.20 = **0.10**; d2 = 0.10 − 0.20 = **−0.10**.
2. 100 × (0.53983 − 0.46017) = **$7.966**, or about **$7.97 per share** before any contract multiplier.
3. About **7.9656** and **0.5398**. For a very small $1 stock-price rise with other inputs fixed, the model initially predicts roughly $0.54 more call value per share; the approximation changes as S changes.
4. **Above 20%**, because this call's model price rises with σ under the stated inputs. No: costs, model assumptions, event risk, and future realized outcomes remain unresolved.
5. Examples: jumps, changing volatility, dividends, early exercise, discrete hedging, transaction costs, bid/ask spreads, funding constraints, and illiquidity.
6. **No.** Buying at $8.50 or selling at $7.90 is different from transacting at $8.00; the model input may also be wrong.

</details>

**Pass gate:** Reproduce the code output, hand-calculate the at-the-money example, compute a finite-difference delta, explain implied volatility as an inversion of price, and name at least five violated assumptions. Add one [model-validation lab](labs/README.md) case that compares put-call parity or a call-strike slice with a deliberately broken input. Gate C also requires the Sprint 16 data audit and Sprint 17 replication exercise. Later, the full [MIT 15.450 syllabus](https://ocw.mit.edu/courses/15-450-analytics-of-finance-fall-2010/pages/syllabus/) is an advanced extension rather than required beginner reading.

