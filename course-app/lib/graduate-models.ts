/** Deterministic teaching models; all prices and fills are illustrative. */
export function finiteNumber(value: number, name: string, min = -Infinity, max = Infinity): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) throw new RangeError(`${name} is outside its finite range.`);
}
export function normalCdf(x: number): number {
  finiteNumber(x, "Normal argument");
  const z = Math.abs(x), t = 1 / (1 + 0.2316419 * z);
  const tail = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI) * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - tail : tail;
}
export type EuropeanInputs = { spot: number; strike: number; years: number; volatility: number; rate: number; dividendYield: number; right: "call" | "put" };
export function europeanPrice(p: EuropeanInputs): number {
  finiteNumber(p.spot, "Spot", 0, 1e7); finiteNumber(p.strike, "Strike", 0.01, 1e7);
  finiteNumber(p.years, "Years", 0, 100); finiteNumber(p.volatility, "Volatility", 0, 5);
  finiteNumber(p.rate, "Rate", -0.5, 1); finiteNumber(p.dividendYield, "Dividend yield", 0, 1);
  if (p.right !== "call" && p.right !== "put") throw new RangeError("Choose call or put.");
  const { spot: s, strike: k, years: t, volatility: v, rate: r, dividendYield: q, right } = p;
  if (t === 0) return Math.max(right === "call" ? s - k : k - s, 0);
  const discountedStock = s * Math.exp(-q * t), discountedStrike = k * Math.exp(-r * t);
  if (s === 0 || v === 0) return Math.max(right === "call" ? discountedStock - discountedStrike : discountedStrike - discountedStock, 0);
  const d1 = (Math.log(s / k) + (r - q + v * v / 2) * t) / (v * Math.sqrt(t)), d2 = d1 - v * Math.sqrt(t);
  return Math.max(right === "call" ? discountedStock * normalCdf(d1) - discountedStrike * normalCdf(d2) : discountedStrike * normalCdf(-d2) - discountedStock * normalCdf(-d1), 0);
}
export function europeanSensitivities(p: EuropeanInputs) {
  const price = europeanPrice(p);
  if (p.spot <= 0 || p.years <= 0 || p.volatility < 0.0001) throw new RangeError("Sensitivities require positive spot, time and volatility.");
  const rootTime = Math.sqrt(p.years);
  const volatilityOverTerm = p.volatility * rootTime;
  const d1 = (Math.log(p.spot / p.strike) + (p.rate - p.dividendYield + p.volatility ** 2 / 2) * p.years) / volatilityOverTerm;
  const discount = Math.exp(-p.dividendYield * p.years);
  const density = Math.exp(-0.5 * d1 * d1) / Math.sqrt(2 * Math.PI);
  const delta = discount * (p.right === "call" ? normalCdf(d1) : -normalCdf(-d1));
  const gamma = discount * density / (p.spot * volatilityOverTerm);
  const vega = p.spot * discount * density * rootTime / 100;
  const theta = europeanPrice({ ...p, years: Math.max(0, p.years - 1 / 365) }) - price;
  return { price, delta, gamma, vega, theta };
}
export type StrategyInputs = { initialStock: number; finalStock: number; budget: number; putStrike: number; putPremium: number; callStrike: number; callPremium: number; fees: number };

// Near cancellation, preserve the entered decimal amounts (including sub-cents).
// The weights are whole shares or orders. Rounding cash to cents would erase real shortfalls.
function sumCash(terms: [amount: number, weight: number][]): number {
  const values = terms.map(([amount, weight]) => amount * weight);
  const total = values.reduce((sum, value) => sum + value, 0);
  const scale = values.reduce((sum, value) => sum + Math.abs(value), 0);
  if (Math.abs(total) > 8 * Number.EPSILON * scale) return total;

  const decimals = terms.map(([amount, weight]) => {
    const [mantissa, exponent = "0"] = amount.toString().split("e");
    const [whole, fraction = ""] = mantissa.split(".");
    return { digits: whole + fraction, exponent: Number(exponent) - fraction.length, weight };
  });
  const unit = Math.min(...decimals.map(decimal => decimal.exponent));
  const units = decimals.reduce((sum, { digits, exponent, weight }) =>
    sum + BigInt(digits + "0".repeat(exponent - unit)) * BigInt(weight), BigInt(0));
  return Number(`${units}e${unit}`);
}

