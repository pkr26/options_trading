# Module 5 · What actually happens in the account

[Course home](README.md) · [Previous: prices](04_PRICES.md) · [Next: strategies](06_STRATEGIES.md) · [Full library](../README.md)

**Lessons 33–40.** Study one lesson a day, then spend 3–5 minutes recalling an earlier lesson. Unless a lesson explicitly changes the product, every example is a fictional **American-style stock/ETF option delivering 100 shares with a 100 premium multiplier**. Fees, interest, taxes, borrowing costs, and dividends are **$0 in the arithmetic**, except the dividend stated in Lesson 38. Actual account treatment must be checked with the broker.

Your goal: show the cash, shares, options, and order status after an event. The [OCC disclosure document](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) is the official reference; read its relevant sections as these terms become familiar and before any real options trading.

## Lesson 33 · Opening and closing create four different actions

An option order includes whether it **opens** or **closes** a position. Buying does not always start a bullish bet, and selling does not always open a short position. Use the exact same option series—underlying, type, strike, expiration, and deliverable—when closing it. [SEC explains closing transactions](https://www.investor.gov/introduction-investing/general-resources/news-alerts/alerts-bulletins/investor-bulletins-63).

| Action | What it does |
| --- | --- |
| Buy to open | Creates a long option you own |
| Sell to close | Removes an existing long option |
| Sell to open | Creates a short option obligation |
| Buy to close | Removes an existing short option |

**Worked example:** Starting with no options, buy to open one call at $2: cash falls $200, position is **+1 call**. Later sell to close that same call at $2.30: cash rises $230, position becomes **0**, and profit is **$30**. Selling a different expiration would leave two separate positions rather than closing the first.

**Try it:** You sold to open one put for $1.50. Which action closes it if the actual repurchase price is $2? What is the result?

<details><summary>Check your reasoning</summary>

**Buy to close** the same put series. Entry +$150, closing −$200, net **−$50**. A submitted order removes no position until the required closing fill is confirmed.

</details>

**Recall:** Which sale creates an obligation and which sale removes an asset?

## Lesson 34 · Exercise uses the contract; closing sells the contract

**Exercising** a physically settled call uses its right to buy shares at the strike. Exercising a put uses its right to sell shares at the strike. This is different from selling the option. An option premium is paid separately from the exercise amount. [OIC explains exercise cash and share delivery](https://www.optionseducation.org/optionsoverview/exercising-options).

**Worked example:** You paid $2 for one $50 call: **$200 premium**. Exercising requires **$5,000** to buy **100 shares** at $50. It removes the call and creates the stock position. If the stock is $54, the shares are worth $5,400 at that reference price; the gain after premium is $200 before excluded costs. Cash required to exercise is much greater than the $200 premium. A later stock fall can create additional stock losses.

Selling an option with remaining extrinsic value can preserve value that exercise would discard, if a suitable sale can be executed. The best available action depends on actual quotes, deadlines, and the account.

**Try it:** One long $40 put is exercised while the holder owns the required 100 shares. What shares and cash move? What happens to the option?

<details><summary>Check your reasoning</summary>

The holder delivers **100 shares**, receives **$4,000**, and the put ceases to be open. The earlier premium is a separate cash flow. Without the shares, exercise may create short stock if permitted, or prompt broker intervention; verify account rules.

</details>

**Recall:** Does a $200 call premium mean only $200 is needed to exercise it?

## Lesson 35 · Assignment can arrive before expiration

**Assignment** means a short option writer must fulfill an exercised contract. An American-style short option can be assigned on any business day while open. You cannot guarantee which day or predict the assigned account. A protective long option in a spread does not automatically exercise to fix the short leg's obligation. [FINRA explains early and one-leg assignment](https://www.finra.org/investors/insights/trading-options-understanding-assignment).

**Worked example:** Sell one $45 put for $1. You receive **$100 premium**. If assigned, you pay **$4,500** and receive **100 shares**. The short put disappears, but the shares remain. At a $40 stock reference price they are worth $4,000, so the position's result including the initial premium is **−$400**. Cash received initially was not guaranteed profit.

If a call is assigned, the writer must deliver shares instead. Without owned shares, permitted assignment can create short stock, whose losses grow as stock rises. A broker can require funds or liquidate positions under its rules.

**Try it:** One short $60 call is assigned. The writer already owns 100 shares. What are the resulting share and cash changes? Does the writer choose to decline assignment?

<details><summary>Check your reasoning</summary>

Deliver **100 shares**, receive **$6,000**, remove the short call. The writer cannot decline a valid assignment because the outcome is inconvenient. Include the original stock cost and option premium when calculating total profit.

</details>

**Recall:** Is the long leg of a spread an automatic instruction to resolve assignment?

## Lesson 36 · American and European describe exercise timing

**American-style** options permit exercise before expiration within the applicable rules. **European-style** options permit exercise only at their specified expiration exercise time. These labels describe contract rights, not the country where you live or trade. Exercise style and settlement type are separate fields. U.S. stock and ETF options are generally American-style and physically settled; many index products have different terms. [OIC compares equity and index options](https://www.optionseducation.org/advancedconcepts/equity-vs-index-options).

**Worked example:** Two fictional calls both have 20 days remaining and a $100 strike. Stock/index reference is 105. The American-style holder may exercise now under its rules; the European-style holder cannot exercise now just because it has five points of intrinsic value. Either might be sold before expiry if a suitable market is available. A sale is not early exercise.

**Try it:** A European-style option has 10 days remaining and five points of intrinsic value. Does that permit immediate exercise? Does it prevent the holder from trying to sell the option?

<details><summary>Check your reasoning</summary>

No immediate exercise: its exercise timing is restricted. It can generally be traded before expiry during its trading hours, subject to market availability. The word European does not mean you must hold until expiration.

</details>

**Recall:** Name the two different questions answered by exercise style and settlement type.

## Lesson 37 · Expiration can create a stock position automatically

For standard U.S. equity options, OCC's **exercise-by-exception** procedure generally exercises expiring options at least **$0.01 in the money**, absent contrary instructions through the clearing member. Broker procedures, deadlines, buying power, and product rules matter. A broker may close a position or submit different instructions under its policies. Do not assume doing nothing avoids a share obligation. [OIC's exercise FAQ explains the threshold and exceptions](https://www.optionseducation.org/referencelibrary/faq/options-exercise).

**Worked example:** One $50 call reaches expiration with the relevant stock close at $50.05. Its exercise value is only **$5**, but exercise buys **100 shares for $5,000**. Those shares can move sharply afterward. Conversely, an option out of the money at the close can still be exercised under valid instructions after an after-hours move; the close does not settle every assignment question. [FINRA illustrates after-hours spread risk](https://www.finra.org/investors/insights/trading-options-understanding-assignment).

**Try it:** A long $70 call is $0.02 in the money at expiration. Under the standard procedure and no contrary instruction, what purchase may occur? Why is the $2 intrinsic value a misleading measure of the resulting cash requirement?

<details><summary>Check your reasoning</summary>

Exercise may buy **100 shares for $7,000**. The $2 is `0.02 × 100` immediate exercise value, not purchase funding or a limit on later stock losses. Confirm the broker's actual exercise and liquidation policy in advance.

</details>

**Recall:** Does submitting a closing order guarantee that an expiring position is gone?

## Lesson 38 · A dividend can change early-call assignment incentives

A **dividend** is a distribution by a company or fund. The **ex-dividend date** determines whether a new stock buyer is entitled to that distribution under the applicable rules. A call holder does not receive the stock dividend just for owning a call. Approaching that date, early exercise of certain in-the-money calls may become more attractive, increasing assignment risk for short calls. [OIC describes dividends and early exercise](https://www.optionseducation.org/optionsoverview/exercising-options).

**Worked example:** Stock is $52. An open $50 call has an observed premium of $2.10: $2 intrinsic plus $0.10 extrinsic. An upcoming dividend is $0.60/share. The dividend exceeds that $0.10 of remaining extrinsic value, making early exercise worth investigating for a holder, subject to financing, quotes, and other details. It does not prove assignment will happen.

If assignment leaves a writer short 100 shares across the ex-date, the account may owe a **$60 dividend-related payment**, in addition to stock-price and borrowing consequences. A covered writer may instead lose the owned shares and the expected dividend.

**Try it:** A short call is open before an ex-date. Assignment leaves 100 shares short, and the stated dividend is $0.40/share. What potential dividend-related cash obligation must be included?

<details><summary>Check your reasoning</summary>

**$40**, under the stated 100-share short and dividend assumption. Stock-price changes are separate; a stock typically adjusts around its dividend, so the payment alone is not the full economic result. Verify broker handling.

</details>

**Recall:** Does owning a call by itself entitle you to a stock dividend?

## Lesson 39 · Multiplier, deliverable, and settlement are separate fields

Do not let the familiar number 100 replace the contract specification. The **premium multiplier** converts a quote to dollars. The **deliverable** states what changes hands on exercise. **Settlement** can involve shares or a cash amount. Corporate actions can create adjusted contracts with unusual deliverables. [OCC's disclosure reference](https://www.theocc.com/company-information/documents-and-archives/options-disclosure-document) and [adjustment memos](https://infomemo.theocc.com/infomemo/search-memo) describe the actual terms.

**Worked example:** A fictional cash-settled index call has strike 5,000, premium 15 index points, and a $100 multiplier. It costs **$1,500**. If its official settlement value is 5,020, it pays **$2,000 cash**, producing $500 before costs and **no shares**. The official settlement value can differ from the last displayed index value; A.M. and P.M. series differ. [Cboe specifies its index products](https://www.cboe.com/tradable_products/sp_500/spx_weekly_options/specifications).

An adjusted stock option might retain a 100 premium multiplier but deliver only 10 shares after a reverse split. This is a separate contract feature, not a cash-settlement rule. [OIC gives a reverse-split example](https://www.optionseducation.org/news/splits-happen).

**Try it:** A memo-confirmed adjusted contract has quoted premium $2, a 100 premium multiplier, and a 10-share deliverable. Is its premium $20 or $200? Can you infer the exercise cash payment from “10 shares” alone?

<details><summary>Check your reasoning</summary>

Premium is **$200**. You need the memo's strike/exercise terms to determine exercise cash; deliverable count alone is insufficient. Do not silently treat it as an ordinary contract.

</details>

**Recall:** Which field converts a premium quote to dollars?

## Lesson 40 · Read a chain and rehearse an order ticket

An **option chain** groups contracts by expiration and strike. First select the exact series; then read its bid/ask and timestamp. Volume counts trading activity; open interest counts outstanding contracts. Neither guarantees a fill. A chain's “last” trade can be stale. [OIC's basics FAQ explains quote fields](https://www.optionseducation.org/referencelibrary/faq/basics).

**Worked example:** A fictional chain row is **ABC · 30 days left · $50 call · $1.90 bid / $2.10 ask · size 4/2 · last $2.30**. ABC is an invented symbol. The standard 100 multiplier makes the displayed ask **$210/contract**. The $20 spread is `(2.10 − 1.90) × 100`. The last $2.30 is not today's offered buy price. A learning ticket could say **buy to open 1, $2.00 limit, day order**; it may never fill because its limit is below the displayed ask. Size can disappear as quotes change.

Before a real ticket, verify the actual expiration date, contract identifier, deliverable, events, permitted strategy, total costs, funding, and exit/expiry plan. Here, write **“simulation only; no order submitted.”** A paper fill also has limitations. [IBKR documents simulated fills](https://www.ibkrguides.com/orgportal/aboutpapertradingaccount.htm).

**Try it:** A row shows $1.40 bid/$1.70 ask, 100 multiplier. You own one option and write a sell-to-close limit of $1.60. What proceeds would a fill at exactly that limit produce? Does the visible quote establish a fill?

<details><summary>Check your reasoning</summary>

**$160 before fees** if filled at exactly $1.60. No: the displayed bid is $1.40, and even a later quote cannot replace an execution confirmation. Preserve the order ID and status in a simulation or actual account record.

</details>

**Recall:** What evidence tells you an order actually executed?

## Module checkpoint · Build cash/share ledgers

1. You own one $30 call. Which transaction closes it without exercising? If exercised instead, what cash and shares move?
2. You sold one standard $40 put for $1.20 and are assigned. State entry premium, assignment cash, share change, and open option position afterward.
3. One long $80 call is $0.03 in the money at expiration. Explain exercise-by-exception, the potential cash requirement, and what must be checked with the broker.
4. An American-style short call is assigned before expiry while a later-dated long call remains. Does the long call act automatically? What must you reconcile?
5. A chain has bid $2/ask $2.30. A buy limit at $2.10 is submitted; the platform freezes. Can you record a zero position or submit a replacement on that assumption? Explain.

<details><summary>Checkpoint worked key · open after saving your answers</summary>

1. **Sell to close** the same series. Exercise instead pays **$3,000** and receives **100 shares**, removing the call; premium previously paid is separate.
2. Entry **+$120**. Assignment **−$4,000**, **+100 shares**, and the short put is removed. The shares remain exposed to stock losses. Net cash change across those two events is −$3,880, before excluded costs.
3. The standard procedure generally exercises at least $0.01 ITM absent contrary instructions; **$8,000 buys 100 shares**, while intrinsic value is only $3. Confirm product terms, funding, exercise/do-not-exercise deadline, and broker liquidation procedures. Do not assume the broker guarantees this particular outcome.
4. **No.** Reconcile delivered or short shares, assignment cash, remaining option, buying power, pending orders, and broker deadlines. A spread diagram is not an automatic account workflow.
5. **No.** The order may be unfilled, partly filled, or filled. Establish the actual status through the broker's independent channel before replacement; a pending cancellation is not a confirmation. For learning, write all possible states until the replay supplies a confirmed result.

</details>

**Pass and retry:** All five correct, including every cash amount, share sign, and order-status uncertainty. Any error in funding, assignment, expiry, or order status requires rereading the lesson and a changed-number correct attempt on another study day. Recalling a formula alone does not pass. Revisit one case after 1, 3, and 7 study days.

[Next: understand seven position structures](06_STRATEGIES.md)
