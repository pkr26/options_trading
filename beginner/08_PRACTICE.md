# Module 8 · Practice the whole decision with pretend money

[Course home](../README.md) · [Previous: risk](07_RISK.md)

Do one lesson per day in 10–15 minutes. Lesson 63 has four small cases: do one case per day, then check them. A notebook and calculator are enough; no brokerage account, subscription, deposit, or programming is required.

All symbols, quotes, timestamps, fills, probabilities, balances, and fees in these exercises are invented. Unless a case says otherwise, assume one standard U.S. stock or ETF option has a 100 premium multiplier and 100-share deliverable, is American-style and physically settled, and has no contract adjustment. Taxes, dividends, borrowing, and interest are excluded from numerical ledgers unless stated. Fees are classroom assumptions, not a broker's fee schedule.

## Lesson 57 · Paper practice measures what you can explain

**Time: 5–8 minutes. One idea:** a simulator result is evidence about practice, not proof of market profit.

**Paper trading** means rehearsing decisions with pretend money. You can do it entirely on paper: read a case, write a ticket, apply the case's stated fill rule, record the cash flows, and explain the result. It is useful for finding arithmetic mistakes and gaps in your understanding.

A simulator cannot promise that a live order would have filled, that assignment would happen the same way, or that you would feel the same while real money was at risk. For example, IBKR describes top-of-book simulated fills and limited combination-order handling in its paper system. Those are that provider's documented limitations, not a statement that every simulator works identically. [IBKR paper-account documentation](https://www.ibkrguides.com/brokerportal/aboutpapertradingaccounts.htm).

**Worked example:** Your notebook buys at an assumed $1.20 and sells at an assumed $1.50, without fees. The modeled result is `($1.50 − $1.20) × 100 = +$30`. You have demonstrated a payoff calculation conditional on two assumed fills. You have not shown that either fill was available in a real market.

**Try it:** A paper app shows +$500 after five trades. Name one thing it may demonstrate and two things it cannot establish on its own.

<details>
<summary>Check your answer</summary>

It may demonstrate that you recorded or executed the simulator's instructions correctly, if the record supports that. It cannot by itself establish live fill quality, a dependable market edge, realistic assignment handling, or future results. Save its assumptions and the complete record, including rejected and unfilled ideas.

</details>

## Lesson 58 · A quote belongs to a particular time

**Time: 5–8 minutes. One idea:** record when the market was observed, not just when you looked at it.

A **quote notebook** records the underlying; exact option expiration, right and strike; multiplier and deliverable; bid, ask and their sizes in contracts; quote timestamp with time zone; viewing time; data source; delay label; and whether the relevant product session is open. If any field is unknown, write “unknown.” Last trade and bid/ask are different fields.

