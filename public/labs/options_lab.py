"""Small, deterministic options research exercises. All bundled data are synthetic.

The fill model is an explicit assumption. A displayed quote and size never prove
that an order would have executed in a live market.
"""

from __future__ import annotations

import csv
import argparse
import hashlib
import json
import math
import random
import statistics
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from pathlib import Path


DATA = Path(__file__).parent / "data"


def finite_positive(value: float, name: str) -> None:
    if not math.isfinite(value) or value <= 0:
        raise ValueError(f"{name} must be positive and finite")


def finite_nonnegative(value: float, name: str) -> None:
    if not math.isfinite(value) or value < 0:
        raise ValueError(f"{name} must be nonnegative and finite")


@dataclass(frozen=True)
class Contract:
    symbol: str
    strike: float
    right: str
    multiplier: int = 100
    deliverable_shares: int = 100
    settlement: str = "physical"

    def __post_init__(self) -> None:
        finite_positive(self.strike, "strike")
        if self.right not in {"call", "put"}:
            raise ValueError("right must be call or put")
        if self.settlement not in {"physical", "cash"}:
            raise ValueError("settlement must be physical or cash")
        if (isinstance(self.multiplier, bool) or not isinstance(self.multiplier, int) or
                isinstance(self.deliverable_shares, bool) or not isinstance(self.deliverable_shares, int) or
                self.multiplier <= 0):
            raise ValueError("contract sizes must be integers and multiplier positive")
        if self.settlement == "physical" and self.deliverable_shares <= 0:
            raise ValueError("physical deliverable shares must be positive")
        if self.settlement == "cash" and self.deliverable_shares != 0:
            raise ValueError("cash settlement must have zero deliverable shares")


def intrinsic_cash(contract: Contract, spot: float) -> float:
    """Dollar intrinsic value for a no-cash-in-lieu physical deliverable.

    A real adjusted contract may have additional deliverables. Read its OCC memo.
    Cash-settled index exercise may use a specified settlement value, not spot.
    """
    finite_nonnegative(spot, "spot")
    stock_value = spot * (contract.multiplier if contract.settlement == "cash"
                          else contract.deliverable_shares)
    exercise_cash = contract.strike * contract.multiplier
    if contract.right == "call":
        return max(stock_value - exercise_cash, 0.0)
    return max(exercise_cash - stock_value, 0.0)


def expiration_profit(contract: Contract, spot: float, premium: float, qty: int = 1,
                      fees: float = 0.0) -> float:
    """Signed long/short expiration profit before separate funding effects."""
    if isinstance(qty, bool) or qty == 0 or not isinstance(qty, int):
        raise ValueError("qty must be a nonzero integer")
    if not math.isfinite(premium) or premium < 0 or not math.isfinite(fees) or fees < 0:
        raise ValueError("premium and fees must be finite and nonnegative")
    return qty * (intrinsic_cash(contract, spot) - premium * contract.multiplier) - fees


@dataclass
class Ledger:
    contract: Contract
    cash: float
    shares: int = 0
    option_qty: int = 0

    def trade_option(self, quantity_change: int, premium: float,
                     fee_per_contract: float = 0.0) -> None:
        if (isinstance(quantity_change, bool) or quantity_change == 0 or
                not isinstance(quantity_change, int)):
            raise ValueError("quantity_change must be a nonzero integer")
        if (not math.isfinite(premium) or premium < 0 or
                not math.isfinite(fee_per_contract) or fee_per_contract < 0):
            raise ValueError("invalid premium or fee")
        self.cash -= quantity_change * premium * self.contract.multiplier
        self.cash -= abs(quantity_change) * fee_per_contract
        self.option_qty += quantity_change

    def equity(self, spot: float, option_mark: float) -> float:
        finite_nonnegative(spot, "spot")
        if not math.isfinite(option_mark) or option_mark < 0:
            raise ValueError("invalid option mark")
        return self.cash + self.shares * spot + self.option_qty * option_mark * self.contract.multiplier

    def settle(self, spot_or_settlement_value: float) -> None:
        """Illustrative ITM expiry settlement of all contracts at supplied value.

        This is not an early-assignment, broker cutoff, pin-risk, or exercise-
        instruction model. The caller must supply the product's settlement value.
        """
        if self.option_qty == 0:
            return
        value = intrinsic_cash(self.contract, spot_or_settlement_value)
        if self.contract.settlement == "cash":
            self.cash += self.option_qty * value
        elif value > 0:
            if self.contract.right == "call":
                self.shares += self.option_qty * self.contract.deliverable_shares
                self.cash -= self.option_qty * self.contract.strike * self.contract.multiplier
            else:
                self.shares -= self.option_qty * self.contract.deliverable_shares
                self.cash += self.option_qty * self.contract.strike * self.contract.multiplier
        self.option_qty = 0


