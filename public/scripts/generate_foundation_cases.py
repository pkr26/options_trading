"""Generate changed-number, fictional expiration-payoff practice and a separate key."""

from __future__ import annotations

import argparse
from decimal import Decimal as D
from pathlib import Path
from random import Random


POSITIONS = ("Long call", "Long put", "Short uncovered call", "Short put")


def money(value: D, *, signed: bool = False) -> str:
    if signed:
        return f"{'+' if value >= 0 else '−'}${abs(value):,.2f}"
    return f"${value:,.2f}"


def make_case(rng: Random, position: str, number: int) -> dict:
    strike = D(rng.randrange(20, 201, 5))
    premium = D(rng.randrange(2, 41)) / 4
    final = max(D(0), strike + D(rng.randrange(-25, 26)))
    if position == "Short put" and number == 4:
        final = D(0)
    fees = D(rng.randrange(1, 7))
    intrinsic = D(100) * max(final - strike if "call" in position else strike - final, D(0))
    long = position.startswith("Long")
    premium_cash = D(100) * premium * (D(-1) if long else D(1))
    pnl = premium_cash + intrinsic * (D(1) if long else D(-1)) - fees
    fee_per_share = fees / 100
    if position == "Long call":
        breakeven, max_loss = strike + premium + fee_per_share, -premium_cash + fees
    elif position == "Long put":
        breakeven, max_loss = strike - premium - fee_per_share, -premium_cash + fees
    elif position == "Short uncovered call":
        breakeven, max_loss = strike + premium - fee_per_share, None
    else:
        breakeven, max_loss = strike - premium + fee_per_share, 100 * strike - premium_cash + fees
    return dict(number=number, position=position, strike=strike, premium=premium,
                final=final, fees=fees, premium_cash=premium_cash,
                intrinsic=intrinsic, pnl=pnl, breakeven=breakeven, max_loss=max_loss)


def create_files(seed: int, count: int, output_dir: Path) -> tuple[Path, Path]:
    if count < 4 or count % 4:
        raise ValueError("count must be a positive multiple of four")
    rng = Random(seed)
    cases = [make_case(rng, POSITIONS[(n - 1) % 4], n) for n in range(1, count + 1)]
    output_dir.mkdir(parents=True, exist_ok=True)
    questions_path = output_dir / f"payoff_questions_seed_{seed}.md"
    answers_path = output_dir / f"payoff_answers_seed_{seed}.md"
    intro = (
        f"# Fictional payoff retest · seed {seed}\n\n"
        "These are classroom expiration calculations for standard, physically settled "
        "stock options with 100 premium multiplier and 100-share deliverable. "
        "The stated fee is the total fee for one position. For each row find premium "
        "cash paid or received, intrinsic value or obligation, after-fee P&L, "
        "after-fee break-even, and greatest idealized expiration loss. State share "
        "obligations for in-the-money short options. Save your first answers before "
        "opening the separate key.\n\n"
    )
    q_lines = [intro, "| Case | Position | Strike | Premium per share | Final stock | Total fee |",
               "| ---: | --- | ---: | ---: | ---: | ---: |"]
    a_lines = [f"# Answer key · seed {seed}\n\n",
               "| Case | Premium cash | Intrinsic/obligation | After-fee P&L | After-fee break-even | Greatest idealized expiration loss |",
               "| ---: | ---: | ---: | ---: | ---: | ---: |"]
    for c in cases:
        q_lines.append(f"| {c['number']:02d} | {c['position']} | {money(c['strike'])} | "
                       f"{money(c['premium'])} | {money(c['final'])} | {money(c['fees'])} |")
        loss = "unbounded" if c["max_loss"] is None else money(c["max_loss"])
        a_lines.append(f"| {c['number']:02d} | {money(c['premium_cash'], signed=True)} | "
                       f"{money(c['intrinsic'])} | {money(c['pnl'], signed=True)} | "
                       f"{money(c['breakeven'])} | {loss} |")
    a_lines.append("\nA short in-the-money call can require delivering 100 shares for 100 × strike cash. "
                   "A short in-the-money put can require paying 100 × strike cash to receive 100 shares. "
                   "Actual assignment timing and account outcomes depend on contract and broker rules.\n")
    questions_path.write_text("\n".join(q_lines) + "\n", encoding="utf-8")
    answers_path.write_text("\n".join(a_lines) + "\n", encoding="utf-8")
    return questions_path, answers_path


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--seed", type=int, default=20261026)
    parser.add_argument("--count", type=int, default=40)
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    questions, answers = create_files(args.seed, args.count, args.output_dir)
    print(f"Questions: {questions}\nAnswers:   {answers}")


if __name__ == "__main__":
    main()
