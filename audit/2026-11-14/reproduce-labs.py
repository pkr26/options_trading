"""Bounded, nonmutating reproductions of invalid inputs accepted by lab helpers."""
from dataclasses import replace
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "labs"))
from options_lab import Contract, Ledger, load_quotes, quote_flags, simulate_order

ledger = Ledger(Contract("C100", 100, "call"), cash=10000, option_qty=0.5)
ledger.settle(110)
print(json.dumps({"case": "fractional opening contract", "cash": ledger.cash, "shares": ledger.shares}))

boolean_ledger = Ledger(Contract("C100", 100, "call"), cash=10000, option_qty=True)
boolean_ledger.settle(110)
print(json.dumps({"case": "boolean opening contract", "cash": boolean_ledger.cash, "shares": boolean_ledger.shares}))

quote = load_quotes(ROOT / "labs/data/quotes.csv")[0]
for label, size in [("fractional", 0.5), ("boolean", True), ("nan", float("nan"))]:
    changed = replace(quote, ask_size=size)
    fill = simulate_order(changed, "buy", 1, 3)
    print(json.dumps({"case": label + " quote size", "flags": quote_flags(changed), "fill_status": fill.status, "filled_quantity": fill.quantity}))