def normal_cdf(x: float) -> float:
    return 0.5 * (1 + math.erf(x / math.sqrt(2)))


def european_price(spot: float, strike: float, years: float, rate: float,
                   sigma: float, right: str = "call", dividend_yield: float = 0.0) -> float:
    """Black-Scholes-Merton European value per underlying unit."""
    finite_nonnegative(spot, "spot")
    finite_positive(strike, "strike")
    if not all(math.isfinite(x) for x in (years, rate, sigma, dividend_yield)):
        raise ValueError("model inputs must be finite")
    if years < 0 or sigma < 0 or right not in {"call", "put"}:
        raise ValueError("invalid time, volatility, or right")
    if years == 0:
        return max(spot - strike, 0.0) if right == "call" else max(strike - spot, 0.0)
    if spot == 0:
        return 0.0 if right == "call" else strike * math.exp(-rate * years)
    discounted_spot = spot * math.exp(-dividend_yield * years)
    discounted_strike = strike * math.exp(-rate * years)
    if sigma == 0:
        forward_intrinsic = discounted_spot - discounted_strike
        return max(forward_intrinsic, 0.0) if right == "call" else max(-forward_intrinsic, 0.0)
    width = sigma * math.sqrt(years)
    d1 = (math.log(spot / strike) + (rate - dividend_yield + sigma * sigma / 2) * years) / width
    d2 = d1 - width
    if right == "call":
        return discounted_spot * normal_cdf(d1) - discounted_strike * normal_cdf(d2)
    return discounted_strike * normal_cdf(-d2) - discounted_spot * normal_cdf(-d1)


def implied_vol_call(market_price: float, spot: float, strike: float,
                     years: float, rate: float, dividend_yield: float = 0.0) -> float:
    """Invert a European call; expand the upper bracket as needed."""
    if not math.isfinite(market_price) or years <= 0:
        raise ValueError("invalid market price or time")
    lower = european_price(spot, strike, years, rate, 0.0, "call", dividend_yield)
    upper = spot * math.exp(-dividend_yield * years)
    if market_price < lower - 1e-10 or market_price >= upper:
        raise ValueError("call price is outside finite-volatility model bounds")
    if abs(market_price - lower) < 1e-10:
        return 0.0
    low, high = 0.0, 0.5
    while european_price(spot, strike, years, rate, high, "call", dividend_yield) < market_price:
        high *= 2
        if high > 1024:
            raise ValueError("could not bracket implied volatility")
    for _ in range(90):
        mid = (low + high) / 2
        if european_price(spot, strike, years, rate, mid, "call", dividend_yield) < market_price:
            low = mid
        else:
            high = mid
    return (low + high) / 2


def finite_delta(spot: float, strike: float, years: float, rate: float,
                 sigma: float, right: str = "call", h: float = 0.01) -> float:
    if not math.isfinite(h) or h <= 0 or h >= spot:
        raise ValueError("invalid finite difference step")
    up = european_price(spot + h, strike, years, rate, sigma, right)
    down = european_price(spot - h, strike, years, rate, sigma, right)
    return (up - down) / (2 * h)