export function strategyComparison(p: StrategyInputs) {
  for (const [key, value] of Object.entries(p)) finiteNumber(value, key, 0, 1e7);
  if (p.initialStock <= 0 || p.putStrike <= 0 || p.callStrike < p.putStrike) throw new RangeError("Use a positive stock/put strike and a call strike at least as high as the put strike.");
  const { initialStock: s, finalStock: f, budget: b, putStrike: kp, putPremium: pp, callStrike: kc, callPremium: cp, fees } = p;
  // Frictionless zero-rate, no-dividend bounds apply to per-share prices before order fees.
  const tolerance = 16 * Number.EPSILON * Math.max(1, s, kp, kc, pp, cp);
  const boundIssue = (label: string, price: number, lower: number, upper: number): string | null => {
    if (price < lower - tolerance) return `${label} is below its $${lower} per-share lower bound.`;
    if (price > upper + tolerance) return `${label} exceeds its $${upper} per-share upper bound.`;
    return null;
  };
  const putIssue = boundIssue("The put premium", pp, Math.max(kp - s, 0), kp)
    || (pp >= kp ? "The put premium must be strictly below its strike at a positive stock price." : null);
  const callIssue = boundIssue("The call premium", cp, Math.max(s - kc, 0), s)
    || (cp >= s ? "The call premium must be strictly below the stock price at a positive strike." : null);
  const collarPrice = s + pp - cp;
  let collarIssue = [putIssue, callIssue].filter(Boolean).join(" ")
    || boundIssue("The collar price (stock + put − call)", collarPrice, kp, kc);
  if (!collarIssue && kp < kc) {
    // P(0)=0. Convexity requires P(Kc)/Kc >= P(Kp)/Kp. Parity supplies P(Kc).
    const impliedPut = sumCash([[cp, 1], [kc, 1], [s, -1]]);
    const lowerScale = kc * pp, upperScale = kp * impliedPut;
    const productTolerance = 16 * Number.EPSILON * (Math.abs(lowerScale) + kp * (cp + kc + s));
    if (cp > 0 && sumCash([[s, 1], [pp, 1], [cp, -1], [kp, -1]]) <= 0) {
      collarIssue = "A positive call premium requires the collar price to exceed the lower strike: the terminal stock can finish above the cap.";
    } else if (pp > 0 && sumCash([[kc, 1], [s, -1], [pp, -1], [cp, 1]]) <= 0) {
      collarIssue = "A positive put premium requires the collar price to be below the upper strike: the terminal stock can finish below the floor.";
    } else if (upperScale < lowerScale - productTolerance) {
      collarIssue = "The two quotes violate strike convexity. Put–call parity implies too small a put price per dollar of strike at the higher strike.";
    }
  }
  const variants = [
    { name: "Cash", quoteIssue: null, outlay: 0, value: 0, shares: 0, initialCash: b },
    { name: "100 shares", quoteIssue: null, outlay: 100 * s + fees, value: 100 * f, shares: 100, initialCash: sumCash([[b, 1], [s, -100], [fees, -1]]) },
    { name: "Protective put", quoteIssue: putIssue, outlay: 100 * (s + pp) + 2 * fees, value: 100 * Math.max(f, kp), shares: 100, initialCash: sumCash([[b, 1], [s, -100], [pp, -100], [fees, -2]]) },
    { name: "Collar", quoteIssue: collarIssue, outlay: 100 * collarPrice + 3 * fees, value: 100 * Math.min(Math.max(f, kp), kc), shares: 100, initialCash: sumCash([[b, 1], [s, -100], [pp, -100], [cp, 100], [fees, -3]]) },
  ];
  return variants.map(v => ({ ...v, feasible: v.quoteIssue === null && v.initialCash >= 0, finalWealth: v.initialCash + v.value, profit: v.value - v.outlay }));
}
/** Snapshot after a short call in a two-call credit spread is assigned. */
export function callAssignmentLedger(shortStrike: number, longStrike: number, credit: number, initialCash: number, stock: number, longMark: number) {
  for (const [name, value] of Object.entries({ shortStrike, longStrike, credit, initialCash, stock, longMark })) finiteNumber(value, name, 0, 1e7);
  if (shortStrike <= 0 || longStrike <= shortStrike) throw new RangeError("The long call strike must exceed the positive short strike.");
  const openingCash = initialCash + credit * 100;
  const cash = openingCash + shortStrike * 100;
  return { openingCash, cash, shares: -100, shortCalls: 0, longCalls: 1, equity: cash - stock * 100 + longMark * 100, coverCash: stock * 100, longExerciseCash: longStrike * 100 };
}
export type ReplayEvent = { time: string; event: string; filled: number; price: number | null; remaining: number; note: string };
export function executionReplay(limit: number): { events: ReplayEvent[]; filled: number; remaining: number; cashPaid: number; average: number | null } {
  finiteNumber(limit, "Limit", 0, 20);
  // Specified synthetic fills, not an inference from displayed size or queue position.
  let remaining = 3, cashPaid = 0, filled = 0;
  const events: ReplayEvent[] = [{ time: "09:30:00", event: `Buy 3, limit $${limit.toFixed(2)}`, filled: 0, price: null, remaining, note: "Order submitted; no position exists yet." }];
  for (const [time, ask, available] of [["09:30:02", 2.1, 1], ["09:30:05", 2.2, 1]] as const) {
    const fill = limit >= ask ? Math.min(available, remaining) : 0;
    remaining -= fill; filled += fill; cashPaid += fill * ask * 100;
    events.push({ time, event: `Supplied fill opportunity at $${ask.toFixed(2)}`, filled: fill, price: fill ? ask : null, remaining, note: fill ? "This episode explicitly supplies a fill; displayed quotes alone would not establish it." : "Ask exceeds the limit: no fill in this episode." });
  }
  events.push({ time: "09:30:08", event: "Cancellation acknowledged", filled: 0, price: null, remaining: 0, note: `${remaining} unfilled contracts cancelled. Existing fills remain in the account.` });
  return { events, filled, remaining: 0, cashPaid, average: filled ? cashPaid / (filled * 100) : null };
}
