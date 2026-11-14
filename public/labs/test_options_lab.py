"""Checks for accounting, chronology, quote quality, and model boundaries."""

import math
import unittest
from dataclasses import replace
from datetime import date, timedelta

from options_lab import (
    DATA, Contract, Ledger, american_put_tree, aware_time, block_bootstrap_mean_interval,
    brier_score, call_slice_violations, check_manifest, demo_report, european_price,
    expiration_profit, finite_delta, implied_vol_call, intrinsic_cash, label_event,
    load_decisions, load_quotes, quote_flags, select_quote, simulate_order,
    stress_portfolio, toy_backtest,
)


class AccountingTests(unittest.TestCase):
    def test_opening_balances_require_finite_cash_and_whole_positions(self):
        contract = Contract("C100", 100, "call")
        for bad_cash in (math.nan, math.inf, -math.inf, True, "100"):
            with self.subTest(cash=bad_cash), self.assertRaises(ValueError):
                Ledger(contract, cash=bad_cash)
        for field in ("shares", "option_qty"):
            for bad_quantity in (0.5, 1.0, True, False, math.nan, math.inf, None):
                with self.subTest(field=field, value=bad_quantity), self.assertRaises(ValueError):
                    Ledger(contract, cash=10000, **{field: bad_quantity})
        ledger = Ledger(contract, cash=-200, shares=-10, option_qty=-1)
        self.assertEqual((ledger.cash, ledger.shares, ledger.option_qty), (-200, -10, -1))

    def test_public_methods_reject_corrupted_state_before_mutating_it(self):
        contract = Contract("C100", 100, "call")
        for field, value in (("cash", math.nan), ("shares", 0.5), ("option_qty", True)):
            for operation in (lambda row: row.trade_option(1, 3),
                              lambda row: row.settle(110),
                              lambda row: row.equity(110, 4)):
                ledger = Ledger(contract, cash=10000, option_qty=1)
                setattr(ledger, field, value)
                before = vars(ledger).copy()
                with self.subTest(field=field, operation=operation), self.assertRaises(ValueError):
                    operation(ledger)
                self.assertEqual(vars(ledger), before)

    def test_invalid_trade_and_settlement_leave_balances_unchanged(self):
        ledger = Ledger(Contract("C100", 100, "call"), cash=10000, option_qty=1)
        before = (ledger.cash, ledger.shares, ledger.option_qty)
        for premium in (math.nan, math.inf, -1, 1e308):
            with self.subTest(premium=premium), self.assertRaises(ValueError):
                ledger.trade_option(1, premium)
            self.assertEqual((ledger.cash, ledger.shares, ledger.option_qty), before)
        for spot in (math.nan, math.inf, -1):
            with self.subTest(spot=spot), self.assertRaises(ValueError):
                ledger.settle(spot)
            self.assertEqual((ledger.cash, ledger.shares, ledger.option_qty), before)

    def test_accounting_rejects_boolean_quantities(self):
        contract = Contract("C100", 100, "call")
        with self.assertRaises(ValueError):
            expiration_profit(contract, 110, 3, qty=True)
        ledger = Ledger(contract, cash=10000)
        with self.assertRaises(ValueError):
            ledger.trade_option(True, 3)
        self.assertEqual((ledger.cash, ledger.option_qty), (10000, 0))

    def test_standard_payoffs_and_fees(self):
        call = Contract("C105", 105, "call")
        self.assertEqual(expiration_profit(call, 112, 3), 400)
        self.assertEqual(expiration_profit(call, 106, 3), -200)
        self.assertEqual(expiration_profit(call, 112, 3, qty=-1, fees=2), -402)

    def test_adjusted_deliverable_differs_from_premium_multiplier(self):
        adjusted = Contract("ADJ", 0.5, "call", 100, 10)
        self.assertEqual(intrinsic_cash(adjusted, 5), 0)
        self.assertEqual(intrinsic_cash(adjusted, 6), 10)
        self.assertEqual(expiration_profit(adjusted, 6, 0.05), 5)

    def test_zero_spot_put_and_short_put_max_loss(self):
        put = Contract("P95", 95, "put")
        self.assertEqual(intrinsic_cash(put, 0), 9500)
        self.assertEqual(expiration_profit(put, 0, 2, qty=-1), -9300)
        ledger = Ledger(put, cash=10000)
        ledger.trade_option(-1, 2)
        ledger.settle(0)
        self.assertEqual((ledger.cash, ledger.shares, ledger.equity(0, 0)),
                         (700, 100, 700))

    def test_short_call_assignment_leaves_short_shares_and_cash(self):
        ledger = Ledger(Contract("C100", 100, "call"), cash=10000)
        ledger.trade_option(-1, 3)
        self.assertEqual(ledger.cash, 10300)
        ledger.settle(110)
        self.assertEqual((ledger.option_qty, ledger.shares, ledger.cash), (0, -100, 20300))
        self.assertEqual(ledger.equity(110, 0), 9300)

    def test_short_put_assignment_and_cash_settlement(self):
        short_put = Ledger(Contract("P95", 95, "put"), cash=10000)
        short_put.trade_option(-1, 2)
        short_put.settle(90)
        self.assertEqual((short_put.shares, short_put.cash), (100, 700))
        self.assertEqual(short_put.equity(90, 0), 9700)
        cash_call = Ledger(Contract("INDEX", 100, "call", deliverable_shares=0,
                                    settlement="cash"), cash=10000)
        cash_call.trade_option(1, 3)
        cash_call.settle(110)
        self.assertEqual((cash_call.shares, cash_call.cash), (0, 10700))
        self.assertEqual(cash_call.contract.deliverable_shares, 0)
        with self.assertRaises(ValueError):
            Contract("bad_index", 100, "call", settlement="cash")