def american_put_tree(spot: float, strike: float, years: float, rate: float,
                      sigma: float, steps: int) -> float:
    """No-dividend CRR tree; compare convergence as steps increase."""
    if (isinstance(steps, bool) or not isinstance(steps, int) or steps < 1 or
            not math.isfinite(years) or years <= 0 or
            not math.isfinite(sigma) or sigma <= 0 or not math.isfinite(rate)):
        raise ValueError("invalid tree inputs")
    finite_positive(spot, "spot")
    finite_positive(strike, "strike")
    dt = years / steps
    up = math.exp(sigma * math.sqrt(dt))
    down = 1 / up
    growth = math.exp(rate * dt)
    p = (growth - down) / (up - down)
    if p < 0 or p > 1:
        raise ValueError("tree step does not admit a risk-neutral weight")
    values = [max(strike - spot * up ** j * down ** (steps - j), 0.0)
              for j in range(steps + 1)]
    discount = math.exp(-rate * dt)
    for step in range(steps - 1, -1, -1):
        values = [max(strike - spot * up ** j * down ** (step - j),
                      discount * (p * values[j + 1] + (1 - p) * values[j]))
                  for j in range(step + 1)]
    return values[0]


def call_slice_violations(strikes: list[float], prices: list[float], tolerance: float = 1e-8) -> list[str]:
    """Necessary monotonicity/convexity checks for same-expiry European calls."""
    if len(strikes) != len(prices) or len(strikes) < 3:
        raise ValueError("need at least three matched strikes and prices")
    if any(not math.isfinite(x) for x in strikes + prices):
        raise ValueError("slice must be finite")
    if any(b <= a for a, b in zip(strikes, strikes[1:])):
        raise ValueError("strikes must strictly increase")
    issues = []
    if any(p < 0 for p in prices):
        issues.append("negative call price")
    if any(a < b - tolerance for a, b in zip(prices, prices[1:])):
        issues.append("call price rises with strike")
    slopes = [(b - a) / (kb - ka) for a, b, ka, kb in zip(prices, prices[1:], strikes, strikes[1:])]
    if any(a > b + tolerance for a, b in zip(slopes, slopes[1:])):
        issues.append("call prices are not convex in strike")
    return issues


def aware_time(value: str) -> datetime:
    timestamp = datetime.fromisoformat(value)
    if timestamp.tzinfo is None or timestamp.utcoffset() is None:
        raise ValueError("timestamp needs a UTC offset")
    return timestamp


@dataclass(frozen=True)
class Quote:
    timestamp: datetime
    option_id: str
    spot: float
    bid: float
    ask: float
    bid_size: int
    ask_size: int


def load_quotes(path: Path) -> list[Quote]:
    with path.open(newline="") as handle:
        return [Quote(aware_time(row["timestamp"]), row["option_id"], float(row["spot"]),
                      float(row["bid"]), float(row["ask"]), int(row["bid_size"]),
                      int(row["ask_size"])) for row in csv.DictReader(handle)]


def quote_flags(quote: Quote) -> list[str]:
    issues = []
    if not all(math.isfinite(x) for x in (quote.spot, quote.bid, quote.ask)):
        issues.append("nonfinite")
    if quote.spot <= 0 or quote.bid <= 0 or quote.ask <= 0:
        issues.append("zero_or_negative")
    if quote.bid >= quote.ask:
        issues.append("locked_or_crossed")
    if quote.bid_size <= 0 or quote.ask_size <= 0:
        issues.append("no_visible_size")
    return issues


def select_quote(quotes: list[Quote], option_id: str, signal_time: datetime,
                 order_time: datetime, max_age: timedelta = timedelta(minutes=5)) -> Quote | None:
    """Select a quote observed after signal availability and before order time."""
    if signal_time.tzinfo is None or order_time.tzinfo is None or signal_time >= order_time:
        raise ValueError("signal must precede order in aware timestamps")
    candidates = [q for q in quotes if q.option_id == option_id and
                  signal_time < q.timestamp <= order_time]
    latest = max(candidates, key=lambda q: q.timestamp, default=None)
    if latest is None or quote_flags(latest) or order_time - latest.timestamp > max_age:
        return None
    return latest


