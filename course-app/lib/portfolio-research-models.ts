/** Fictional teaching models. These are sensitivity and accounting exercises. */
export type StressPosition = { label: string; spot: number; shares: number; contracts: number; delta: number; gamma: number; vega: number; loading: number };
export type PortfolioStressInput = { positions: StressPosition[]; marketShockPercent: number; ivShockPoints: number; initialEquity: number; liquidCash: number; cashObligation: number; additionalCollateral: number; exitCost: number; lossLimit: number };
function finite(value: number, label: string, min = -1e9, max = 1e9) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new RangeError(`${label} is outside its finite range.`);
}
export function portfolioStress(p: PortfolioStressInput) {
  if (!Array.isArray(p.positions) || p.positions.length < 1 || p.positions.length > 20) throw new RangeError("Supply 1–20 teaching positions.");
  finite(p.marketShockPercent, "Market shock", -50, 50); finite(p.ivShockPoints, "IV shock", -50, 100);
  for (const name of ["initialEquity", "liquidCash", "cashObligation", "additionalCollateral", "exitCost", "lossLimit"] as const) finite(p[name], name, 0);
  const rows = p.positions.map(position => {
    if (!position.label?.trim()) throw new RangeError("Name every position.");
    finite(position.spot, "Spot", 0.01, 1e6); finite(position.shares, "Shares", -1e6, 1e6); finite(position.contracts, "Contracts", -1e4, 1e4);
    if (!Number.isInteger(position.shares) || !Number.isInteger(position.contracts)) throw new RangeError("Use whole shares and contracts.");
    finite(position.delta, "Long-option delta", -1, 1); finite(position.gamma, "Long-option gamma", 0, 100); finite(position.vega, "Long-option vega", 0, 1000); finite(position.loading, "Joint shock loading", 0, 2);
    const move = position.spot * p.marketShockPercent / 100 * position.loading;
    const deltaShares = position.shares + position.contracts * 100 * position.delta;
    const positionGamma = position.contracts * 100 * position.gamma;
    const positionVega = position.contracts * 100 * position.vega;
    const deltaPnl = deltaShares * move, gammaPnl = 0.5 * positionGamma * move ** 2, vegaPnl = positionVega * p.ivShockPoints;
    return { label: position.label, move, deltaShares, positionGamma, positionVega, deltaPnl, gammaPnl, vegaPnl, localPnl: deltaPnl + gammaPnl + vegaPnl };
  });
  const total = (field: "deltaPnl" | "gammaPnl" | "vegaPnl" | "localPnl") => rows.reduce((sum, row) => sum + row[field], 0);
  const localPnl = total("localPnl"), markedEquity = p.initialEquity + localPnl;
  const grossCashRequired = p.cashObligation + p.additionalCollateral + p.exitCost;
  const cashHeadroom = p.liquidCash - grossCashRequired;
  return { rows, deltaPnl: total("deltaPnl"), gammaPnl: total("gammaPnl"), vegaPnl: total("vegaPnl"), localPnl, markedEquity,
    conservativeLiquidationEstimate: markedEquity - p.exitCost, grossCashRequired, cashHeadroom, cashShortfall: Math.max(-cashHeadroom, 0),
    lossLimitBreached: Math.max(0, -(localPnl - p.exitCost)) > p.lossLimit,
    approximationWarning: Math.abs(p.marketShockPercent) > 5 || Math.abs(p.ivShockPoints) > 5 };
}

export const researchIssueIds = ["lookahead", "holdout", "costs", "benchmark"] as const;
export type ResearchIssue = typeof researchIssueIds[number];
export type ResearchCase = { seed: number; quoteTime: string; decisionTime: string; variantsTried: number; holdoutDescription: string; costDescription: string; benchmarkDescription: string; grossPnl: number; modeledCosts: number; benchmarkPnl: number };
export function makeResearchCase(seed: number): ResearchCase {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 1_000_000) throw new RangeError("Use an integer teaching seed from 0 to 1,000,000.");
  const leak = seed % 2 === 0, peeked = Math.floor(seed / 2) % 2 === 0, omitCosts = Math.floor(seed / 4) % 2 === 0, wrongBenchmark = Math.floor(seed / 8) % 2 === 0;
  return { seed, quoteTime: leak ? "10:00:02" : "09:59:58", decisionTime: "10:00:00", variantsTried: 20 + seed % 11,
    holdoutDescription: peeked ? "The final month was opened after each variant and helped select the winning variant. The report labels this month an untouched holdout." : "The final month was locked until the rule, costs, and comparator were frozen. It was evaluated once; every tried variant is disclosed.",
    costDescription: omitCosts ? "The headline result is gross P&L; the report calls it the return after trading costs. A separate cost ledger is supplied below." : "The reported strategy result deducts the supplied cost ledger once. Gross P&L and modeled costs are both preserved below.",
    benchmarkDescription: wrongBenchmark ? "The strategy averaged twice the stock exposure of the stock comparator, but the report attributes the full P&L difference to option selection skill." : "The comparator is aligned to the strategy's stated capital, dates and stock exposure; differences are reported with these assumptions and uncertainty.",
    grossPnl: 500 + seed % 25 * 10, modeledCosts: 600 + seed % 13 * 10, benchmarkPnl: 100 + seed % 7 * 20 };
}
export function gradeResearchCase(seed: number, selected: Record<ResearchIssue, boolean>) {
  const episode = makeResearchCase(seed);
  if (!selected || Object.keys(selected).length !== 4 || researchIssueIds.some(id => !Object.hasOwn(selected, id) || typeof selected[id] !== "boolean")) throw new RangeError("Assess each of the four issue categories.");
  const expected: Record<ResearchIssue, boolean> = {lookahead: seed % 2 === 0, holdout: Math.floor(seed / 2) % 2 === 0, costs: Math.floor(seed / 4) % 2 === 0, benchmark: Math.floor(seed / 8) % 2 === 0};
  const explanations: Record<ResearchIssue, string> = {
    lookahead: expected.lookahead ? "The 10:00:02 quote occurs after the 10:00:00 decision. It was unavailable at the decision time and must not support that earlier action." : "The supplied quote precedes the decision on the same clock. This specific timestamp check passes; stale quotes and other leaks still need separate review.",
    holdout: expected.holdout ? "Repeatedly opening the final period makes it part of selection. It cannot be described as untouched; reserve genuinely later data and retain all variants." : "The packet describes a single evaluation after freezing the method and disclosing trials. That supports the stated process; it does not prove the sample is representative or the strategy profitable.",
    costs: expected.costs ? "The headline labels gross P&L as net. Deduct the separately supplied modeled costs exactly once before comparing with the benchmark." : "The packet explicitly deducts the modeled costs once. Their realism, missing costs and execution assumptions still need independent checks.",
    benchmark: expected.benchmark ? "Twice the stock exposure is a different risk allocation. The full P&L gap cannot be attributed to option selection skill without an exposure-matched comparison." : "The packet supplies aligned capital, dates and exposure. This addresses the stated mismatch; benchmark choice and residual risk remain assumptions to challenge.",
  };
  const feedback = researchIssueIds.map(id => ({id, selected: selected[id], expected: expected[id], correct: selected[id] === expected[id], explanation: explanations[id]}));
  const netPnl = episode.grossPnl - episode.modeledCosts;
  return { feedback, score: feedback.filter(item => item.correct).length, netPnl, netDifference: netPnl - episode.benchmarkPnl,
    conclusion: "This is an audit of stipulated synthetic evidence. Correcting a report does not establish a live market edge; selection, dependence, uncertainty and genuinely later evaluation still matter." };
}