class ModelTests(unittest.TestCase):
    def test_bsm_reference_and_greek(self):
        self.assertAlmostEqual(european_price(100, 100, 1, 0, .2), 7.965567, places=5)
        self.assertAlmostEqual(finite_delta(100, 100, 1, 0, .2), .539828, places=4)
        self.assertAlmostEqual(implied_vol_call(10, 100, 100, 1, 0), .2513, places=4)

    def test_iv_expands_beyond_introductory_fixed_bracket(self):
        vol = implied_vol_call(90, 100, 100, 1, 0)
        self.assertGreater(vol, 3)
        self.assertAlmostEqual(european_price(100, 100, 1, 0, vol), 90, places=8)
        with self.assertRaises(ValueError):
            implied_vol_call(101, 100, 100, 1, 0)

    def test_finite_input_and_put_call_parity_with_dividend_yield(self):
        with self.assertRaises(ValueError):
            european_price(math.inf, 100, 1, 0, .2)
        with self.assertRaises(ValueError):
            Contract("bad", math.nan, "call")
        call = european_price(100, 105, .5, .03, .25, "call", .01)
        put = european_price(100, 105, .5, .03, .25, "put", .01)
        self.assertAlmostEqual(call - put,
                               100 * math.exp(-.01 * .5) - 105 * math.exp(-.03 * .5),
                               places=9)
        self.assertAlmostEqual(european_price(0, 100, 1, 0, .2, "put"), 100)

    def test_american_put_and_slice_checks(self):
        european_put = european_price(90, 100, 1, .05, .2, "put")
        tree = american_put_tree(90, 100, 1, .05, .2, 100)
        self.assertGreaterEqual(tree, european_put)
        self.assertEqual(call_slice_violations([90, 100, 110], [15, 10, 6]), [])
        self.assertIn("call prices are not convex in strike",
                      call_slice_violations([90, 100, 110], [15, 10, 2]))
        with self.assertRaises(ValueError):
            american_put_tree(90, 100, 1, .05, math.inf, 100)