@dataclass(frozen=True)
class ModeledFill:
    status: str
    quantity: int
    price: float | None
    fees: float


def simulate_order(quote: Quote, side: str, quantity: int, limit: float,
                   case: str = "base", fee_per_contract: float = 1.0) -> ModeledFill:
    """Deterministic assumption, not an observation or promised live execution."""
    if quote_flags(quote):
        raise ValueError("cannot use rejected quote")
    if side not in {"buy", "sell"} or case not in {"optimistic", "base", "adverse"}:
        raise ValueError("invalid side or case")
    if (isinstance(quantity, bool) or not isinstance(quantity, int) or quantity < 1 or
            not math.isfinite(limit) or limit < 0 or
            not math.isfinite(fee_per_contract) or fee_per_contract < 0):
        raise ValueError("invalid order input")
    midpoint = (quote.bid + quote.ask) / 2
    if side == "buy":
        price = {"optimistic": midpoint, "base": quote.ask, "adverse": quote.ask + 0.05}[case]
        size = quote.ask_size
        meets_limit = price <= limit
    else:
        price = {"optimistic": midpoint, "base": quote.bid, "adverse": max(quote.bid - 0.05, 0)}[case]
        size = quote.bid_size
        meets_limit = price >= limit
    filled = min(quantity, size) if meets_limit else 0
    status = "modeled_fill" if filled == quantity else "modeled_partial" if filled else "no_fill"
    return ModeledFill(status, filled, price if filled else None, filled * fee_per_contract)


def load_decisions(path: Path) -> list[dict[str, str]]:
    with path.open(newline="") as handle:
        return list(csv.DictReader(handle))


def toy_backtest(quotes: list[Quote], decisions: list[dict[str, str]], case: str = "base",
                 multiplier: int = 100) -> list[dict]:
    """One long contract per decision; synthetic fixture has 100 multiplier."""
    if isinstance(multiplier, bool) or not isinstance(multiplier, int) or multiplier <= 0:
        raise ValueError("multiplier must be a positive integer")
    results = []
    for row in decisions:
        ident = row["option_id"]
        entry_signal = aware_time(row["entry_signal"])
        entry_order = aware_time(row["entry_order"])
        exit_signal = aware_time(row["exit_signal"])
        exit_order = aware_time(row["exit_order"])
        if not (entry_signal < entry_order <= exit_signal < exit_order):
            raise ValueError("entry signal/order must precede exit signal/order")
        entry = select_quote(quotes, ident, entry_signal, entry_order)
        result = {"id": row["id"], "status": "rejected_quote", "pnl": None,
                  "entry_status": "not_attempted", "exit_status": "not_attempted",
                  "entry_fill_price": None, "entry_fees": 0.0, "entry_cash_outlay": 0.0,
                  "exit_fill_price": None, "open_qty": 0}
        if entry is None:
            results.append(result)
            continue
        buy = simulate_order(entry, "buy", 1, float(row["entry_limit"]), case)
        result["entry_status"] = buy.status
        if buy.quantity == 0:
            result["status"] = "unfilled_entry"
            results.append(result)
            continue
        result["entry_fill_price"] = round(buy.price, 4)
        result["entry_fees"] = buy.fees
        result["entry_cash_outlay"] = round(buy.quantity * buy.price * multiplier + buy.fees, 2)
        result["open_qty"] = buy.quantity
        exit_quote = select_quote(quotes, ident, exit_signal, exit_order)
        if exit_quote is None:
            result["status"] = "open_position_requires_mark_and_review"
            result["exit_status"] = "rejected_quote"
            results.append(result)
            continue
        sell = simulate_order(exit_quote, "sell", buy.quantity, float(row["exit_limit"]), case)
        result["exit_status"] = sell.status
        result["exit_fill_price"] = round(sell.price, 4) if sell.price is not None else None
        result["open_qty"] = buy.quantity - sell.quantity
        if sell.quantity != buy.quantity:
            result["status"] = "open_position_requires_mark_and_review"
        else:
            result["status"] = "closed_modeled"
            result["pnl"] = round((sell.price - buy.price) * multiplier - buy.fees - sell.fees, 2)
        results.append(result)
    return results