**Worked example:** An invented option snapshot is timestamped `2026-11-13T10:00:00-05:00`. You view it at `10:16:00-05:00`. It is at least 16 minutes old at viewing. A 15-minute delay label does not turn the displayed $1.30 ask into today's executable offer. Some data products intentionally delay snapshots; Cboe's specified interval dataset describes a 15-minute delivery delay. Check your particular source rather than assuming all data share that delay. [Cboe Option Quote Intervals](https://datashop.cboe.com/option-quote-intervals).

Market hours, holidays, and product sessions matter too. A displayed timestamp from the last session is not a fresh quote just because the page refreshes. You can practice from supplied fictional snapshots without pretending they are current prices.

**Try it:** Quote time is `14:02:00-05:00`; viewing time on the same date is `14:20:00-05:00`. How old is it? If the option's session status is unknown, what should your paper record say?

<details>
<summary>Check your answer</summary>

It is 18 minutes old. Record the original time, viewing time, delay information and “session status unknown.” Do not label a hypothetical fill as a contemporaneous executable price. You may still study it as a clearly labeled historical or fictional snapshot.

</details>

## Lesson 59 · An order instruction is different from a fill

**Time: 6–10 minutes. One idea:** unfilled quantity remains unfilled.

Write a paper ticket with the full contract, **buy to open** or **sell to close**, whole-contract quantity, order type, per-share limit, and time in force. Then write a separate fill record. An intended order is not evidence of execution.

For this lesson only, use a deterministic classroom rule: a buy fills at the displayed ask if that ask is at or below its limit, up to the displayed ask size. A sell fills at the displayed bid if that bid meets its limit, up to bid size. Ignore queue priority and later quote changes. Real quotes do not guarantee fills; this rule is merely a calculation assumption.

**Worked example:** An invented option has `$1.10 bid × 4 contracts / $1.30 ask × 2 contracts`. Buy to open three contracts with a $1.20 limit: no fill under our rule, because $1.30 exceeds $1.20. With a $1.30 limit, two fill at $1.30; one remains unfilled. At an assumed $1 fee per filled contract, outflow is `2 × $1.30 × 100 + $2 = $262`. The unfilled contract has no premium outlay in this exercise.

**Try it:** You own two contracts. Bid is $1.50 for one contract; ask is $1.70 for four. A paper sell-to-close order for two has a $1.50 limit. Apply our rule and a $1 fee per filled contract. What remains open? Would a $1.60 sell limit fill under this snapshot rule?

<details>
<summary>Check your answer</summary>

One fills at the $1.50 bid. Net receipt is `$150 − $1 = $149`. One option remains open and needs its own mark and later decision. A $1.60 sell limit has no fill under this rule because the bid is only $1.50. Real order outcomes would require actual execution evidence.

</details>

## Lesson 60 · Close the ledger before naming the profit

**Time: 5–8 minutes. One idea:** profit is net cash received minus net cash paid for a completed position.

For a long option, buying to open is a cash outflow. Selling that same contract to close is a cash inflow. Include both sides' fees. Neither action exercises it in this example, and no shares change hands. Once every contract is closed, the round-trip result can be computed from cash alone under these assumptions.

**Worked example:** One invented call is bought at $1.40, with a $0.80 entry fee. Cash flow is `−$140 − $0.80 = −$140.80`. Later it is sold to close at $1.75, with a $0.80 exit fee. Cash flow is `+$175 − $0.80 = +$174.20`. Net realized result is `$174.20 − $140.80 = +$33.40`. With no other cash flows, a $1,000 starting cash balance ends at $1,033.40.

An unsold option's displayed mark is an estimate of open value, not a completed cash receipt. A partial sale leaves open exposure. Keep realized cash flows and open valuation separate so you do not erase an inconvenient remaining position.

**Try it:** Buy one paper put at $2.10 with a $1.25 fee; later sell to close at $1.65 with a $1.25 fee. Find each net cash flow and the completed result. Are shares acquired?

<details>
<summary>Check your answer</summary>

Opening flow is `−$210 − $1.25 = −$211.25`. Closing flow is `+$165 − $1.25 = +$163.75`. Result is `$163.75 − $211.25 = −$47.50`. No shares are acquired or delivered because this case specifies an option sale to close, with no exercise or assignment.

</details>

## Lesson 61 · Rehearse assignment one leg at a time

**Time: 7–10 minutes. One idea:** a spread's other option does not automatically settle an assigned short leg.

A **leg** is one option position within a strategy. American-style short options can be assigned before expiration. Owning a related long option does not mean the broker automatically exercises or sells it when the short is assigned. Record shares, cash and the remaining option separately. [OIC's assignment FAQ](https://www.optionseducation.org/referencelibrary/faq/options-assignment).

**Worked example:** Start with $10,000 paper cash and no shares. Sell one $50 put for $2.00 and buy one $45 put for $0.70; both have the same expiration. Assume zero fees in this example. Net option credit is `$200 − $70 = $130`; cash becomes $10,130. Now the short $50 put is assigned early while the stock is $48. You pay $5,000 and receive 100 shares. Cash is $5,130. The long $45 put still exists, unexercised. If its supplied mark is $0.20, total equity is `$5,130 + $4,800 + $20 = $9,950`. The $5,000 funding event is much larger than the original $130 credit.

This is a rehearsal, not a recommendation to sell a put spread. The later outcome depends on what happens to the shares and remaining put, actual instructions, costs, and broker handling.

**Try it:** Start with $8,000 cash. In a zero-fee paper call spread, sell a $40 call for $1.80 and buy a same-expiration $45 call for $0.60. Only the short call is assigned while shares are $44; the long call's supplied mark is $0.30. Find cash, shares, remaining option, and total equity.

<details>
<summary>Check your answer</summary>

Initial net credit is `$180 − $60 = $120`, so cash is $8,120. Assignment requires delivery of 100 shares for $4,000. Starting with no shares, the illustrative ledger becomes −100 shares and $12,120 cash; the long $45 call remains. Equity at the supplied marks is `$12,120 − $4,400 + $30 = $7,750`. Actual short-stock availability, borrowing costs, margin, and broker liquidation can change account handling; they are excluded from these numbers and must be checked separately.

</details>

## Lesson 62 · Grade the process before looking at the outcome

**Time: 5–8 minutes. One idea:** a correct decision can lose, and a careless decision can win.

A journal entry needs a decision-time section and an outcome section. Before the result, record contract terms, timestamp, purpose, assumptions, full cash needs, risk, intended order, and why you acted or passed. Afterward, record actual or explicitly assumed fills, fees, remaining exposure, net result, and one lesson. Preserve both sections without rewriting your original reason.

**Worked example:** Learner A guesses a contract's multiplier, ignores fees, and wins $40 in a fictional case. Learner B verifies the contract, records costs and follows the paper plan, then loses $25 in another case. A has a process failure; B's loss alone does not prove one. Conversely, correct process does not establish that B's trading idea has positive expected value.

Use a simple process check: were contract and data known, risks and shares explained, fills honestly recorded, arithmetic reconciled, and the prewritten rule followed? A missing fact can justify a pass. Record unsuccessful ideas too; otherwise your notebook becomes a collection of selected winners.

**Try it:** You refuse a paper order because its quote timestamp is missing. Later someone says the option doubled. Grade the process and state what you still cannot conclude.

<details>
<summary>Check your answer</summary>

The pass followed a rule requiring known data, so it can be a process success. You cannot conclude that you could have bought at the old displayed price, sold at the later price, or earned a dependable profit. The claimed doubling does not repair missing timing and fill evidence.

</details>

## Lesson 63 · Put the pieces together in four small cases

**Time: 5–10 minutes per case, on four separate days. One idea:** a complete explanation connects the contract, order, cash, risk, and result.

Work without opening the solutions. Use the shared module assumptions. All quotes and fills are invented. These four cases are the final **capstone**, a small demonstration that you can combine what you learned. You do not need profitable outcomes to pass.

**Worked warm-up:** A standard long $30 call costs $1.00 and expires at a $30 stock value. With zero fees and no exercise, intrinsic value is zero; net option result is `−$100`. Being exactly at the strike does not recover the premium.

**Case A — A correctly calculated loss.** One standard long $50 call costs $1.80 plus a $1 entry fee. At expiration, stock is $51. Assume it is exercised and the 100 received shares are immediately sold at $51 with no price change. Exercise plus stock-sale fees total $1; there are no other costs. Find intrinsic cash value, net result, after-fee expiration break-even, and the gross exercise payment needed before the stock-sale proceeds arrive.

**Case B — A failed idea and a partial fill.** Under Lesson 59's displayed-size rule, a fictional quote has $0.90 bid for four contracts and $1.10 ask for one. A two-contract buy-to-open limit at $1.00 has no later fill. A separate two-contract buy-to-open limit at $1.10 is evaluated on the same snapshot. Charge $0.75 per filled contract on entry. Find each filled quantity, premium and fee outflow, unfilled quantity, and open option quantity. Do not treat the two tickets as one combined order.

**Case C — Reconcile a complete round trip.** Starting cash is $2,000. Buy two identical paper puts at $0.95 each; entry fees are $0.65 per contract. Later sell to close both at $1.25 each; exit fees are $0.65 per contract. Assume both specified fills happen and there are no other cash flows or positions. Find opening cash, final cash, and net profit. Explain why the $250 sale premium is not itself the profit.

**Case D — The spread is no longer two options.** Start with $6,000 cash, no shares, and no fees. Sell one $30 put for $1.40 and buy one same-expiration $25 put for $0.40. Only the short put is assigned early while shares trade at $28. The long put remains and its supplied mark is $0.15. Find cash, shares, the remaining option, marked equity, and change from starting equity. Explain whether the $100 opening credit funds assignment.

**Fresh try-it question:** A proposed fifth case has a blank deliverable field and no quote time. Before any arithmetic, write your decision and the two missing facts you need.

<details>
<summary>Complete numeric solutions and safety pass</summary>

**A:** Premium outflow is `$180 + $1 = $181`. Intrinsic cash value is `($51 − $50) × 100 = $100`. Exercise requires a separate `$50 × 100 = $5,000` payment. Sale proceeds are $5,100; exercise and stock-sale fees together are $1. Whole-case net result is `−$181 − $5,000 + $5,100 − $1 = −$82`. After-fee break-even is `$50 + $1.80 + $2/100 = $51.82` under the case's fixed costs. A rising stock and positive intrinsic value can coexist with a loss. The $5,000 gross funding need is distinct from the $82 net loss; actual exercise handling requires the broker's rules.

**B:** The $1.00-limit ticket has zero fill, zero premium and fee flow, two unfilled, and zero open options. The separate $1.10-limit ticket fills one at $1.10 because ask size is one. Outflow is `$110 + $0.75 = $110.75`; one contract remains unfilled and one option is open. The unfilled contract has no entry cost under these assumptions. There is no realized trading result yet for the open contract. Real displayed size would not guarantee even this fill.

**C:** Entry premium is `2 × $0.95 × 100 = $190`; entry fees are `$1.30`. Opening cash after purchase is `$2,000 − $191.30 = $1,808.70`. Exit premium is `2 × $1.25 × 100 = $250`; exit fees are `$1.30`; net receipt is $248.70. Final cash is `$1,808.70 + $248.70 = $2,057.40`. Completed profit is `$57.40`, equivalently `$250 − $190 − $2.60`. The $250 gross sale premium includes recovery of the original premium cost. No shares remain because both puts were sold to close.

**D:** Net entry credit is `($1.40 − $0.40) × 100 = $100`; cash initially becomes $6,100. Assignment of the short $30 put costs $3,000 and delivers 100 shares. Cash becomes $3,100. One long $25 put remains, valued at `$0.15 × 100 = $15` in the specified mark. Equity is `$3,100 + 100 × $28 + $15 = $5,915`; change from starting equity is `−$85`. The $100 credit does not fund the $3,000 exercise obligation. Do not erase the remaining long put or assume it exercised automatically.

**Fresh question:** Record a pass: verify the exact deliverable and quote timestamp, including time zone and delay, before assuming standard shares or an executable price. “Unknown” is more accurate than a guessed answer.

**Safety pass:** Explain the missing-data pass, premium multiplier, distinction between intrinsic value and net profit, unfilled and open quantities, all fees, assignment cash, resulting shares, and remaining long option correctly. Complete the numeric ledgers and correct every error. If any safety item is missed, revisit the relevant lesson and repeat a changed-number case in a later session while preserving the first attempt. A capstone pass establishes understanding of these classroom cases; it is not broker approval or evidence of live profitability.

</details>

## Lesson 64 · Choose the next learning step deliberately

**Time: 5–8 minutes. One idea:** completing a course gives you choices, including stopping.

Your first useful outcome is a skill: you can read a basic contract, distinguish a right from an obligation, work a payoff, question a quote, reconcile fees, and describe possible shares and cash. You can keep practicing these skills without placing a live trade.

**Worked example:** Your review finds that payoff arithmetic is sound but one-leg assignment is confusing. Your next plan is two more notebook ledgers using Lesson 61, followed by a fresh explanation. You do not need to jump to advanced strategies because the lesson numbers have ended. If options do not suit your goals, interests, time, or finances, stopping is a valid completion decision.

For optional further study, use the [existing deeper course map](../COURSE.md), [math bridge](../FOUNDATION_MATH_BRIDGE.md), or [synthetic programming labs](../labs/README.md) when ready. These materials introduce more demanding models and research; programming is not required to finish this beginner path. The [OIC introductory resources](https://www.optionseducation.org/optionsoverview/getting-started-with-options) also explain that completing education does not establish suitability or trading competency.

Any eventual live account requires separate current broker approval, full risk disclosures, operational checks, and a decision based on your circumstances. There is no course rule requiring a deposit, live trade, or number of profitable paper trades.

**Try it:** Write one next step that addresses your weakest skill and one condition under which you would pause or stop. Does a perfect quiz score require you to trade?

<details>
<summary>Check your answer</summary>

An acceptable next step identifies a concrete skill and task, such as “redo a short-put assignment ledger and explain its cash requirement tomorrow.” A pause condition might be unresolved contract terms, confusion about losses, or simply deciding the subject is not useful to you. A perfect quiz score creates no obligation to trade and does not establish live suitability.

</details>

## Module 8 checkpoint

Cover the key. Use a calculator and explain your reasoning. Finish on another day if needed.

1. A fictional quote timestamp is 11:05 and viewing time is 11:23 on the same date and UTC offset. How old is the quote? Does a page refresh prove a current executable price?
2. Under Lesson 59's rule, ask is $1.25 with size two. A buy-to-open ticket requests three at a $1.20 limit. Find filled and open quantities. What changes if the separate ticket's limit is $1.25? Assume zero fees here.
3. Buy one paper option at $1.60 with a $0.90 fee; sell to close at $1.35 with a $0.90 fee. Find net round-trip result and any resulting shares.
4. A paper account holds a $35/$30 put credit spread, short the $35 put. Only that short put is assigned. Starting from no shares, what stock position and gross assignment payment arise, and what happens to the long put automatically?
5. Your paper record contains three wins, two losses, one unfilled order, one still-open position, and a missing-timestamp pass. Which belong in the journal? Can the three wins alone justify a claim of skill or a requirement to trade live?

<details>
<summary>Worked checkpoint key and retry rule</summary>

1. It is 18 minutes old. Refreshing a display does not change the original observation time or prove an executable price.
2. At a $1.20 limit: zero fill, zero open options. At a $1.25 limit: two fill under the classroom size assumption; one remains unfilled, two options are open, and premium outflow is `2 × $1.25 × 100 = $250`. A live fill is not guaranteed by this snapshot.
3. Opening flow is `−$160.90`; closing receipt is `$135 − $0.90 = $134.10`. Net is `−$26.80`. No shares arise because the option is sold to close without exercise.
4. Assignment requires `$35 × 100 = $3,500` and leaves +100 shares. The long $30 put remains a separate option unless a separate sale, exercise, or other actual event changes it. Do not assume assignment of the short automatically exercises it.
5. Record all eight decisions or exposures: five closed trades, one nonfill, one open position, and one pass. Classify their statuses honestly and include costs. Selected wins cannot establish skill, market edge, or future performance, and there is no requirement to trade live.

**Pass:** explain all five correctly, reconcile the arithmetic, and pass Lesson 63's safety items. If you miss an item, preserve your first attempt, review the linked lesson, and retry with changed numbers at your next session. Unfilled orders, well-reasoned passes, and correctly recorded losses are legitimate learning outcomes. No profitable-trade quota applies.

</details>

[Return to the course home](../README.md) · [Review risk](07_RISK.md) · [Optional deeper course](../COURSE.md)