class DataExecutionTests(unittest.TestCase):
    def test_direct_quote_sizes_cannot_create_invalid_contract_fills(self):
        quote = load_quotes(DATA / "quotes.csv")[0]
        for field in ("bid_size", "ask_size"):
            for invalid in (0.5, 1.0, True, False, math.nan, math.inf, -math.inf, None):
                changed = replace(quote, **{field: invalid})
                with self.subTest(field=field, size=invalid):
                    self.assertIn("invalid_visible_size", quote_flags(changed))
                    for side in ("buy", "sell"):
                        with self.assertRaises(ValueError):
                            simulate_order(changed, side, 1, 3)
            for unavailable in (0, -1):
                changed = replace(quote, **{field: unavailable})
                with self.subTest(field=field, size=unavailable):
                    self.assertIn("no_visible_size", quote_flags(changed))
                    with self.assertRaises(ValueError):
                        simulate_order(changed, "buy", 1, 3)

    def test_backtest_rejects_exit_before_entry(self):
        quotes = load_quotes(DATA / "quotes.csv")
        decision = load_decisions(DATA / "decisions.csv")[0]
        backward = dict(decision, exit_signal=decision["entry_signal"],
                        exit_order=decision["entry_order"])
        with self.assertRaises(ValueError):
            toy_backtest(quotes, [backward])
        # Even a missing entry must not hide an invalid decision chronology.
        with self.assertRaises(ValueError):
            toy_backtest([], [backward])

    def test_fixture_manifest_and_quote_rejections(self):
        check_manifest()
        quotes = load_quotes(DATA / "quotes.csv")
        self.assertEqual(len(quotes), 13)
        self.assertEqual(sum(bool(quote_flags(q)) for q in quotes), 2)
        self.assertTrue(all(q.timestamp.tzinfo for q in quotes))
        with self.assertRaises(ValueError):
            aware_time("2026-01-05T15:42:00")
        self.assertIn("locked_or_crossed", quote_flags(replace(quotes[0], ask=quotes[0].bid)))

    def test_quote_timing_and_no_backfill_over_bad_latest_quote(self):
        quotes = load_quotes(DATA / "quotes.csv")
        signal = aware_time("2026-01-05T15:40:00-05:00")
        order = aware_time("2026-01-05T15:42:00-05:00")
        good = select_quote(quotes, "SYN-C100-FEB26", signal, order)
        self.assertEqual(good.bid, 2)
        later_bad = replace(good, timestamp=aware_time("2026-01-05T15:41:30-05:00"), bid=4)
        self.assertIsNone(select_quote([good, later_bad], good.option_id, signal, order))
        self.assertIsNone(select_quote([good], good.option_id, signal,
                                       aware_time("2026-01-05T15:50:00-05:00")))

    def test_order_nonfill_and_partial_are_preserved(self):
        q = load_quotes(DATA / "quotes.csv")[0]
        self.assertEqual(simulate_order(q, "buy", 1, 2.1).status, "no_fill")
        partial = simulate_order(q, "buy", 6, 3)
        self.assertEqual((partial.status, partial.quantity, partial.fees),
                         ("modeled_partial", 5, 5))
        for bad_quantity in (0, 1.5, True):
            with self.assertRaises(ValueError):
                simulate_order(q, "buy", bad_quantity, 3)
        with self.assertRaises(ValueError):
            simulate_order(q, "buy", 1, 3, fee_per_contract=math.nan)

    def test_toy_backtest_keeps_nonfills_and_cost_sensitivity(self):
        quotes = load_quotes(DATA / "quotes.csv")
        decisions = load_decisions(DATA / "decisions.csv")
        base = toy_backtest(quotes, decisions, "base")
        self.assertEqual([row["status"] for row in base],
                         ["closed_modeled"] * 4 + ["unfilled_entry", "rejected_quote"])
        self.assertEqual([round(row["pnl"]) for row in base[:4]], [38, -42, 3, 33])
        optimistic = toy_backtest(quotes, decisions, "optimistic")
        adverse = toy_backtest(quotes, decisions, "adverse")
        self.assertGreater(sum(row["pnl"] for row in optimistic[:4]),
                           sum(row["pnl"] for row in base[:4]))
        self.assertGreater(sum(row["pnl"] for row in base[:4]),
                           sum(row["pnl"] for row in adverse[:4]))

    def test_missing_exit_quote_retains_open_exposure(self):
        quotes = load_quotes(DATA / "quotes.csv")
        decision = load_decisions(DATA / "decisions.csv")[0]
        one_entry_quote = [q for q in quotes if q.timestamp.date() == date(2026, 1, 5)]
        result = toy_backtest(one_entry_quote, [decision])[0]
        self.assertEqual(result["entry_status"], "modeled_fill")
        self.assertEqual(result["entry_fill_price"], 2.2)
        self.assertEqual(result["entry_cash_outlay"], 221)
        self.assertEqual(result["open_qty"], 1)
        self.assertEqual(result["exit_status"], "rejected_quote")
        self.assertEqual(result["status"], "open_position_requires_mark_and_review")
        self.assertIsNone(result["pnl"])


