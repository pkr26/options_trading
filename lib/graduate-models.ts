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
  const h = Math.min(0.01, p.spot / 2);
  if (!(h > 0) || p.years <= 0 || p.volatility < 0.0001) throw new RangeError("Sensitivities require positive spot, time and volatility.");
  const base = europeanPrice(p), up = europeanPrice({ ...p, spot: p.spot + h }), down = europeanPrice({ ...p, spot: p.spot - h });
  return { price: base, delta: (up - down) / (2 * h), gamma: (up - 2 * base + down) / (h * h), vega: (europeanPrice({ ...p, volatility: p.volatility + 0.0001 }) - europeanPrice({ ...p, volatility: p.volatility - 0.0001 })) / 0.0002 / 100, theta: europeanPrice({ ...p, years: Math.max(0, p.years - 1 / 365) }) - base };
}
export type StrategyInputs = { initialStock: number; finalStock: number; budget: number; putStrike: number; putPremium: number; callStrike: number; callPremium: number; fees: number };
export function strategyComparison(p: StrategyInputs) {
  for (const [key, value] of Object.entries(p)) finiteNumber(value, key, 0, 1e7);
  if (p.initialStock <= 0 || p.putStrike <= 0 || p.callStrike < p.putStrike) throw new RangeError("Use a positive stock/put strike and a call strike at least as high as the put strike.");
  const { initialStock: s, finalStock: f, budget: b, putStrike: kp, putPremium: pp, callStrike: kc, callPremium: cp, fees } = p;
  const variants = [
    { name: "Cash", outlay: 0, value: 0, shares: 0, initialCash: b },
    { name: "100 shares", outlay: 100 * s + fees, value: 100 * f, shares: 100, initialCash: b - 100 * s - fees },
    { name: "Protective put", outlay: 100 * (s + pp) + 2 * fees, value: 100 * Math.max(f, kp), shares: 100, initialCash: b - 100 * (s + pp) - 2 * fees },
    { name: "Collar", outlay: 100 * (s + pp - cp) + 3 * fees, value: 100 * Math.min(Math.max(f, kp), kc), shares: 100, initialCash: b - 100 * (s + pp - cp) - 3 * fees },
  ];
  return variants.map(v => ({ ...v, feasible: v.initialCash >= 0, finalWealth: v.initialCash + v.value, profit: v.value - v.outlay }));
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
