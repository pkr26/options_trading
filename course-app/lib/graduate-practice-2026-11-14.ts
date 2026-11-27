// Frozen forms for existing assessment enrollments, saved tutors and in-flight practice.
import type { CompetencyId, GraduatePracticeFeedback, GraduatePracticeQuestion } from "./graduate-types.ts";
import { europeanPrice } from "./graduate-models.ts";

type KeyedQuestion = GraduatePracticeQuestion & { expected: number; explanation: string; tolerance: number };
export const GRADUATE_GRADING_CONVENTION={countTolerance:1e-9,numericTolerance:0.00501} as const;
const money = (n: number) => n.toFixed(2);
function questions(moduleId: number, sequence: number): KeyedQuestion[] {
  if (!Number.isInteger(moduleId) || moduleId < 1 || moduleId > 26 || !Number.isSafeInteger(sequence) || sequence < 0 || sequence > 1_000_000) throw new RangeError("Choose a valid module and practice sequence.");
  const x = sequence % 97, n = 1 + sequence % 4, k = 40 + x, premium = 2 + x / 20, fees = 1 + sequence % 3, up = sequence % 2 === 0;
  const price = k + (up ? 8 : -6), rows: KeyedQuestion[] = [];
  const add = (skill: CompetencyId, prompt: string, expected: number, explanation: string, unit = "USD", hint = "Write the units beside every term before calculating.") => {
    rows.push({ id: `g${moduleId}-s${sequence}-q${rows.length + 1}`, skill, prompt: `${prompt} ${unit === "count" ? "Enter a whole number." : "Round the final answer to two decimal places; keep intermediate precision."}`, unit, hint, expected, explanation, tolerance: unit === "count" ? GRADUATE_GRADING_CONVENTION.countTolerance : GRADUATE_GRADING_CONVENTION.numericTolerance });
  };
  switch (moduleId) {
    case 1: {
      add("risk", `A fictional account changes from $${k * 100} to $${price * 100}. What is its signed simple return in percent?`, (price / k - 1) * 100, `(Final − initial) / initial × 100. A negative result is a loss.`, "percent");
      const drawdown = 10 + sequence % 50;
      add("risk", `An account falls ${drawdown}% from its peak. What percentage gain from the remaining value restores the peak?`, drawdown / (100 - drawdown) * 100, `Recovery gain is drawdown / (100 − drawdown) × 100, using the smaller remaining balance.`, "percent");
      add("valuation", `A $${k * 100} balance earns a stipulated 5% in each of two years, with no additions. What is the final balance?`, k * 100 * 1.05 ** 2, `Multiply the starting balance by 1.05 twice. This is arithmetic under a stated return, not a forecast.`);
      break;
    }
    case 2:
      add("execution", `A standard option has bid $${money(premium)} and ask $${money(premium + 0.3)}. Buy ${n} contracts at the ask and immediately sell them at the bid. Ignoring fees, what is the signed P&L? Multiplier 100.`, -30 * n, `(${money(premium)} − ${money(premium + 0.3)}) × 100 × ${n}. The spread is a cost, not guaranteed recoverable value.`);
      add("contracts", `The premium is $${money(premium)}/share. What cash premium is paid for ${n} standard 100-share contracts?`, premium * 100 * n, `Per-share premium × 100 × contract count.`);
      add("execution", `Sell one standard contract at an actual $${money(premium)} fill. A $${fees} total fee applies. What net cash is received?`, premium * 100 - fees, `Actual fill × 100, less the stated fee. A last price or midpoint alone would not establish the fill.`);
      break;
    case 3: {
      const right = up ? "call" : "put", intrinsic = up ? Math.max(price - k, 0) : Math.max(k - price, 0);
      add("contracts", `One long standard ${right}, strike $${k}, cost $${money(premium)}/share. Stock expires at $${price}. Fees total $${fees}. What is the signed expiration P&L?`, intrinsic * 100 - premium * 100 - fees, `Intrinsic value is $${intrinsic}/share. Subtract the premium and whole-position fee after multiplying intrinsic and premium by 100.`);
      add("contracts", `In a separate before-expiration snapshot, a ${right} has intrinsic value $${intrinsic}/share and a coherent quoted premium $${money(intrinsic + premium)}. What is extrinsic value per share?`, premium, `Premium minus intrinsic value = $${money(premium)}/share. It is a value decomposition, not profit.`, "USD/share");
      add("contracts", `For a long standard ${right} with strike $${k} and premium $${money(premium)}, what is the expiration break-even stock price? Ignore fees.`, up ? k + premium : k - premium, `Call break-even adds premium to strike; put break-even subtracts it. This is an expiration relation.`, "USD/share");
      break;
    }
    case 4:
      add("contracts", `You are assigned on ${n} standard short puts, strike $${k}. How much exercise cash must you pay, ignoring the original premium?`, n * k * 100, `Assignment purchases ${n * 100} shares at $${k}. Gross funding is separate from the earlier premium.`);
      add("contracts", `You hold no shares and are assigned on ${n} standard short calls. What is the signed resulting share position? Assume no other action.`, -100 * n, `Delivering shares from an initially flat share position leaves −${100 * n} shares. Any other option leg remains unless separately acted upon.`, "count");
      add("contracts", `A fictional adjusted call explicitly specifies premium multiplier 100, exercise-price multiplier 100 (aggregate exercise cash equals strike × 100), strike $${k}, and deliverable 50 shares only. On exercise, what strike cash is paid for one contract?`, k * 100, `Exercise cash uses the separately specified exercise-price multiplier: $${k} × 100. The 50-share deliverable does not halve this cash obligation.`);
      break;
    case 5: {
      const debit = premium, width = 10;
      add("valuation", `A same-expiry long call vertical has strikes $${k}/$${k + width} and net debit $${money(debit)}/share for one standard spread. What is signed expiration P&L when stock finishes above both strikes? Ignore fees.`, (width - debit) * 100, `Maximum spread payoff is $${width} × 100; subtract the net debit × 100. This supplied-price arithmetic is not an endorsement of the quote.`);
      add("risk", `The same long vertical cost $${money(debit)}/share. What is the loss amount if both calls expire worthless? Ignore fees.`, debit * 100, `The entire net debit is lost in this stipulated expiration case.`);
      add("valuation", `Buy 100 shares at $${k}; sell a standard call with strike $${k + 5} for $${money(premium)}/share. At expiration stock is $${k + 12} and the call is assigned. What is total signed P&L, ignoring fees/dividends?`, (5 + premium) * 100, `Shares are delivered at $${k + 5}, realizing $500 above their cost; add the collected premium. Upside beyond the strike is foregone.`);
      break;
    }
    case 6:
      add("risk", `A hypothetical $${k * 1000} portfolio places $${k * 200} in one stock. What percentage is concentrated in it?`, 20, `Position value / total portfolio × 100 = 20%. This measures one exposure, not complete risk.`, "percent");
      add("risk", `The whole-position loss budget is $${400 + x * 10}. Each specified one-contract spread can lose $${150 + x}. What is the largest whole contract count within that budget?`, Math.floor((400 + x * 10) / (150 + x)), `Divide budget by stated per-contract worst-case loss and round down. Costs/funding outside the supplied maximum require separate checks.`, "count");
      add("risk", `After ${n} short puts are assigned at strike $${k}, exercise cash due is $${n * k * 100}. Available cash is $${n * k * 100 - 350}. What is the cash shortfall?`, 350, `Due cash minus available cash is $350; receiving shares does not itself pay the exercise cash.`);
      break;
    case 7: {
      const delta = up ? 0.45 + x / 1000 : -0.35 - x / 1000, move = up ? 1 + n : -1 - n, gamma = 0.04 + x / 10000;
      add("valuation", `One long option has delta ${delta}, gamma ${gamma} per $1 and multiplier 100. Stock changes by ${move} dollars. What is delta-plus-gamma estimated value change? Other inputs fixed.`, (delta * move + 0.5 * gamma * move ** 2) * 100, `Δ × stock move + ½ Γ × move², then × 100. This is a local model approximation, not a promised quote.`);
      add("valuation", `One long option has vega $${(0.12 + x / 1000).toFixed(3)}/share per IV percentage point. IV changes from ${25 + x}% to ${up ? 28 + x : 22 + x}%. What is the vega-only contract value change?`, (up ? 3 : -3) * (0.12 + x / 1000) * 100, `The change is ${up ? "+3" : "−3"} percentage points: multiply by the stated vega and by 100.`);
      add("valuation", `One long call has theta −$${(0.04 + x / 10000).toFixed(4)}/share/day. Under the frozen-input one-day approximation, what is the time-only value change for ${n} standard contracts?`, -(0.04 + x / 10000) * 100 * n, `The stated daily theta × 100 × ${n}. Theta is not a daily fee or complete P&L.`);
      break;
    }
    case 8:
      add("valuation", `Daily realized standard deviation is ${money(1 + x / 100)}%. Using the stipulated 252-day square-root convention, what is annualized volatility in percent?`, (1 + x / 100) * Math.sqrt(252), `Daily volatility × √252. The scaling convention needs care with dependence and changing volatility.`, "percent");
      add("valuation", `An option's IV is ${30 + x}% and the selected realized volatility is ${20 + x}%. What is IV minus realized volatility in percentage points?`, 10, `Subtract the percentages to get 10 percentage points. Different horizons or events prevent this gap from establishing mispricing.`, "percentage points");
      add("research", `Of 100 comparable past IV observations, ${20 + x % 70} are strictly below today's IV. Under this stated convention, what is today's empirical IV percentile?`, 20 + x % 70, `Count below / 100 × 100. The comparison convention and observation window must be stated.`, "percent");
      break;
    case 9:
      add("valuation", `A portfolio is long ${n} standard calls with delta +${(0.6 + x / 1000).toFixed(3)} each and short ${n + 1} calls with long-option delta +0.30 each. What is net delta in share equivalents?`, (n * (0.6 + x / 1000) - (n + 1) * 0.3) * 100, `Long delta minus the delta of sold options, each multiplied by 100. Delta changes as inputs move.`, "share equivalents");
      add("valuation", `A long option has vega ${(0.15 + x / 1000).toFixed(3)}/share/IV point and a short option's long-side vega is 0.09. One standard contract of each is held. What is the estimated position change if both IVs rise by 2 points?`, ((0.15 + x / 1000) - 0.09) * 2 * 100, `(stated long vega − 0.09) × 2 × 100. Equal IV changes are an explicit simplifying assumption.`);
      add("contracts", `A calendar holds ${n} later-expiry long calls and ${n} near-expiry short calls. Only the short calls expire worthless. How many long option contracts remain?`, n, `The ${n} later-expiry long calls survive; the calendar has not become a fully settled expiration payoff.`, "count");
      break;
    case 10:
      add("risk", `A fictional proposal has a stipulated 40% chance of a $${300 + x * 10} gain and 60% chance of a $${200 + x * 5} loss. Costs are $20 in every outcome. What is expected signed P&L?`, 0.4 * (300 + x * 10) - 0.6 * (200 + x * 5) - 20, `Weight both gains and losses and deduct costs once. These supplied probabilities are assumptions to challenge, not established odds.`);
      add("valuation", `A hedge reduces the stated stress loss from $${1500 + x * 20} to $${600 + x * 10}, but costs $${250 + x}. What is the stress-loss reduction net of premium? Treat premium as additional to the stated hedged loss.`, 1500 + x * 20 - (600 + x * 10) - (250 + x), `Compare the same stress scenario: unhedged loss minus hedged loss minus premium. This is stress protection, not expected return.`);
      add("risk", `A $${500 + x * 10} hypothetical loss budget must include a $${150 + x} per-spread maximum loss and $5 fees per spread. What is the largest whole spread count?`, Math.floor((500 + x * 10) / (155 + x)), `Include fees in the per-spread loss before rounding down. A zero answer is a valid decision.`, "count");
      break;
    case 11:
      add("execution", `A buy order for 3 contracts receives supplied fills: 1 at $${money(premium)} and 1 at $${money(premium + 0.2)}; 1 is cancelled. What is the average fill per share, before fees?`, premium + 0.1, `Only filled contracts enter the weighted average. The cancelled contract has no fill.`, "USD/share");
      add("execution", `For those two fills, fees are $${fees} per filled contract. What total purchase cash leaves the account? Multiplier 100.`, (2 * premium + 0.2) * 100 + 2 * fees, `Add each actual fill × 100 and fees for the two filled contracts.`);
      add("execution", `Buy limit $${money(2 + x / 100)}; the episode supplies asks $${money(2.1 + x / 100)} and $${money(2.2 + x / 100)} and explicitly no fills. After cancellation acknowledgement, how many option contracts were acquired?`, 0, `An unfilled order creates no option position. Preserve the decision and nonfill in the log.`, "count");
      break;
    case 12:
      add("research", `A paper ledger starts at $${10000 + x * 100}; closed P&L is +$250, open marked P&L −$80, and fees $30. No other flows. What is ending marked equity?`, 10000 + x * 100 + 140, `Starting equity + closed P&L + open marked P&L − fees. Marks are not necessarily executable liquidation prices.`);
      add("research", `There are ${10 + n} eligible setups: 4 rejected, 3 unfilled, and the rest filled. How many eligible decisions belong in the record?`, 10 + n, `All eligible setups belong, including rejections and nonfills. Recording only filled winners creates selection bias.`, "count");
      add("risk", `A marked account peak is $${10000 + x * 100} and a later trough is $${8000 + x * 80}. What is peak-to-trough drawdown as a positive percent?`, 20, `(Peak − trough) / peak × 100 = 20%.`, "percent");
      break;
    case 13:
      add("research", `A stipulated model wins $${100 + x} with probability 0.8 and loses $${500 + x} otherwise. What is its expected signed payoff? Ignore fees.`, 0.8 * (100 + x) - 0.2 * (500 + x), `0.8 × gain − 0.2 × loss. A high win rate can coexist with negative expected value.`);
      add("research", `Among ${100 + x} trials, ${30 + x} meet condition A and ${10 + x} meet both A and B. What is the empirical percent meeting B conditional on A?`, (10 + x) / (30 + x) * 100, `Use the A population as the denominator: both A and B / A.`, "percent");
      add("research", `A binary payoff is +$${100 + x} or −$${100 + x} with equal stipulated probabilities. What is its variance in dollars squared?`, (100 + x) ** 2, `Mean is zero; variance is the squared payoff magnitude.`, "USD squared");
      break;
    case 14:
      add("research", `A sample mean uses an explicitly supplied effective independent sample size ${25 + x}. Sample standard deviation is $${50 + x}. What is the estimated standard error of the mean?`, (50 + x) / Math.sqrt(25 + x), `Standard deviation / √effective sample size. The effective size is supplied, not inferred from raw overlapping trades.`);
      add("research", `A mean is $${10 + x} with estimated SE $4. Using the stipulated normal approximation mean ±1.96 SE, what is the lower bound?`, 10 + x - 1.96 * 4, `Subtract 1.96 × 4. The validity of the approximation and treatment of dependence need separate assessment.`);
      add("research", `You test ${10 + x} variants and choose familywise alpha 0.05. What is the Bonferroni per-test threshold expressed as a percent?`, 5 / (10 + x), `0.05 / test count, then × 100. This is a conservative multiplicity rule, not proof of an edge.`, "percent");
      break;
    case 15:
      add("research", `A price series is [${k}, ${k + 5}, ${k + 3}]. What is the first simple return in percent?`, 5 / k * 100, `Return uses the earlier price as denominator. Preserve the ordered source inputs.`, "percent");
      add("research", `A QA function receives ${8 + x} rows: 2 lack price and 1 different row lacks timestamp. How many rows have both fields?`, 5 + x, `Three distinct rows are incomplete, leaving ${5 + x}. Missingness policy must be stated before interpreting results.`, "count");
      add("research", `For observations [${1}, ${2 + x}, ${3 + 2 * x}], what is sample variance using denominator n−1?`, (1 + x) ** 2, `The mean is ${2 + x}; symmetric squared deviations sum to ${2 * (1 + x) ** 2}; divide by 2. A population-variance function would return a different value.`, "squared units");
      break;
    case 16:
      add("research", `A quote is timestamped 10:00:${String(10 + n).padStart(2, "0")} and decision time is 10:00:40 on the same clock/date. What is its age in seconds?`, 30 - n, `Subtract timestamps on the same stated clock/date. A later observation must not be silently used at an earlier decision.`, "seconds");
      add("research", `A stored premium is $${money(premium)} with multiplier 100. A provider separately specifies a 50-share adjusted deliverable. What dollar premium is quoted for one contract?`, premium * 100, `Premium amount uses premium multiplier 100; deliverable and exercise cash are separate fields.`);
      add("research", `A replay holds ${3 + x} contracts. A filter flags their exit quote as stale and no other exit is supplied. How many open contracts remain unresolved?`, 3 + x, `A missing acceptable exit does not delete the held position or turn it into a closed trade.`, "count");
      break;
    case 17: {
      const s = 100 + x, strike = 100 + x, bond = strike / 1.05, call = 12 + x / 10;
      add("valuation", `For ideal European options with no dividends, spot is $${s}, strike $${strike}, one-year discount factor 1/1.05, and call $${money(call)}. By put-call parity, what is the put?`, call - s + bond, `C − P = S − PV(K), so P = C − S + K/1.05. Assumptions matter; this does not directly price an American exercise feature.`, "USD/share");
      add("valuation", `A one-step model starts at $${100 + x} and ends at $${120 + x} or $${80 + x}. A $${100 + x} call pays $20 or $0. What hedge holds in shares replicate its payoff difference?`, 0.5, `(Up payoff − down payoff) / (up stock − down stock) = 0.5 shares per option share.`, "shares");
      add("valuation", `In that one-step model (start $${100 + x}, up $${120 + x}, down $${80 + x}) the gross risk-free growth factor is 1.05. What is risk-neutral up probability as a percent?`, (1.05 * (100 + x) - (80 + x)) / 40 * 100, `(1.05 × start − down) / (up − down). This is a pricing weight under the model.`, "percent");
      break;
    }
    case 18: {
      const params = { spot: 100 + x, strike: 100, years: 1, volatility: 0.2, rate: 0.05, dividendYield: 0, right: up ? "call" as const : "put" as const };
      add("valuation", `Under the European Black–Scholes model, S=${100 + x}, K=100, T=1 year, volatility=20%, continuously compounded r=5%, dividend yield=0. What is the ${params.right} price per share?`, europeanPrice(params), `The standard European formula gives ${money(europeanPrice(params))}/share. It excludes early exercise, discrete dividends, spreads and model error.`, "USD/share", "Use d1=(ln(S/K)+(r−q+σ²/2)T)/(σ√T), d2=d1−σ√T, then the call/put formula.");
      add("valuation", `One standard option has vega $${(0.38 + x / 1000).toFixed(3)}/share/IV point. What is the vega-only estimated contract change for a ${up ? "+2" : "−2"}-point IV change?`, (up ? 2 : -2) * (0.38 + x / 1000) * 100, `±2 × stated vega × 100. A larger repricing should use the model rather than freeze vega.`);
      add("valuation", `A numerical delta calculation uses model prices $${money(10.46 + x / 10)} at S=${money(100.01 + x)} and $${money(10.44 + x / 10)} at S=${money(99.99 + x)}. What is central-difference delta?`, 1, `Price difference / stock-input difference = 0.02 / 0.02 = 1. These deliberately rounded prices illustrate why adequate numerical precision matters.`, "premium dollars per stock dollar");
      break;
    }
    case 19:
      add("valuation", `For the same underlying and aligned at-the-money forward-moneyness, assume a deterministic-variance term-structure model with total variance σ²T. Its IV is ${20 + x / 10}% at 0.5 year and ${25 + x / 10}% at 1 year. Under this stipulated model, what is forward volatility from 0.5 to 1 year in percent?`, Math.sqrt(((0.25 + x / 1000) ** 2 - (0.2 + x / 1000) ** 2 * 0.5) / 0.5) * 100, `Subtract the two total variances and divide by the 0.5-year interval, then square-root. This is model-implied, not a guaranteed future realized volatility.`, "percent");
      add("valuation", `Same-expiry European call prices at equally spaced strikes are $${12 + x}, $${8 + x}, $${5 + x}. What is C(low) − 2C(mid) + C(high)?`, 1, `Low-strike price − twice middle-strike price + high-strike price = 1 per share. A negative value would violate this idealized convexity check before costs.`, "USD/share");
      add("valuation", `At strikes $${k} and $${k + 5}, same-expiry calls cost $${4 + x / 10} and $${6 + x / 10} under identical idealized terms. What is higher-strike price minus lower-strike price?`, 2, `Higher-strike price minus lower-strike price = 2 per share, flagging a monotonicity violation to investigate. A displayed inversion alone does not establish an executable arbitrage.`, "USD/share");
      break;
    case 20:
      add("research", `A stipulated sample collects $${1000 + x * 10} premium, pays $${700 + x * 5} option settlement losses, $100 hedging costs, and $50 fees. What net signed P&L remains?`, 150 + x * 5, `Premium minus settlement losses, hedging costs and fees. Premium is cash received, not profit by itself.`);
      add("research", `Over identical dates strategy return is ${8 + n}% and comparator return is 6%. What is the arithmetic return difference in percentage points?`, 2 + n, `Subtract returns over identical dates. Exposure and risk differences still need analysis.`, "percentage points");
      add("risk", `A strategy gains $${100 + x} in 9 supplied periods and loses $${1200 + x} in 1 period. What is cumulative signed P&L, before fees?`, 9 * (100 + x) - (1200 + x), `Nine gains less the one loss. A 90% observed win rate does not determine profitability.`);
      break;
    case 21:
      add("research", `A frozen rule makes ${20 + x} eligible decisions. The researcher later dislikes ${3 + n} outcomes. How many eligible decisions must remain in the audit population?`, 20 + x, `All originally eligible decisions stay. Outcomes cannot retroactively redefine eligibility.`, "count");
      add("research", `A chronological series has ${200 + x * 10} observations. A protocol reserves the final 20% before inspection. How many observations are reserved?`, (200 + x * 10) * 0.2, `The prespecified last fifth is reserved. If already examined, it is no longer an untouched final evaluation.`, "count");
      add("execution", `A frozen cost assumption is $${money(0.2 + x / 100)} per share round trip plus $2 total commissions per contract. What modeled round-trip cost applies to ${n} standard contracts?`, ((0.2 + x / 100) * 100 + 2) * n, `Apply spread/slippage cost × 100 and commissions per filled contract. This is a stated assumption, not observed execution.`);
      break;
    case 22:
      add("research", `A replay starts with $${10000 + x * 100} cash, buys 2 options at $2/share, pays $2 total fees, then sells 1 at $3/share with $1 fee. What cash remains?`, 10000 + x * 100 - 103, `Subtract $400 + $2; add $300 − $1. One long option remains and is separate from cash.`);
      add("research", `For that replay, the remaining option has a stipulated mark of $${money(2.5 + x / 100)}/share. What is its marked value? Multiplier 100.`, (2.5 + x / 100) * 100, `One remaining contract × supplied per-share mark × 100. A mark is not a promised liquidation fill.`);
      add("research", `Published index level starts at ${100 + x} and ends at ${110 + x}. What is the simple index return in percent?`, 10 / (100 + x) * 100, `Index-level change / initial level × 100. This does not reconstruct constituent option trades.`, "percent");
      break;
    case 23:
      add("research", `A trial log contains ${12 + x} tested variants, including ${3 + n} discarded variants. How many tried variants should the report disclose?`, 12 + x, `Disclose every tried variant, including discarded failures.`, "count");
      add("research", `An uncertainty exercise supplies effective sample size 25 and per-observation SD $${100 + x}. What estimated SE follows?`, (100 + x) / 5, `SD / √25. Using raw overlapping-trade count instead would understate uncertainty if dependence is ignored.`);
      add("execution", `A reported net result is +$${500 + x * 10}. A stress test adds $${5 + n} cost for each of 100 filled contracts. What stressed net result remains?`, 500 + x * 10 - (5 + n) * 100, `Deduct the additional cost from the already net result, rather than charging all original costs a second time.`);
      break;
    case 24:
      add("risk", `A hypothetical portfolio has +${200 + x} share-equivalent delta from position A and −${100 + x} from B. What is net local delta?`, 100, `Add signed exposures: net +100 share equivalents. A small net delta does not eliminate gamma, volatility or gap risk.`, "share equivalents");
      add("risk", `A joint stress produces P&L −$${400 + x} for A, −$${300 + x} for B, and +$100 for C, before $50 extra liquidation cost. What is total signed stressed P&L?`, -650 - 2 * x, `Add joint signed P&L then subtract liquidation cost. This scenario does not assume diversification survives the shock.`);
      add("risk", `Assignments require $${8000 + x * 100} cash. Immediately available cash is $${6000 + x * 100}; committed sale proceeds arrive later. What is the immediate funding gap?`, 2000, `Immediate obligations minus immediately available funds. Later proceeds do not meet the stated current deadline.`);
      break;
    case 25:
      add("risk", `A fictional project has a $${1000 + x * 10} resource budget, $${300 + x * 5} data cost and $200 computing cost. What budget remains for review and contingency?`, 500 + x * 5, `Subtract known data and computing expenses. Data access and review resources should be feasible before a large study begins.`);
      add("valuation", `A protective put costs $${money(premium)}/share for ${n} standard contracts. What total cash premium is paid before fees?`, premium * n * 100, `Per-share premium × 100 × contracts. Insurance cost must be related to the objective and protection supplied.`);
      add("risk", `A supplied portfolio delta is +${500 + x} shares. A hypothetical stock hedge shorts ${200 + x} shares. What is remaining local delta?`, 300, `Add signed stock exposure to the original local delta. Hedging one sensitivity leaves other risks.`, "share equivalents");
      break;
    case 26:
      add("research", `An audit ledger has $${5000 + x * 100} cash, 100 shares marked at $50, and one short option marked at $2/share. What is total marked equity? Multiplier 100.`, 9800 + x * 100, `Cash + $5000 stock − $200 option liability. All open positions remain in the account reconciliation.`);
      add("research", `A report reconciles ${90 + n + x} of ${100 + x} required decisions. How many decisions remain unresolved?`, 10 - n, `Required population minus reconciled decisions. A profitable result cannot substitute for a complete audit trail.`, "count");
      add("research", `A study reports mean $${10 + x} and estimated SE $5. Under the stipulated normal approximation, what is the upper 95% interval endpoint using 1.96 SE?`, 10 + x + 9.8, `Mean + 1.96 × SE. Whether this interval is defensible depends on the data, selection process and dependence treatment.`);
      break;
  }
  return rows;
}
export function makeGraduatePractice(moduleId: number, sequence: number): GraduatePracticeQuestion[] {
  return questions(moduleId, sequence).map(({ id, skill, prompt, unit, hint }) => ({ id, skill, prompt, unit, hint }));
}
export function gradeGraduatePractice(moduleId: number, sequence: number, answers: Record<string, number>): GraduatePracticeFeedback[] {
  const rows = questions(moduleId, sequence);
  if (!answers || typeof answers !== "object" || Array.isArray(answers) || Object.keys(answers).length !== rows.length) throw new TypeError("Answer all three questions, with no additional fields.");
  return rows.map(({ expected, explanation, tolerance, ...question }) => {
    if (!Object.hasOwn(answers, question.id) || typeof answers[question.id] !== "number" || !Number.isFinite(answers[question.id]) || Math.abs(answers[question.id]) > 1e12) throw new TypeError("Every answer must be a finite number for the issued question.");
    return { ...question, answer: answers[question.id], expected, correct: Math.abs(answers[question.id] - expected) <= tolerance, explanation };
  });
}