def max_drawdown(initial_cash: float, net_cash_changes: list[float]) -> float:
    finite_positive(initial_cash, "initial_cash")
    equity = high = initial_cash
    worst = 0.0
    for pnl in net_cash_changes:
        if not math.isfinite(pnl):
            raise ValueError("nonfinite pnl")
        equity += pnl
        high = max(high, equity)
        worst = max(worst, (high - equity) / high)
    return worst


def brier_score(probabilities: list[float], outcomes: list[int]) -> float:
    if not probabilities or len(probabilities) != len(outcomes):
        raise ValueError("probabilities and outcomes must be matched")
    if any(not math.isfinite(p) or p < 0 or p > 1 for p in probabilities):
        raise ValueError("probabilities must lie in [0,1]")
    if any(y not in {0, 1} for y in outcomes):
        raise ValueError("outcomes must be binary")
    return statistics.mean((p - y) ** 2 for p, y in zip(probabilities, outcomes))


def block_bootstrap_mean_interval(values: list[float], block_size: int = 3,
                                  replicates: int = 2000, seed: int = 7) -> tuple[float, float]:
    """Illustrative moving-block interval; block choice and stationarity matter."""
    if block_size < 1 or len(values) < 2 * block_size or replicates < 100:
        raise ValueError("insufficient sample or replicates")
    if any(not math.isfinite(x) for x in values):
        raise ValueError("values must be finite")
    rng = random.Random(seed)
    starts = list(range(len(values) - block_size + 1))
    sample_means = []
    for _ in range(replicates):
        drawn = []
        while len(drawn) < len(values):
            i = rng.choice(starts)
            drawn.extend(values[i:i + block_size])
        sample_means.append(statistics.mean(drawn[:len(values)]))
    sample_means.sort()
    return (sample_means[int(0.025 * replicates)], sample_means[int(0.975 * replicates)])


def label_event(start: date, end: date, development_end: date, validation_end: date,
                embargo_days: int = 0) -> str:
    """Exclude events that cross or begin near a split boundary."""
    if end < start or not (development_end < validation_end) or embargo_days < 0:
        raise ValueError("invalid event or split")
    if end <= development_end:
        return "development"
    if start <= development_end + timedelta(days=embargo_days):
        return "excluded_overlap"
    if end <= validation_end:
        return "validation"
    if start <= validation_end + timedelta(days=embargo_days):
        return "excluded_overlap"
    return "final"


