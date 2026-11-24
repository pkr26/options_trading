# Options operations casebook

Use these fictional accounts to practice the mechanics in [Volume 1](LESSONS_01_FOUNDATIONS.md) and the [risk guide](RISK_AND_OPERATIONS.md). Work on paper before opening the answer section. An account ledger has **cash, shares, each open option, pending orders, and equity** at every step. A mark is an estimate of liquidation value, not a promised exit. An order request is not a fill or a confirmed cancellation.

Unless a case says otherwise, options are American-style physically settled stock options, each standard contract has a premium multiplier and exercise deliverable of 100 shares, quoted premiums are per share, and fees, interest, taxes, stock borrowing, and dividends are excluded. These simplifications are for arithmetic only. Real series and deadlines require the exact [OCC contract adjustment memo](https://infomemo.theocc.com/infomemo/search-memo), [ODD](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document), and broker procedure. [FINRA describes one-leg assignment and after-hours exercise risk](https://www.finra.org/investors/insights/trading-options-understanding-assignment).

For every case, answer five questions: (1) What is actually held or owed after each event? (2) What cash moves? (3) What is the marked account equity under the specified prices? (4) What can still happen before the position is truly closed? (5) Which product or broker rule would have to be checked in a real account? Correct every multiplier, share, settlement, and funding error before passing the operational gate.

## Worked case 1: one spread leg is assigned

At the start, cash is $10,000 and there are no positions. Buy one $100 call for $8 and sell one $105 call for $5, same expiration. The combined entry is a $300 debit. Before expiration, the short $105 call is assigned while the stock is $112. Later, a hypothetical quote lets you sell the still-open long $100 call at a **$12.40 bid**, and the stock ask is **$112.10**. Assume the broker permits the temporary short-stock position; real buying-power treatment can differ.

| Event | Cash | Shares | Open options | Equity under stated marks |
| --- | ---: | ---: | --- | ---: |
| Start | $10,000 | 0 | None | $10,000 |
| Spread entry | $9,700 | 0 | +1 $100 call; −1 $105 call | Depends on current quotes |
| Short $105 call assigned | $20,200 | −100 | +1 $100 call | $20,200 − $11,200 short-stock liability + $1,240 long-call bid = **$10,240** |
| Buy 100 shares at $112.10 and sell the long call at $12.40 | $10,230 | 0 | None | **$10,230** |

The assignment sells 100 shares at $105 and adds **$10,500 cash**. It does not exercise the long call. The chosen exit pays `$112.10 × 100 = $11,210` to cover the short shares and receives `$12.40 × 100 = $1,240` for the long call: `$20,200 − $11,210 + $1,240 = $10,230`. That is a **$230 gain before excluded costs** from the $10,000 start, given these exact hypothetical fills. The $10 mark difference between $10,240 and $10,230 is the stated stock mid/reference versus ask. The long call may have time value, so exercising it instead can discard value; compare executable alternatives and broker constraints. The temporary stock short can require buying power, trigger liquidation, or expose the account to later price movement.

## Worked case 2: an adjusted contract has two different numbers

For this classroom example, an adjusted call retains a **100 premium multiplier** and a $50 strike after a 1-for-10 reverse split, while its **exercise deliverable is 10 new shares**. The new stock is $550. A long holder paid a quoted $1 premium before this snapshot. The account began with $10,000 cash. Assume this precise adjustment is confirmed by its OCC memo and the holder elects exercise; then the 10 shares are sold at $550 each.

| Event | Cash | Shares | Open options | Equity at $550 per new share |
| --- | ---: | ---: | --- | ---: |
| Start | $10,000 | 0 | None | $10,000 |
| Buy adjusted call: $1 × **100** | $9,900 | 0 | +1 adjusted call | Depends on quote |
| Exercise: pay $50 × **100**, receive **10** shares | $4,900 | +10 | None | $4,900 + $5,500 = **$10,400** |
| Sell 10 shares at $550 | $10,400 | 0 | None | **$10,400** |

The modeled profit is `$5,500 − $5,000 − $100 = $400`. Multiplying the premium by 10 or delivering 100 new shares would each be a different and serious error. Real adjusted options can include cash or other property; read the actual memo. [OIC's reverse-split example](https://www.optionseducation.org/news/splits-happen) illustrates a deliverable of 10 shares while the multiplier remains 100.

## Worked case 3: a closing price does not resolve assignment

An account starts with $10,000. It sells one $100 put for $2, receiving $200. The stock closes at $101 on expiration day; after hours it falls to $96. Assume a holder submits a valid exercise instruction and this short put is assigned. At the assignment snapshot, use $96 to value the acquired shares.

| Event | Cash | Shares | Open options | Equity |
| --- | ---: | ---: | --- | ---: |
| Start | $10,000 | 0 | None | $10,000 |
| Sell put | $10,200 | 0 | −1 $100 put | Depends on put quote |
| Assigned: buy 100 shares at $100 | $200 | +100 | None | $200 + $9,600 = **$9,800** |

The account has an unrealized **$200 loss** at the $96 mark after keeping the $200 premium. It needed **$10,000 cash or permitted financing** to accept 100 shares even though the displayed premium was only $200. The $101 close did not promise expiry without assignment. The eventual result depends on the later stock sale and costs. A broker's holder exercise and do-not-exercise deadline, and the writer's notification timing, must be checked separately; [OIC explains exercise and assignment](https://www.optionseducation.org/optionsoverview/exercising-options).

## Fresh cases: solve before checking

Write a ledger, not only a final P&L number. The supplied probabilities, marks, and fills are assumptions in these fictional exercises.

**A. Uncovered-call gap.** Cash starts at $10,000. One $110 call is sold for $1.50 without shares or another option. The call is assigned after the stock reaches $180. Mark the resulting short shares at $180. Show cash, shares, equity, loss from the starting account, and what happens as the stock price keeps rising. This is a risk exercise, not an allowed practice position under the sample policy.

**B. Dividend and early assignment.** A trader is short one $100 call on stock at $102.40. The option ask is $2.60. A declared $0.80 per-share dividend has an ex-dividend date approaching. Compute the ask's time value using these simplified values, explain why assignment is plausible but not certain, and state the cash/share position and dividend exposure *if* assignment produces a 100-share short position that remains short across the ex-date. Do not assume a submitted buy-to-close order has filled.

**C. Cash-settled index option.** A fictional European-style A.M.-settled index call with $100 multiplier and $5,000 strike costs $15 per index point. Trading ends when the index is at 5,005, but the official settlement value used for the contract is 5,012. Calculate entry cash, settlement cash, net P&L, and share deliverable. Explain why the last trading quote alone could not settle the contract. Verify real product specifications before applying this example; [Cboe distinguishes settlement conventions](https://www.cboe.com/tradable_products/sp_500/spx_weekly_options/specifications).

**D. Liquidity shock.** One long standard option was bought at $2.30. Before fees, an exit market is $2.00 bid / $2.40 ask; under stress it becomes $1.40 bid / $2.60 ask. Compute the immediate sale result in each case. A sell limit at $2.20 is entered while the bid is $2.00; may the ledger record a fill merely because the later bid rises above $2.20? Name the missing order evidence.

**E. Cancellation pending.** Cash starts at $10,000. A buy limit for **two** contracts at $1.50 has **one confirmed fill** and a request to cancel the remaining contract is still pending. Fees are $0.65 per filled contract. Someone proposes a new buy for two more at the same price. What are the confirmed position and cash now? If every live remainder and new order fills at $1.50, what is the total position and cumulative premium plus fees? What state must be confirmed before another order is considered?

**F. Failed spread leg.** Cash starts at $10,000. A trader intends to buy one $100 call at $4 and sell one $105 call at $2. Instead of a confirmed package fill, only the **short $105 call sale** executes. The stock later reaches $130. Mark the short call at its $25 intrinsic value. Show cash, open position, marked equity, and why the intended $200 spread debit does not describe this account. No such unsecured legging is allowed by the sample beginner policy.

**G. Pause with open loss.** A fictional account began the day at $10,000, had no external cash flows and no closed trades, and is now worth $9,890 after marking its open positions under its stated quote-side rule. Under the sample 1% daily equity-loss pause, calculate the decline and state what happens to new entry orders, pending cancellations, and existing exposure. Would reporting zero *realized* loss avoid the pause?

<details>
<summary>Answer key and remediation — open after finishing A–G</summary>

**A.** Credit is `$1.50 × 100 = $150`; cash becomes $10,150. Assignment sells 100 shares at $110, adds $11,000, and leaves **−100 shares**, so cash is $21,150. At $180 the stock liability is $18,000; marked equity is **$3,150**, a **$6,850 loss** from the $10,000 start. A further $1 stock rise adds about $100 loss to this short-stock position. The theoretical short-call loss before assignment has no fixed upper bound. The account may be unable to meet margin requirements well before this snapshot.

**B.** Simplified intrinsic value is `$102.40 − $100 = $2.40`; ask time value is `$2.60 − $2.40 = $0.20` per share. The $0.80 dividend exceeds that time value, making early call exercise economically plausible for a holder, subject to other details. The writer cannot predict which holder will exercise or whether this contract will be assigned. If assigned, the account delivers **100 shares at $100**, receives **$10,000**, loses the short call, and holds **−100 shares** if it did not already own shares. A short stock position across the ex-date can owe **$80** in dividend-related payment under the assumed 100-share short; actual stock-price changes and account treatment also matter. Check the broker's position, deadline, and financing details.

**C.** Entry pays `$15 × 100 = $1,500`. Official settlement pays `max(5,012 − 5,000, 0) × 100 = $1,200`. Net is **−$300** before costs. There are **no delivered shares** in this fictional cash-settled case. The 5,005 last trading observation is distinct from the 5,012 settlement value.

**D.** Selling at the original $2.00 bid yields `$200 − $230 = −$30`; at the stressed $1.40 bid it yields `$140 − $230 = −$90`, both before fees. A sell limit of $2.20 can remain unfilled. A later quote alone does not prove the order's queue priority, route, presence, size, execution, or cancellation status; require an actual fill confirmation, or label the fill assumption in a simulation.

**E.** One confirmed contract costs **$150 premium + $0.65 fee**; cash is **$9,849.35** and position is **+1 contract**. The remaining one is still live until cancellation is confirmed. If it and both new contracts fill, there are **+4 contracts** and cumulative premium plus fees are `$600 + $2.60 = $602.60`, leaving **$9,397.40 cash** and four open options. Confirm the original order ID and cancellation/fill status, account positions, and available risk budget before considering any further order. A pending cancellation is not a completed cancellation.

**F.** The short-call sale adds `$2 × 100 = $200`, cash becomes **$10,200**, and there is **−1 $105 call**, with no long call. At stock $130, its intrinsic liability is `$25 × 100 = $2,500`, so marked equity is **$7,700**, a **$2,300 loss** at this snapshot. Actual ask to close may be higher. The unrealized long leg does not protect anything, and a further stock rise has no fixed theoretical loss limit for this standalone short call.

**G.** Equity fell `$10,000 − $9,890 = $110`, or **1.10%**, so the illustrative 1% daily pause triggers despite zero realized losses. Stop new risk orders, inspect all actual positions and order IDs, confirm cancellation of unnecessary resting entries, and manage existing exposure under the written contingency plan. The pause does not itself guarantee that a resting order vanished or that an open position closed.

For any miss, identify whether the error was **premium multiplier, deliverable, sign of stock, funding, mark versus fill, order status, or broker rule**. Recalculate it without the key, then solve a changed-number version. Operational errors require a fresh correct attempt before advancing.

</details>
