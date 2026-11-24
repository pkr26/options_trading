# Quote and order-status practice

Use this synthetic replay with [Module 11](LESSONS_02_BEHAVIOR.md) and the [risk guide](RISK_AND_OPERATIONS.md). It teaches what can be concluded from a quote, an order, and a broker confirmation. All times below are **Eastern Time on one fictional trading day**; the quotes and executions were invented for teaching. A displayed bid/ask, size, or midpoint does not prove that a passive limit order filled. A simulated fill is an assumption unless the replay explicitly supplies a broker execution report. [IBKR describes limits of paper fills](https://www.ibkrguides.com/orgportal/aboutpapertradingaccount.htm); for live decisions, verify the exact broker and market state.

Assume standard 100-share premium multipliers and **$1 fee per filled contract per side**. The learner's written entry screen permits a long call only when the **ask is at most $2.20**, the **spread is at most $0.20**, and the exact contract and event calendar have been checked. A buy limit is the maximum accepted price; a sell limit is the minimum accepted price. The screen creates an eligible *decision*, not a demand to trade.

## The four replay episodes

Each episode is independent. Keep the order ID, requested quantity, confirmed quantity, remaining quantity, cash, and option position separate.

| Episode / ET | Visible quote and size | Learner action or broker message |
| --- | --- | --- |
| A 15:30:00 | $2.05 bid × 4 / $2.20 ask × 3 | Screen passes. Submit buy **1** at $2.20 limit, order A1. |
| A 15:30:05 | Quote may have changed | Broker execution: A1 **1 bought at $2.20**. |
| A 15:40:00 | $2.45 bid × 1 / $2.65 ask × 2 | Submit sell **1** at $2.45 limit, order A2. |
| A 15:40:03 | Quote may have changed | Broker execution: A2 **1 sold at $2.45**. |
| B 15:30:00 | $2.00 bid × 3 / $2.60 ask × 2 | Spread is $0.60. Record the eligible market observation and abstention; no order. |
| C 15:30:00 | $2.00 bid × 5 / $2.20 ask × 4 | Submit passive buy **1** at $1.95, order C1. |
| C 15:31:00 | $2.05 bid × 5 / $2.30 ask × 4 | No execution report. |
| C 15:32:00 | $2.10 bid × 3 / $2.35 ask × 5 | Broker reports C1 canceled, **zero filled**. |
| D 15:30:00 | $2.05 bid × 4 / $2.20 ask × 1 | Submit buy **3** at $2.20 limit, order D1. The entry screen passes, but visible ask size is only one. |
| D 15:30:02 | Quote may have changed | Broker reports **1 filled at $2.20**; **2 remain live**. |
| D 15:30:03 | Quote may have changed | Trader sends a request to cancel D1's remainder; status says **pending cancellation**. |
| D 15:30:05 | Quote may have changed | Broker reports **one more filled at $2.20**, now **2 filled total**. |
| D 15:30:07 | Quote may have changed | Broker confirms remaining **1 canceled**. |

### Questions to answer before the key

1. In A, what are the confirmed gross and net P&L? What would an all-midpoint estimate show using the two displayed quotes, and why is it a different result?
2. In B, calculate the spread in dollars per contract and explain the recorded decision.
3. In C, could the two later bids establish that the $1.95 buy order filled? What is the final position, and which message establishes it?
4. In D, show position and premium-plus-fee cash outlay immediately after 15:30:02, after 15:30:05, and after 15:30:07. What was the largest remaining *possible* quantity during pending cancellation?
5. Across attempted **entry** orders A1, C1, and D1, how many contracts were requested and how many were confirmed filled? What is the completion fraction for this tiny replay? Why is it not a real fill-rate estimate for a strategy?
6. A platform freezes while D1 shows “pending cancellation.” The trader cannot tell whether the last contract filled. Write the first five facts to establish before submitting any replacement order. What must be reconciled when access returns?
7. A backtest credits every B observation as a midpoint fill, and every C order as filled after the market rose. Which two distinct errors does it make?

<details>
<summary>Replay answer key — open after recording your answers</summary>

1. A paid `$2.20 × 100 = $220` and sold for `$2.45 × 100 = $245`, so gross P&L is **+$25** and net after two $1 fees is **+$23**. Displayed entry midpoint is `(2.05+2.20)/2 = 2.125`; exit midpoint is `(2.45+2.65)/2 = 2.55`. The all-midpoint calculation is `(2.55−2.125)×100−$2 = **+$40.50**`. It is a hypothetical pricing convention; the supplied broker reports establish the +$23 result.
2. B's spread is `$2.60−$2.00 = $0.60/share`, or **$60 per contract**. It breaches both the $2.20 ask screen and $0.20 spread screen, so record **abstain**, with the quote and reason. There is no trade P&L.
3. No. The later quotes provide no execution report and do not make a passive **buy** at $1.95 marketable. The broker's cancellation message says **zero filled**. Final option position and premium cost are both zero.
4. At 15:30:02, there is **+1 contract**, premium plus fee paid **$221**, and two contracts may still fill. At 15:30:05, there are **+2**, paid **$442**, and one may still fill. At 15:30:07, **+2** remain and the final one is confirmed canceled. The largest possible D1 position during the first pending-cancel interval was **+3 contracts**. The request itself reduced no confirmed exposure.
5. Entry requests total `1+1+3 = **5 contracts**`; confirmed fills total `1+0+2 = **3**`, or **3/5 = 60%** of requested contracts. These few invented orders were selected for teaching and say nothing about live queue priority or a strategy's expected fill rate.
6. Establish the **account identity**, **actual position inventory**, **every relevant order ID**, **confirmed fill quantities/prices**, and **live/pending/canceled order statuses** from an independent broker channel or support process. Do not treat a submitted cancellation or disconnected screen as confirmation. Once access returns, reconcile broker executions, account positions, cash, fees, and the written journal before resuming. Any liquidation or hedge depends on actual status and the risk policy.
7. It assumes a fill in **B despite a written rejection rule** and invents a **C fill from subsequent price movement** even though the broker confirmed zero fills. It would both ignore abstentions and select opportunities using later information.

</details>

## Platform-outage drill: order status is unknown

This episode is separate from D. Cash starts at **$1,000** with no position. At 15:10:00 ET, a buy limit for **two** standard options at **$1.00** is submitted as E1. The app disconnects before showing any acknowledgement. At 15:11:00, an approved independent broker channel confirms E1 was accepted, **one contract filled at $1.00**, and **one remains live**. The learner asks through that channel to cancel the remainder. At 15:11:05, the broker reports the second contract filled before cancellation took effect. Assume a **$1 fee per filled contract**.

Stop and write the position and cash at 15:10:00 (unknown, so give possible states), 15:11:00, and 15:11:05. Explain why submitting E2 for another two contracts at 15:10:30 could create duplicate exposure. Then write your own broker-specific emergency contact and alternate access method *before* relying on a live account; verify that route's operating hours and what it can actually confirm. The [SEC's online-trading guidance](https://www.sec.gov/about/reports-publications/investorpubsonlinetipshtm) explicitly warns that a submitted order may have executed even when the investor did not see confirmation, and that a cancellation request must be confirmed.

<details>
<summary>Outage answer and incident runbook</summary>

At 15:10:00 the learner has **unknown actual exposure**; the possible confirmed result could range from zero to two fills until status is obtained. Do not write zero merely because the app froze. At 15:11:00 there is **+1 option** and cash is `$1,000 − $100 − $1 = **$899**`, with one order quantity still live. At 15:11:05 there are **+2 options**, cash is `$1,000 − $200 − $2 = **$798**`, and no original quantity remains unfilled. A fresh E2 for two more could allow as many as four total contracts if E1 also fully filled.

The runbook is: **(1)** stop new entry submissions; **(2)** identify account, time, exact contract, E1 order ID or broker trace, and requested quantity/limit; **(3)** use the broker's established alternate access or support channel to confirm executions, positions, and every live or pending order; **(4)** request and verify any cancellation using that broker's process, while treating exposure as unresolved until confirmed; **(5)** assess the actual position and follow the written risk and expiry plan; **(6)** after access returns, reconcile executions, cash, fees, and the journal against broker records before resuming. Preserve times and communications. Do not infer cancellation from a disconnected screen or a request acknowledgement.

</details>

## Record format for the next 30 observations

Use one row per decision, including passes and no-signal days. A separate row records every order-status change; preserve the original submitted order and any cancellation request.

```text
Timestamp and time zone; quote source and quote age:
Exact underlying, option series, multiplier, deliverable; bid/ask and sizes:
Known event and contract checks; screen result; reason to enter or abstain:
Order ID, side, quantity, limit, submission time:
Confirmed fill quantity/price/time; remaining live quantity:
Cancellation request time and confirmation time, if any:
Fees; cash and open-position change; quote-side alternative:
Known unknowns, such as queue priority or stale marks:
```

**Pass standard:** Correct all seven replay answers; reconcile every D1 status without treating pending cancellation as final; complete the 30 dated observations from Module 11; and explain why replay completion is not a live execution statistic. Rework errors on changed prices and quantities. [Module 12](LESSONS_02_BEHAVIOR.md) starts the longer decision journal required by the [eight-week risk gate](RISK_AND_OPERATIONS.md).
