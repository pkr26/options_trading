# Volume 4 — From options knowledge to defensible research

**Weeks 73–104 · eight four-week modules · 10 hours per week.** Complete [Volume 1](LESSONS_01_FOUNDATIONS.md), [Volume 2](LESSONS_02_BEHAVIOR.md), and [Volume 3](LESSONS_03_QUANT.md) first. This volume teaches how to investigate an options idea, see when the evidence fails, and audit a portfolio. Every price and return below is hypothetical. It is a teaching workbook, not a trading signal.

For each week, spend about two hours reading, three hours solving or building, two hours observing data, two hours writing the project artifact, and one hour reviewing mistakes. Extend a module until its pass test is met. Keep the exact inputs and dates behind every calculation.

The [executable lab](labs/README.md) gives small synthetic inputs and tested code for the calculations in this volume. It is an apprenticeship in accounting, data hygiene, and model criticism. In Module 21, choose a research evidence level based on available data: **A** validates a synthetic simulator, **B** describes published index histories, and **C** replays licensed historical option contracts. These levels have different pass claims. Only level C can make a conditional claim about the historical performance of the particular contract-level rule, and even it requires separate forward evidence.

## Module 19 (weeks 73–76): Read the volatility surface

### Lesson

You already know that **implied volatility** (IV) is the volatility input that makes a pricing model reproduce an observed option price. A single stock has many options: different **strikes** and different **expirations**. Put their IVs on a grid and you have a **volatility surface**. The surface is a map of prices translated into one model language; it is not a map of guaranteed future volatility.