class ResearchTests(unittest.TestCase):
    def test_stress_rejects_negative_time_and_haircuts(self):
        call = Contract("C100", 100, "call")
        neutral = {"spot_change": 0, "vol_change": 0,
                   "days_forward": 0, "spread_haircut": 0}
        for key, value in (("days_forward", -1), ("spread_haircut", -.1),
                           ("spot_change", math.nan), ("vol_change", -.3)):
            with self.subTest(key=key), self.assertRaises(ValueError):
                stress_portfolio(20000, 0, [(call, 1)], 100, .2, .25,
                                 [dict(neutral, **{key: value})])
        with self.assertRaises(ValueError):
            stress_portfolio(20000, 0, [(call, .5)], 100, .2, .25, [neutral])
        # Validation applies even when an empty option list would bypass pricing.
        with self.assertRaises(ValueError):
            stress_portfolio(20000, 0, [], 100, .2, .25,
                             [dict(neutral, spot_change=-101)])

    def test_final_segment_is_hidden_until_explicitly_opened(self):
        working = demo_report()
        self.assertNotIn("final_brier_forecast", working)
        self.assertEqual(working["final_count_reserved"], 6)

    def test_overlap_exclusion_and_block_uncertainty(self):
        dev, val = date(2026, 1, 20), date(2026, 2, 10)
        self.assertEqual(label_event(date(2026, 1, 19), date(2026, 1, 21), dev, val),
                         "excluded_overlap")
        self.assertEqual(label_event(date(2026, 1, 23), date(2026, 1, 25), dev, val,
                                     embargo_days=2), "validation")
        interval = block_bootstrap_mean_interval([1, -2, 1, -2, 1, -2, 1, -2], 2, 1000)
        self.assertLess(interval[0], 0)
        self.assertGreater(interval[1], -1.5)
        self.assertAlmostEqual(brier_score([.5, .75], [0, 1]), .15625)

    def test_portfolio_joint_shocks_and_liquidation_haircut(self):
        long_call = Contract("C100", 100, "call")
        baseline = stress_portfolio(20000, 0, [(long_call, 1)], 100, .2, .25,
                                    [{"spot_change": 0, "vol_change": 0,
                                      "days_forward": 0, "spread_haircut": 0}])[0]
        self.assertAlmostEqual(baseline["change"], 0)
        shock = stress_portfolio(20000, 0, [(long_call, 1)], 100, .2, .25,
                                 [{"spot_change": -10, "vol_change": .1,
                                   "days_forward": 5, "spread_haircut": .1}])[0]
        self.assertEqual(shock["haircut"], 10)
        self.assertLess(shock["change"], 0)
        wipeout = stress_portfolio(20000, 0, [(Contract("P100", 100, "put"), 1)],
                                   100, .2, .25,
                                   [{"spot_change": -100, "vol_change": .1,
                                     "days_forward": 5, "spread_haircut": .1}])[0]
        self.assertTrue(math.isfinite(wipeout["value"]))
        with self.assertRaises(ValueError):
            stress_portfolio(20000, 0, [(Contract("ADJ", 100, "call", 100, 10), 1)],
                             100, .2, .25, [])


if __name__ == "__main__":
    unittest.main()