def stress_portfolio(cash: float, shares: int, options: list[tuple[Contract, int]],
                     spot: float, sigma: float, years: float,
                     scenarios: list[dict[str, float]]) -> list[dict[str, float]]:
    """Illustrative European repricing and hypothetical liquidation haircut."""
    if not math.isfinite(cash):
        raise ValueError("cash must be finite")
    if isinstance(shares, bool) or not isinstance(shares, int):
        raise ValueError("shares must be an integer")
    finite_nonnegative(spot, "spot")
    finite_nonnegative(sigma, "sigma")
    finite_nonnegative(years, "years")
    if any(isinstance(qty, bool) or not isinstance(qty, int) for _, qty in options):
        raise ValueError("option quantities must be integers")
    if any(c.settlement == "physical" and c.deliverable_shares != c.multiplier
           for c, _ in options):
        raise ValueError("model does not price adjusted contract deliverables")

    def value(s: float, vol: float, t: float) -> float:
        return cash + shares * s + sum(qty * c.multiplier * european_price(
            s, c.strike, t, 0.0, vol, c.right) for c, qty in options)

    baseline = value(spot, sigma, years)
    out = []
    for scenario in scenarios:
        if not all(math.isfinite(scenario[key]) for key in
                   ("spot_change", "vol_change", "days_forward", "spread_haircut")):
            raise ValueError("scenario inputs must be finite")
        finite_nonnegative(scenario["days_forward"], "days_forward")
        finite_nonnegative(scenario["spread_haircut"], "spread_haircut")
        s = spot + scenario["spot_change"]
        vol = sigma + scenario["vol_change"]
        finite_nonnegative(s, "stressed spot")
        finite_nonnegative(vol, "stressed sigma")
        t = max(0.0, years - scenario["days_forward"] / 365)
        liquidation_haircut = sum(abs(qty) * c.multiplier for c, qty in options) * scenario["spread_haircut"]
        stressed = value(s, vol, t) - liquidation_haircut
        out.append({"value": stressed, "change": stressed - baseline,
                    "haircut": liquidation_haircut})
    return out


def check_manifest(path: Path = DATA / "manifest.json") -> None:
    manifest = json.loads(path.read_text())
    if manifest.get("data_kind") != "SYNTHETIC":
        raise ValueError("lab manifest must identify synthetic data")
    for name, expected in manifest["sha256"].items():
        actual = hashlib.sha256((path.parent / name).read_bytes()).hexdigest()
        if actual != expected:
            raise ValueError(f"fixture hash mismatch: {name}")


def demo_report(include_final: bool = False) -> dict:
    check_manifest()
    fixture = json.loads((DATA / "manifest.json").read_text())
    quotes = load_quotes(DATA / "quotes.csv")
    decisions = load_decisions(DATA / "decisions.csv")
    trades = {case: toy_backtest(quotes, decisions, case,
                                multiplier=fixture["contract"]["multiplier"])
              for case in ("optimistic", "base", "adverse")}
    with (DATA / "daily_observations.csv").open(newline="") as handle:
        observations = list(csv.DictReader(handle))
    train, validation = observations[:12], observations[12:]
    if len(train) != 12 or len(validation) != 6:
        raise ValueError("unexpected development/validation fixture length")
    baseline = statistics.mean(int(row["event"]) for row in train)
    active_pnl = [float(row["net_pnl"]) for row in train + validation]
    benchmark_pnl = [float(row["benchmark_pnl"]) for row in train + validation]
    report = {
        "quote_rows": len(quotes), "rejected_quote_rows": sum(bool(quote_flags(q)) for q in quotes),
        "modeled_trades": trades,
        "baseline_probability_from_development": baseline,
        "validation_count": len(validation), "final_count_reserved": 6,
        "mean_daily_net_minus_benchmark": statistics.mean(a - b for a, b in zip(active_pnl, benchmark_pnl)),
        "block_interval": block_bootstrap_mean_interval([a - b for a, b in zip(active_pnl, benchmark_pnl)]),
        "active_max_drawdown": max_drawdown(20000, active_pnl),
        "benchmark_max_drawdown": max_drawdown(20000, benchmark_pnl),
    }
    if include_final:
        with (DATA / "final_observations.csv").open(newline="") as handle:
            final = list(csv.DictReader(handle))
        if len(final) != 6:
            raise ValueError("unexpected final fixture length")
        final_probabilities = [float(row["forecast_probability"]) for row in final]
        final_outcomes = [int(row["event"]) for row in final]
        report["final_brier_forecast"] = brier_score(final_probabilities, final_outcomes)
        report["final_brier_baseline"] = brier_score([baseline] * len(final), final_outcomes)
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Synthetic teaching lab; no real market data")
    parser.add_argument("--open-final", action="store_true", help="show synthetic final segment after freezing rules")
    args = parser.parse_args()
    print(json.dumps(demo_report(include_final=args.open_final), indent=2))