Look first across strikes with one expiration. Suppose the 30-day $90 put has 28% IV, the $100 at-the-money option has 22%, and the $110 call has 20%. This pattern is commonly called **downside skew**: lower strikes carry higher IV. That difference may reflect demand for downside insurance, expected jumps, or other market forces. The observation alone does not tell you an option is cheap or expensive. You would need a forecast of its eventual payoff, the costs of trading it, and a reason your forecast differs from the market. [OIC explains historical and implied volatility](https://www.optionseducation.org/advancedconcepts/volatility-the-greeks).

Now look across expirations at a comparable level of moneyness. This is the **term structure**. If 30-day IV is 20% and 90-day IV is 24%, longer maturity has higher annualized IV. A large event between those dates could contribute, but the surface alone cannot identify its cause. To compare two tenors more carefully, use **total implied variance**, approximately `IV² × time`. The 90-day period contains the first 30 days plus the next 60, so subtracting the first period's total variance isolates the later interval in this simplified model. With comparable contracts and time measured in days, 30 days at 20% contributes `30 × 0.20² = 1.20` day-variance units; 90 days at 24% contributes `90 × 0.24² = 5.184`. The implied variance for the 60-day interval between them is `(5.184 − 1.20) ÷ 60 = 0.0664` annualized variance, giving an interval volatility of about `sqrt(0.0664) = 25.8%`. This is an illustration, not a direct prediction; dividends, forward prices, strikes, exercise style, model choice, and noisy quotes matter.

A surface drawn from bad contracts is worse than no surface. Check whether quotes are fresh, spreads are narrow enough to be useful, the underlying price and option quote are simultaneous, the contracts have standard deliverables, and the comparison uses similar **moneyness** (strike relative to the forward price) across dates. A split or special dividend can change deliverables. Do not smoothly draw through missing quotes and then treat the resulting line as observed market data. [Cboe's DataShop description](https://datashop.cboe.com/option-eod-summary) shows that even professional EOD datasets specify observation times and optional model-derived Greeks.

For the advanced pricing branch, check that a same-expiry **European call** slice declines as strike increases and remains convex in strike. The [lab function](labs/README.md) checks these necessary conditions on clean model prices. A violation in displayed quotes should trigger a timestamp, bid/ask, and contract-terms investigation before anyone interprets it as executable arbitrage. Compare model Greeks with finite differences and identify the limitation of applying one volatility to the entire surface.

### A qualified calendar no-arbitrage check

First use a deliberately narrow model: two **European calls on the same non-dividend-paying stock**, with the **same strike, premium multiplier, and share deliverable**, zero interest, no fees or spreads, and frictionless stock borrowing and funding. The contracts have no adjustments and differ only in expiration, `T1 < T2`. Under these assumptions the later call cannot cost less than the earlier call: `C(K,T2) ≥ C(K,T1)`. This is a necessary check, not a guarantee that the whole surface is valid. With rates, dividends, or different forward prices, use the appropriate normalization and contract terms; [Gatheral and Jacquier derive the more general calendar condition at fixed forward moneyness](https://arxiv.org/abs/1204.0646).

**Worked violation:** the stock is initially $100, and hypothetical 30-day and 90-day $100 calls deliver 100 shares each. Assume executable frictionless premiums of $4 and $3 per share respectively. Sell the shorter call for $400 and buy the longer for $300, retaining **$100**. The longer European call cannot be exercised at the shorter expiry. Instead, follow the resulting positions:

| Event | Cash and positions, excluding any later realization of the $100 initial credit |
| --- | --- |
| At `T1`, stock is at or below $100 and the short expires without exercise | No short-call payment or shares; retain the longer call, whose eventual payoff is nonnegative. |
| At `T1`, stock is $110 and the short call is exercised | Deliver 100 borrowed shares and receive $10,000 strike cash. Now hold $10,000 cash, −100 shares, and the longer call. Stock borrowing and unrestricted use of the proceeds are assumptions of this proof. |
| At `T2`, stock is $120 after that assignment | Exercise the long call for $10,000, receive 100 shares, and return the borrowed shares. The cash and stock position is closed; the initial $100 remains. |
| At `T2`, stock is $80 after that assignment | Let the long call expire; buy 100 shares for $8,000 and return them. Keep $2,000 plus the initial $100. |

The argument covers every later stock price after assignment: the $10,000 cash and long-call payoff meet the cost of covering 100 short shares because `100 × [100 − S(T2) + max(S(T2) − 100,0)] = 100 × max(100 − S(T2),0) ≥ 0`. If the short expires without exercise, the remaining long call has nonnegative payoff. Thus the $100 entry credit with no later negative net cash flow contradicts no arbitrage **inside this model**. A later premium of $5 instead of $3 passes this particular maturity check; it does not prove every strike, expiry, or quote is consistent.

Real stock options, stock borrow, funding restrictions, settlement conventions, and executable bid/ask prices can invalidate the proof's assumptions. This is a pricing-consistency exercise, not a retail trade recommendation. A short-leg obligation does not automatically exercise a remaining European long leg. A displayed midpoint inversion is also insufficient: selling at the nearer bid and buying at the later ask may eliminate the apparent credit.

Annualized IV need not rise with maturity. For example, 30 days at 40% gives `30 × 0.40² = 4.80` day-variance units, while 90 days at 30% gives `90 × 0.30² = 8.10`. IV falls but total variance rises, so that observation alone does not violate the comparable zero-rate/no-dividend calendar check.

**Common mistake:** saying “28% IV is high, so sell it.” High relative to what: its own history, realized volatility that will occur, neighboring strikes, or a model forecast? Each comparison answers a different question, and none by itself proves an edge.

### Four-week practice

| Week | Work for the 10 hours | Evidence |
| --- | --- | --- |
| 73 | Rebuild the definitions of IV, strike, expiration, moneyness, skew, and term structure with diagrams. | One-page plain-language explanation. |
| 74 | Collect dated delayed quotes for one liquid underlying on two expirations. Record bid, ask, timestamp, and contract terms. | Raw observation table, including rejected quotes. |
| 75 | Plot IV by strike for each expiry and IV by expiry near the money. Explain the shape without claiming profit. | Two labeled charts and a caveat list. |
| 76 | Repeat on another date or underlying; check whether changes could be data artifacts. Solve the qualified calendar example and a changed-number case. | Short comparison memo, corrected charts, and the two-expiry cash/share ledger with assumptions. |

### Try it, then check

1. On one expiry, IVs at strikes 90, 100, and 110 are 28%, 22%, and 20%. Which side has greater IV? **Answer:** The lower-strike side; this is downside skew in the example.
2. If 30-day IV is 20% and 90-day IV is 24%, compute the simplified 30-to-90-day forward IV. **Answer:** `sqrt((90×0.24² − 30×0.20²)/60) ≈ 25.8%`.
3. A contract's bid is $0 and ask is $4 while nearby strikes have tight markets. Should it be used uncritically in a smooth IV curve? **Answer:** No. Flag it under a written quote-quality rule and investigate; a model IV from an unusable quote may distort the chart.
4. Does a steep put skew prove puts will earn positive returns if sold? **Answer:** No. You need a net, risk-aware forecast tested against actual outcomes and tail losses.
5. Under the calendar model above, the 30-day $100 call costs $5.50 and the 90-day $100 call costs $4.80, each with multiplier and deliverable 100. Identify the failed condition and opening credit. The short is assigned at a $115 stock value; find cash and shares excluding the initial credit. Show the final cash including the credit if the stock is $125 or $90 at the later expiry. **Answer:** The later call is $0.70 cheaper, violating the qualified maturity check. Sell near/buy far gives `$70` credit. Assignment leaves `$10,000` cash, `−100` shares, and the long call; it does not exercise the long. At $125, exercising the long for $10,000 closes the shares and leaves `$70`. At $90, buying shares for $9,000 closes the short, the long expires, and cash is `$1,000 + $70 = $1,070`. The proof assumes zero rates/costs, no dividends, and frictionless borrowing/funding; it does not establish an executable real trade.
6. In the qualified comparison, 30-day IV is 40% and 90-day IV is 30%. Is the lower later IV sufficient to flag calendar arbitrage? **Answer:** No: total variances are `4.80` and `8.10` day-variance units, so they increase. Check comparable terms, forward moneyness, prices, and the model's assumptions rather than the IV ordering alone.

**Pass gate:** Deliver two reproducible charts with raw quotes, timestamps, contract specifications, and at least five data/model caveats. Explain the forward-variance arithmetic without claiming it forecasts realized volatility. Check at least one cleaned same-expiry call slice for strike monotonicity and convexity, and investigate any violation before interpreting it. Complete the calendar transfer case with correct opening credit, assignment cash/shares, surviving long leg, and both later outcomes. State all assumptions and why falling annualized IV alone is insufficient. Correct errors in a fresh changed-number case before advancing.

## Module 20 (weeks 77–80): Where could an option return come from?

### Lesson

Before testing a strategy, ask who is paying whom, for what risk, and why the opportunity might persist. An option position can earn or lose from several sources at once: the underlying's direction, realized movement versus IV, the changing price of insurance, time decay, dividends, interest, execution costs, and the way exposure is hedged. “Theta is positive” describes one sensitivity; it does not explain net expected profit.

Imagine a hypothetical short-option setup with a 90% chance of gaining $40 and a 10% chance of losing $500. Its expected result before costs is `0.90×40 + 0.10×(−500) = −$14` per trade. A 90% win rate can coexist with negative expectancy. If entering and exiting costs $6, expected net result is `−$20`. The numbers are invented, but the arithmetic is the discipline: list *all* outcomes, including rare ones. If probabilities are estimated from a small, calm period, stress them. For instance, a 15% loss probability changes the expectation to `0.85×40 − 0.15×500 = −$41` before costs.

Why might options sometimes have a premium? Insurance demand can make protection valuable; traders who absorb that risk may be compensated. But compensation for bearing crash risk is different from a free arbitrage. Other traders compete for the same premium. Hedging, capital, and liquidity costs can consume it. A [Dew-Becker and Giglio paper](https://www.nber.org/papers/w31833) reports a narrowing variance risk premium over the last 15 years of its sample, which ended in 2022. That is a historical finding, not a present-day trade instruction. The [original variance-risk-premium research](https://academic.oup.com/rfs/article-abstract/22/3/1311/1581057) is a starting point for understanding the mechanism.

Separate three questions in every research memo. **Mechanism:** Why would someone pay for the exposure? **Measurement:** What observable data would show you the premium existed? **Competition:** Why would the premium remain after market participants notice it? Then write a disconfirming explanation. A profitable backtest might simply have held a bull-market stock exposure, sold expensive-to-hedge crash insurance, or assumed fills that nobody could obtain. Compare it with cash, owning the underlying, or a simpler option strategy before celebrating an apparent edge.

**Common mistake:** calling premium collected “income” while ignoring the open liability. A credit received is a cash flow at entry; the final profit depends on the liability's value and what happens at exercise, assignment, or closeout.

### Four-week practice

| Week | Work for the 10 hours | Evidence |
| --- | --- | --- |
| 77 | Make a list of possible option return drivers and explain each in one sentence. | Mechanism map. |
| 78 | Work 20 expected-value problems with varied win rates and tail losses. Include fees. | Worked calculations and corrected errors. |
| 79 | Read one original paper and one exchange methodology; distinguish data finding from the authors' interpretation. | Two-page literature memo. |
| 80 | Write three competing explanations for one hypothetical strategy's backtest. | A mechanism, measurement, competition, and failure memo. |

### Try it, then check

1. A strategy wins $60 on 8 of 10 opportunities and loses $280 on 2. Average before costs? **Answer:** `0.8×60 − 0.2×280 = −$8` per opportunity.
2. If that strategy costs $5 per round trip, average net result? **Answer:** `−$13`.
3. Why is positive theta insufficient to establish an edge? **Answer:** Delta, gamma, vega, jumps, fees, and other exposures can outweigh time decay; theta is a local model sensitivity.
4. Name a fair comparator for a bullish call strategy. **Answer:** At minimum, a scaled underlying-stock position or cash, aligned by capital and risk; the exact comparator must be fixed before viewing results.

**Pass gate:** Submit a memo with one proposed mechanism, two plausible rival explanations, a fair benchmark, and a calculation that includes tail outcomes and costs.

## Module 21 (weeks 81–84): Write the test before seeing the result

### Lesson

Researchers can accidentally fool themselves by trying many rules and publishing only a winning one. Suppose you try three entry times, four expirations, and five exit rules. That is `3×4×5 = 60` variants, even before choosing an underlying or risk limit. The best historical result among 60 is likely to contain luck. This is **selection bias**. Bailey and coauthors show why backtest selection can overfit even with seemingly sensible holdout methods. Read their [original paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253) as you design a protocol.

A **falsifiable hypothesis** specifies a mechanism and a result that would count against it. A vague claim such as “buy cheap options” cannot be tested until “cheap,” “buy,” universe, dates, and outcomes are defined. A useful example is an *educational hedge study*: “For a hypothetical portfolio of index shares, a fixed monthly protective-put rule reduces worst drawdown during the test period, after full option costs, compared with unhedged shares; the reduction is worth the premium cost under a prespecified score.” This is a question to investigate, not a recommendation to buy puts. It requires exact strikes, dates, decision times, contracts, benchmark, and score.

Write a dated protocol for the chosen evidence level. For A/C, specify the **contract universe**, **signal**, **entry and exit** including nonfills and expiration, **risk**, **cost model**, **benchmark**, **primary metric**, **development period**, and **reserved final period**. Define missing-quote, split, holiday, and outage behavior. For B, specify published index and comparator series, methodologies, date alignment, primary comparison, known fee and financing assumptions, revision handling, and a later publication period only if you can genuinely reserve one. Exploring data to learn its structure is allowed; claiming a confirmatory test after you have seen its outcome is not.

Before freezing that protocol, complete a **data feasibility decision**. Record the data source, access and license, fields, timestamps or publication dates, coverage, relevant adjustment or methodology history, costs, and whether another person can reproduce the work. Choose level A, B, or C from the [lab's capstone table](labs/README.md). A published index series supports a descriptive comparison, but cannot supply missing option-order prices or prove a trade-by-trade backtest. A synthetic fixture can prove that your code accounts for specified cases, but cannot measure a market edge. If level C data are unavailable, write a protocol that makes a narrower claim at level A or B.

Imagine a signal generated from a 4:00 p.m. closing value. A protocol that fills an option at that same 4:00 p.m. quote may be using information that did not exist when the order would have been sent. The test must enter later or demonstrate an actual decision and execution sequence that could have occurred. This is **look-ahead bias**. In options, stale quotes, contract changes, and notional size make it easy to miss.

**Common mistake:** changing the main metric after seeing losses. A strategy can have high Sharpe, low drawdown, or high win rate by chance. Select a primary decision rule first, then report all relevant secondary outcomes honestly.

### Four-week practice

| Week | Work for the 10 hours | Evidence |
| --- | --- | --- |
| 81 | Rewrite three vague claims as falsifiable hypotheses and choose evidence level A, B, or C after checking data, access, cost, and auditability. | Before/after statements and a data feasibility sheet. |
| 82 | A/C: specify contract rules, decision times, and available fields. B: specify index/comparator sources, publication dates and methodologies. | Draft level-appropriate protocol. |
| 83 | Choose benchmark, observable costs, genuinely reserved dates if available, and stopping rules; count every variant tried. | Frozen protocol v1 and trial ledger. |
| 84 | Have a peer or the assistant challenge ambiguity and timing. Correct it before any genuinely unseen final test. | Dated protocol v2 and change log. |

### Try it, then check

1. How many variants are three entry times × four expirations × five exits? **Answer:** 60; record all of them, not just the winner.
2. Is “sell options when IV is high” testable as written? **Answer:** No. Define IV calculation, threshold, option type, selection, size, entry, exit, costs, and outcome.
3. A signal requires the 4:00 close. Can a backtest assume a fill at the 3:45 quote? **Answer:** No; the signal uses future information relative to that quote.
4. When should the untouched final period be examined? **Answer:** After development choices and the decision rule are frozen; examining it repeatedly turns it into development data.

**Pass gate:** A reader can implement the protocol without asking you to invent missing rules or inaccessible data. It identifies evidence level, source rights and observation or publication dates, one primary metric, an honest comparator, and a complete variant log. A/C reserve genuinely unseen cases or historical observations; B labels already public history descriptive and reserves later publications only where possible.

## Module 22 (weeks 85–88): Build auditable research at the chosen data level

### Lesson

A backtest is a historical simulation of rules. Its job is to ask what would have happened *if* you had followed a rule with the information and prices then available. It is not a time machine. An option's last trade may be stale, a displayed midpoint may not fill, and a closing price cannot be used before it is known. The [research lab](RESEARCH_LAB.md) gives the complete data manifest and accounting checks. **Level C** requires these contract-level replay checks. At **level A**, demonstrate those controls on explicitly synthetic inputs and report only software behavior. At **level B**, compare published histories and their methodologies, without inventing missing fills or a fictional contract ledger. The [lab](labs/README.md) provides level A's initial fixture and tests.

Beginning this module, keep a separate **forward record** under the frozen rules through Module 26. For level C, timestamp each real new signal, no-signal day, quote, and assumed or paper fill; compare them with historical assumptions. For level B, record the dates and versions of newly published index observations and methodology changes. For level A, add previously unseen synthetic cases and preserve original outputs. Do not describe level A or B as forward evidence for an executable trading edge.

For levels A and C, begin with a **trade ledger**, one row per hypothetical action: decision timestamp, exact option symbol, underlying, strike, expiration, multiplier, bid/ask, order side, assumed fill, quantity, fees, assignment or settlement, and resulting cash and position. Keep unfilled orders and rejected signals as rows too. Otherwise the backtest silently selects easy fills. Use quotes from the correct time and quote side as one conservative case. If the option is offered at $2.20 and bid at $2.00 at entry, a long buyer normally pays at most the chosen limit, not the $2.10 midpoint by default. Suppose at exit the bid/ask is $2.90/$3.10. Buying at $2.20 and selling at $2.90 gives `($2.90−$2.20)×100=$70` before fees. A midpoint-only simulation would show `($3.00−$2.10)×100=$90`, overstating this example by $20. With $2 total fees, the conservative net is $68. Real execution can be better or worse; the purpose is to expose assumptions.

For each date, reconcile `ending equity = starting cash + all cash flows + value of open positions`, under a stated marking rule. An option bought costs cash; it is also an asset while open. When it expires, exercise or cash settlement must follow its exact contract terms. Adjusted stock options can deliver something other than 100 shares. If the code treats every option as standard, its results can be wrong even if its signal is clever. The [OCC disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) explains why exercise and settlement terms matter.

Two quick checks catch many errors. First, hand-calculate several trades from the ledger and compare with code. Second, run a **no-signal test**: if your system executes trades with the signal switched off, the simulator is broken. Also inspect performance under optimistic, base, and adverse modeled fills. An optimistic midpoint fill remains an assumption until independent execution evidence supports it. A small slippage change that erases apparent profit is an important result, not a nuisance to hide.

**Common mistake:** marking an entry at the bid when you are buying and an exit at the ask when you are selling. That reverses the market sides and creates imaginary profits.

### Four-week practice

| Week | Work for the 10 hours | Evidence |
| --- | --- | --- |
| 85 | Confirm the level A/B/C data manifest and its permitted claim. For C, inspect 10 raw contract-days, including an event and expiration. | Source and coverage statement; C adds quote QA log. |
| 86 | For A/C, implement cash flows and exact contract terms before the signal. For B, reproduce the published methodology and align comparator dates. | A/C hand-reconciled examples; B methodology and benchmark reconciliation. |
| 87 | For A/C, implement entry, exit, nonfill, fee, and assignment assumptions under three fill cases. For B, audit index construction and published return comparisons. | Ledger and cost table or published-index comparison. |
| 88 | Reproduce from saved inputs, hand-check sample rows, write discrepancies, and continue the level-appropriate forward record. | Versioned report with its evidence-level label. |

### Try it, then check

1. Using the entry and exit quotes above, what is conservative long-option P&L before and after $2 fees? **Answer:** $70 before fees and $68 after fees.
2. What would midpoint-only P&L be, and how much more is it? **Answer:** $90, which is $20 more than the quote-side example before fees.
3. A daily dataset includes a 16:00 closing price; the rule supposedly traded at 15:45 based on it. What is wrong? **Answer:** It uses future information at the decision time.
4. A short American-style stock option is assigned. Can the ledger simply erase the option and leave no other position? **Answer:** No. It must record the resulting share and cash obligation under the contract terms.

**Pass gate:** Another person can reproduce the report. Level A: reconcile the synthetic ledger, rejected quotes, nonfills, and three modeled fill cases without claiming market performance. Level B: reproduce the published comparison and explain index assumptions without claiming contract fills. Level C: reproduce historical contract selection and ledger, hand-check samples, identify exclusions and unfilled orders, and recompute under three fill cases. A C project may require more than four weeks or a different dataset if the required fields are unavailable.

## Module 23 (weeks 89–92): Try to break your own result

### Lesson

A historical result can fail because a strategy was tuned to one period, one stock, one market regime, or one optimistic cost assumption. **Robustness testing** asks whether the result persists when reasonable conditions change. It does not mean endlessly adjusting the rule until a chart looks smooth. In Module 21 you froze a protocol and, where possible, reserved a final period. Now run the development and validation checks you declared, record *every* variation, and open a genuinely reserved final period only when the rule is frozen. Level A tests simulator behavior under new inputs. Level B checks published-index comparisons across dates, regimes, methodology assumptions, and comparator choices. A public history already examined is descriptive; track later published observations for new evidence. Level C tests the historical contract rule and its costs.

Split dates in time order. Randomly mixing days can leak information because options and market states are related across adjacent dates. If positions overlap, a single market event may affect several trades. Those trades are not fully independent observations. Separate a development period for designing the rule, a validation period for checking it, and a final later period for one honest evaluation. For level C, report each period's dates, opportunity count, net return, worst drawdown, and cost assumptions. For level B, report the published series' dates, methodology and comparator changes, returns and drawdowns. For level A, report case coverage and failures instead of a market return. If you change a rule after seeing a final result, that segment becomes development; you need new unseen cases or observations for a fresh final test.

Consider a toy result: 40 trades average **+$4** net per trade with a standard deviation of **$60**. If trades were independent and sufficiently well behaved, the standard error of the mean would be `60 ÷ sqrt(40) ≈ $9.49`. A rough 95% normal interval is `$4 ± 1.96×$9.49`, or about **−$14.60 to +$22.60** per trade. That wide interval does not establish a positive mean. Overlapping trades, fat tails, and selection of the best variant make this simple interval too optimistic; use it as a warning about uncertainty, not as a full statistical verdict. The [MIT probability course](https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/pages/syllabus/) provides the formal inference background after its calculus prerequisite.

The [statistics lab](labs/README.md) supplies a dated artificial P&L series, a separate synthetic benchmark column, a complete toy trial log, and a reserved final forecast file. Compare the independent-trade calculation above with moving-block intervals on a portfolio time series, then vary block length. Exclude event outcomes that cross a training/evaluation boundary. Score a dated probability forecast with the Brier score against a baseline estimated only on development data. Forecast quality is a separate question from whether an option can be traded profitably. An illustrative interval from a tiny synthetic sample cannot justify a market claim.

Change assumptions for a reason: double estimated slippage, remove the best five days, inspect crisis and quiet periods, shift the entry time to a feasible next quote, and vary strike or maturity slightly. If profitability requires one exact parameter or disappears under a small adverse fill, the claimed edge is fragile. Keep the failed versions in the record. The [backtest-overfitting paper](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=2326253) is a reminder that multiple tests increase the chance of a lucky winner.

The preceding strike, fill, and trade examples apply to level C and to synthetic simulator checks at level A. At level B, vary the published-index date window, benchmark, cash yield, fees stated in the methodology, and treatment of any methodology revision. Level B cannot recover a missing constituent-level trade ledger from index values. Across all levels, preserve every attempted choice and disclose what the available observations cannot resolve.

**Common mistake:** saying “40 profitable trades prove it.” A trade count ignores the range and dependence of outcomes, the size of losses, and how many variants were tried before those 40 were chosen.

### Four-week practice

| Week | Work for the 10 hours | Evidence |
| --- | --- | --- |
| 89 | Check chronological splits and all trial versions; A/C also check overlapping events where applicable. Continue the level-appropriate forward record. | Timeline and experiment ledger. |
| 90 | A: mutate input and cost assumptions. B: vary benchmark and methodology assumptions. C: test fees, fills, and nearby parameters. | Sensitivity table with failures. |
| 91 | A: report case coverage. B: compare published periods and regimes. C: report by year, event, tenor, and liquidity group. | Coverage or regime report with sample sizes. |
| 92 | A/C: open the reserved segment once. B: open a genuinely reserved later publication period if available; otherwise label the existing history descriptive. Continue the forward record. | Signed evaluation or descriptive report with evidence-level label. |

### Try it, then check

1. Compute `60 ÷ sqrt(40)` to two decimals. **Answer:** About $9.49.
2. Does a mean of +$4 with that standard error prove positive expected P&L? **Answer:** No. The approximate interval includes negative values, and the assumptions may fail.
3. You change the exit rule after viewing the final period and rerun on the same dates. Is it still an untouched test? **Answer:** No. Those dates helped choose the new rule.
4. A result comes only from one unusually profitable week. What should you report? **Answer:** The concentration, sample size, net results with and without the week, and the fact that the strategy's generality is unproven.

**Pass gate:** All levels preserve tried variants, dated splits, sensitivity results, and a candid conclusion. A demonstrates simulator and analysis behavior under unseen synthetic cases. B quantifies published-history and comparator sensitivity, stating methodology and trade-data limits; claim an untouched test only if later public observations were genuinely reserved. C adds an untouched historical segment, adverse fills, concentration, dependence-aware uncertainty, and a conditional contract-level estimate. A/C show overlapping-event exclusion where applicable; B explains dependence in the published return series without inventing trade events.

## Module 24 (weeks 93–96): Risk belongs to the whole portfolio

### Lesson

A position can be small by itself and large as part of a portfolio. Two option trades tied to the same index may both lose in a crash. A portfolio risk report adds exposures by underlying, sector, expiry, and the market events that move them together. It also asks how much cash or stock exercise and assignment could require. Risk is a path through time, not only a line at expiration on a payoff chart.

Consider two hypothetical standard five-point-wide vertical credit spreads, each opened for a $1 credit. For an **intact**, standard, one-to-one spread with matching expiry and deliverable, theoretical maximum expiration loss per spread is `(5−1)×100 = $400`, before fees. Two could lose **$800** together. In a $20,000 practice account that is **4%** of equity. Under the sample [risk policy](RISK_AND_OPERATIONS.md) of at most 1% aggregate modeled loss, the limit is $200, so even one such contract would fail the rule. Do not divide correlated risk by two merely because there are two tickets. Assignment, after-hours movement, fees, and forced liquidation can add funding and execution complications beyond an intact-spread diagram.

The **Greeks** summarize local sensitivities. If the portfolio has net delta equivalent to **+40 shares**, a $5 downward move suggests about `40×(−$5)=−$200` from delta *at the starting point*. Gamma changes delta as price moves; vega changes value as IV moves; quotes may widen. A stress test therefore reprices all positions under several simultaneous changes. Include a down gap with IV rising, an up gap with IV falling, time passing, a dividend or earnings event, a liquidity squeeze, and one-leg assignment. Calculate both mark-to-market loss and the cash/share obligation. [Cboe describes price, volatility, time, and historical-event stress](https://www.cboe.com/solutions/options-analytics/portfolio-margin-analytics/stress-tests/). [OCC's STANS](https://www.theocc.com/risk-management/margin-methodology) is an institutional example of portfolio scenario thinking; its clearing-member margin method is not a personal safety threshold.

A conservative risk limit cannot make a bad strategy good, but it can prevent a learning account from depending on one event. Set limits in cash terms and check the **smallest contract**. If one contract exceeds the limit, the valid action is to stay in simulation. Do not invent a higher limit to fit the trade. Record decisions *not* to trade, because restraint is part of the process you are auditing.

For A/C, use the [lab's standard-European stress function](labs/README.md) as a starting calculation, then build a separate cash/share ledger for exercise and assignment. Test eight joint price, IV, time, and liquidity changes; include a full underlying wipeout as a severe boundary case for puts. The simple pricer does not model a volatility surface, broker margin, dividends, or American exercise. Report those omissions next to the results and use actual product specifications when moving beyond the teaching fixture. For B, analyze published index drawdown and stress periods, then complete a clearly separate hypothetical portfolio stress exercise for assignment and funding practice.

**Common mistake:** summing theoretical max losses while ignoring the temporary shares, margin, or liquidity needed if a short American-style leg is assigned. The [FINRA assignment guide](https://www.finra.org/investors/insights/trading-options-understanding-assignment) provides concrete cases.

### Four-week practice

| Week | Work for the 10 hours | Evidence |
| --- | --- | --- |
| 93 | A/C: map specified portfolio positions and exposures. B: identify published index risk exposures and data limits. Continue the level-appropriate record. | Exposure or methodology map. |
| 94 | A/C: hand-calculate position loss and funding in eight scenarios. B: locate stress periods in index history and begin a separate hypothetical portfolio exercise. | Scenario worksheet with source label. |
| 95 | A/C: add correlated gaps, IV shocks, wider spreads, and funding needs. B: test index/comparator sensitivity and finish the hypothetical portfolio exercise. | Revised stress table with limitations. |
| 96 | A/C: write a limit-breach response. B: explain index risks and what an account-level limit would still need. Practice the end-of-day check on the hypothetical portfolio. | Written risk response and checklist. |

### Try it, then check

1. What is the theoretical expiration loss of one five-point credit spread sold for $1, assuming standard matching legs? **Answer:** `(5−1)×100 = $400`, before fees.
2. What is the aggregate for two, and what percent of $20,000 is it? **Answer:** $800, or 4%.
3. Does a net delta of +40 guarantee only $200 loss after a $5 downward gap? **Answer:** No. It is a local approximation; gamma, IV, time, and execution also change.
4. If a rule permits $200 aggregate modeled loss but the smallest contract risks $400, what does the rule imply? **Answer:** Do not open it under that policy; continue in simulation or study a different exposure.

**Pass gate:** A and C reproduce eight joint-shock scenarios on a specified synthetic or historical portfolio, account for assignment and cash needs, show concentration, and state an action before each risk limit is crossed. B reports the published index's observed drawdowns and stress periods, explains what its methodology can reveal, and marks assignment funding and executable exit prices as unobservable from index values alone. B also completes a separately labeled hypothetical portfolio stress exercise for operational learning, with no claim that it reconstructs the index.

## Module 25 (weeks 97–100): Choose one field to investigate deeply

### Lesson

Options trading contains several professions. A portfolio manager may use puts to manage downside exposure; a volatility researcher may compare implied and realized movement; a systematic trader may define repeatable index-option rules; an event researcher may study earnings; a market maker needs quoting, hedging, technology, and substantial operational support. Options on futures add another contract system. Knowing the same Greek names does not make the work interchangeable.

Revisit the **feasibility test begun in Module 21** when choosing a long-term specialization. Ask four questions: (1) What specific question excites you enough to study for years? (2) What data are needed, and can you legally and affordably obtain them? (3) What technology, time, and capital would implementation require? (4) Can you measure a fair benchmark and the main way the idea could fail? For example, market making cannot be credibly backtested by pretending to buy at every bid and sell at every ask. Quote placement, queue priority, nonfills, hedging, fees, inventory, and adverse selection are the work. If you cannot observe those, choose a narrower research question rather than claiming a market-making edge.

Here are six possible research tracks. **Hedging and overlays:** measure how much a put or collar reduces drawdown and how much return it costs. **Volatility relative value:** compare contracts across strike and tenor, with careful model and execution checks. **Systematic index options:** compare an explicit rule with a published methodology such as [Cboe's BXM covered-call index](https://www.cboe.com/us/indices/dashboard/bxm/) and its [methodology](https://cdn.cboe.com/api/global/us_indices/governance/Cboe_BuyWrite_Indices_Methodology.pdf). **Event options:** align earnings announcements and quote timestamps; distinguish the event move from the paid IV. **Market microstructure:** study quotes, auctions, and execution rather than promising easy spread capture. **Options on futures:** begin with [CME's separate curriculum](https://www.cmegroup.com/education/courses/curriculum-all-about-options) because the underlying, multiplier, margin, and settlement can differ from stock options.

Worked decision example: A learner has 10 hours a week and no paid option history. A full intraday relative-value backtest needs quote-by-quote data they cannot yet access. They can compare **published BXM daily index history** with an underlying total-return benchmark as an educational study, while clearly labeling both as published indices. Faithfully replicating BXM's option trades would require historical option quotes and methodology details, often with paid data. The appropriate choice for this module is the study they can **actually audit**. That judgment says nothing about which strategy will make money. Avoid buying data or a course simply because its marketing promises an edge.

**Common mistake:** trying to master all six tracks at once. Specialization creates a research question narrow enough to falsify.

### Four-week practice

| Week | Work for the 10 hours | Evidence |
| --- | --- | --- |
| 97 | Compare at least three tracks using interest, data, skills, time, capital, and failure modes; continue the level-appropriate forward record. | Feasibility matrix. |
| 98 | Read two primary sources in the chosen track, including product specifications or a published index methodology; continue the forward record. | Annotated source notes. |
| 99 | Build a small, reproducible study or simulation with a comparator; continue the forward record. | Notebook or written calculation. |
| 100 | Write a one-page argument against your conclusion and revise the feasibility judgment; continue the forward record. | Specialization memo. |

### Try it, then check

1. Why is buying at every bid and selling at every ask a bad market-making backtest? **Answer:** It ignores who gets filled, queue position, informed orders, hedging, fees, and inventory risk.
2. Does a futures option necessarily have the same 100-share deliverable as a stock option? **Answer:** No. Check that product's CME contract specification and settlement rules.
3. What is a fair question for a protective-put overlay? **Answer:** Whether the measured drawdown reduction, after premiums and costs, is worth the foregone return under a fixed objective, versus unhedged ownership.
4. If a necessary dataset is unavailable, what is a defensible result? **Answer:** Narrow or defer the study and document the limitation. Do not fill missing data with favorable assumptions.

**Pass gate:** One feasible track, a small reproducible project, at least one comparison, and a written account of the skills/data still missing.

## Module 26 (weeks 101–104): Defend the work in an independent audit

### Lesson

The final project is an **evidence bundle**, not a victory presentation. An auditor should be able to see the original question, evidence level A/B/C, every variant tried, data and code versions, decision timestamps, and the level-appropriate ledger, methodology, benchmark, risk checks, and forward record. Level C includes fill and fee assumptions, risk-limit breaches, empty days, rejected orders, and failed hypotheses. Level A preserves failed synthetic cases; level B preserves index revisions and methodological limitations. Selective reporting is itself a failed process.

Reconcile money before interpreting skill. The following is a **level C trade-ledger illustration**. Suppose a hypothetical study of 100 trades shows **$2,400 gross profit measured at frictionless reference-mid prices**, **$300 commissions**, and **$700 execution slippage relative to those mid prices**. Net trading profit is `$2,400−$300−$700=$1,400`. If gross profit had already used actual fills, deducting slippage again would double-count it. If a $200 data expense is also part of running the research, project net after that expense is **$1,200**. Starting with $20,000, paying that expense from the project capital, and assuming no other deposits or withdrawals gives $21,200, a **6%** total project return for the *stated sample dates*. Keep trading and research expenses separate in the report so the reader can reconcile both. If a fair benchmark ended at $21,400 from the same $20,000 starting amount, the project trailed it by **$200**, or one percentage point of initial capital, before comparing risk.

Suppose equity reached $22,000, then fell to $19,800 before recovering. The peak-to-trough drawdown was `(22,000−19,800)÷22,000=10%`. A positive ending return did not erase the interim risk. Check that the trade ledger really supports the equity path and that the account had enough buying power and cash when required. If the project has only a few months of forward decisions or one market regime, call the result preliminary. Do not annualize a short sample into a career claim. An independent reviewer should try to reproduce calculations and find a case that breaks the thesis. If they find an error, preserve both the original and corrected report.

Your conclusion can be **reject**, **inconclusive**, or **continue forward research**. The capstone passes when the work is honest and reproducible, including a negative result. Real capital remains a separate personal decision subject to [the risk guide](RISK_AND_OPERATIONS.md), broker permissions, finances, and continuing evidence. Neither this course nor a simulator certifies profitability.

**Common mistake:** calling a strategy “verified” because the historical and paper charts both rise. A paper simulator can give unrealistic fills, and both periods may share the same favorable regime. [IBKR documents its simulator limitations](https://www.ibkrguides.com/orgportal/aboutpapertradingaccount.htm).

### Four-week practice

| Week | Work for the 10 hours | Evidence |
| --- | --- | --- |
| 101 | A: reconcile simulation cases. B: reconcile source index and comparator series. C: reconcile every trade, cash flow, and forward shadow record. Reproduce from a clean run. | Level-appropriate ledger or source/methodology manifest. |
| 102 | A: report case coverage and failures. B: report published return, drawdown and methodology sensitivity. C: report net results, benchmark, tail risk, costs and forward differences. | Level-appropriate audit and limitations report. |
| 103 | Give the bundle to a knowledgeable reviewer and ask for counterexamples; continue the level-appropriate forward record. | Questions, found issues, and responses. |
| 104 | Present the revised work and state reject/inconclusive/continue with reasons; preserve the complete record and earlier report. | Final report and preserved earlier version. |

### Try it, then check (the arithmetic questions below use the level C illustration)

1. What is trading net after $2,400 gross, $300 commissions, and $700 slippage? **Answer:** $1,400.
2. What is project net after a further $200 data expense, and return on $20,000 without cash flows? **Answer:** $1,200 and 6% for the full sample, not an annualized rate.
3. What is drawdown from $22,000 to $19,800? **Answer:** $2,200 ÷ $22,000 = 10%.
4. If the comparator earned 7% over the same sample and starting capital, did 6% outperform? **Answer:** No; it lagged by one percentage point before adjusting for different risks.
5. Can an inconclusive result pass the course? **Answer:** Yes, if data, assumptions, full results, limits, and errors are honestly documented and reproducible.

**Final pass gate:** A second person can reproduce the calculations and understand why the conclusion follows from the chosen evidence level. At level A, only software behavior is established; at B, a comparison of published histories; at C, a conditional net, dated, risk-aware estimate whose execution and forward limits are explicit. The [research lab](RESEARCH_LAB.md) supplies the full audit specification. Future expertise comes from repeating this cycle across different market conditions and updating claims when evidence changes.
