# A small glossary you can use as you learn

[Beginner course](README.md) · [Full library](../README.md)

Look up a word when a lesson introduces it. Do not memorize this page before starting. Each definition is a reminder; the linked module supplies examples, qualifications, and sources. Definitions involving shares refer to the course's standard physically settled stock/ETF examples unless otherwise stated.

## Module 1 · Markets

| Term | Plain meaning |
| --- | --- |
| Stock / share | A share is a unit of ownership in a company. Its price can rise or fall. |
| ETF | An exchange-traded fund: a fund whose shares trade on an exchange. Its holdings and risks depend on that fund. |
| Index | A calculated measure of a specified group of securities. A fund tracking an index is a separate investment. |
| Broker | The firm handling your account and routing or executing your orders under its rules. |
| Bid / ask | Bid is a displayed buying offer; ask is a displayed selling offer. Both have a time and limited size. |
| Spread | Ask minus bid. It is one trading-cost consideration, not the complete cost of a trade. |
| Limit order / fill | A limit sets an acceptable buy ceiling or sell floor. A fill is a confirmed execution; submitting the order does not guarantee one. |

[Examples in Module 1](01_MARKETS.md)

## Module 2 · Contracts

| Term | Plain meaning |
| --- | --- |
| Underlying | The stock, ETF, or other specified asset or reference the option is tied to. |
| Call | A contract giving its holder a right to buy under its terms. A short call has the corresponding obligation if assigned. |
| Put | A contract giving its holder a right to sell under its terms. A short put has the corresponding obligation if assigned. |
| Strike | The contract's exercise price, rather than the option's premium or the stock's current market price. |
| Expiration | The contract's end date. Last trading time and exercise deadlines must be checked separately. |
| Premium / multiplier | Premium is the option's price. The multiplier converts a quote to total dollars: quote × multiplier × contracts. |
| Long / short | Long means you own an option; short means you wrote an open option obligation. Selling an owned option to close it differs from writing a new one. |

[Examples in Module 2](02_CONTRACTS.md)

## Module 3 · Values and results

| Term | Plain meaning |
| --- | --- |
| Intrinsic value | Immediate exercise value. For a standard call: max(stock − strike, 0); for a put: max(strike − stock, 0), before the multiplier. |
| Profit and loss / P&L | The result after comparing proceeds, payments, liabilities, and stated costs. Premium received alone is not profit. |
| Break-even | The outcome where profit is zero under stated assumptions. An expiration break-even is not a required stock price for an earlier profitable sale. |
| Moneyness / ITM / OTM | How stock price relates to strike. ITM means positive intrinsic value; OTM means no intrinsic value and an unfavorable exercise difference. Neither says what your trade earned. |

[Examples in Module 3](03_PROFIT.md)

## Module 4 · Changing prices

| Term | Plain meaning |
| --- | --- |
| Extrinsic value | Option premium minus intrinsic value; also called time value. It is not a separate cash payment. |
| Realized volatility | A measure of price movement already observed over a chosen period. |
| Implied volatility / IV | A volatility input inferred from an option quote using a model. It is not a promised future outcome. |
| Delta | A model's local estimate of option-value change per $1 underlying move, with other inputs fixed. |
| Gamma | A model's local estimate of how delta changes when the underlying moves. |
| Theta | A model's estimate of the effect of time passing, often per calendar day. Verify platform units. |
| Vega / rho | Model estimates for IV and interest-rate changes respectively. Common units use a one percentage-point change; verify the platform. |

[Examples in Module 4](04_PRICES.md)

## Module 5 · Operations

| Term | Plain meaning |
| --- | --- |
| Exercise | Using an option's contractual right. Standard stock-call exercise buys shares; standard stock-put exercise sells shares. |
| Assignment | The writer is required to fulfill a contract that was exercised. A long spread leg does not automatically resolve the resulting shares. |
| American / European style | American permits early exercise under applicable rules; European restricts exercise to the specified expiration time. These do not describe geography. |
| Settlement / deliverable | Settlement describes how obligations are completed. The deliverable specifies shares, cash, or other property due under the contract. |
| Exercise by exception | An OCC clearing-member procedure for expiring options meeting its in-the-money threshold, absent contrary instructions. Broker account procedures can differ. |
| Ex-dividend date | The date determining whether a new share buyer is entitled to the announced distribution under applicable rules. |

[Examples in Module 5](05_OPERATIONS.md)

## Module 6 · Positions

| Term | Plain meaning |
| --- | --- |
| Covered call | Owned shares plus a short call covering those shares. The stock can still suffer substantial losses, while upside is limited. |
| Protective put | Owned shares plus a matching long put, providing a temporary sale right at the strike for a premium. |
| Cash-secured put | A short put with cash reserved to fund assignment. This funding does not remove the risk of a stock collapse. |
| Vertical spread / debit / credit | A matching-expiration option pair at different strikes. Debit means net cash paid; credit means net cash received. Operational risks remain. |

[Examples in Module 6](06_STRATEGIES.md)

## Modules 7–8 · Decisions and practice

| Term | Plain meaning |
| --- | --- |
| Expected value | The probability-weighted average of possible outcomes under the stated probabilities. Those probabilities can be wrong. |
| Position size | How many shares or contracts are held. Check the full dollar exposure and obligations before choosing quantity. |
| Correlation / concentration | Positions can move or lose together; several tickers can still carry one large shared risk. |
| Drawdown | A decline from a prior equity high to a later lower value. State whether deposits, withdrawals, and open positions are included. |
| Paper / shadow record | A simulation or written hypothetical decision log. It does not prove live fill quality or profit. |

[Risk examples](07_RISK.md) · [Paper practice](08_PRACTICE.md)

These **40 grouped entries** are a lookup aid. Keep adding your own short definitions and changed-number examples to the [workbook](WORKBOOK.md).
