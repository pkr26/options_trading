# Foundation practice and independent checks

Use the Week 1 check after [the opening lesson](ADVANCED_FIRST_WEEK.md), the 40 cases after Module 3 in [Volume 1](LESSONS_01_FOUNDATIONS.md), and the mixed exam after Module 6. Complete [the practical math bridge](FOUNDATION_MATH_BRIDGE.md) if any of its diagnostic questions were difficult. These are invented classroom contracts, not orders. Record every answer and your reasoning before opening [the separate answer key](FOUNDATION_ANSWER_KEY.md). Save first attempts; a later corrected answer is evidence of learning, not an erased mistake.

## Week 1 transfer check

These two cases use different numbers from [the opening lesson](ADVANCED_FIRST_WEEK.md). Try them without notes after its ten questions. Use standard stock options with a 100-share premium multiplier and no fees.

1. Buy one $45 call for $1.25. If the stock finishes at $48, calculate the premium paid, intrinsic value, and expiration profit. What is the expiration break-even price?
2. A call displays a $1.10 bid and $1.40 ask. Calculate the displayed one-contract cost to buy, proceeds from an immediate sale at an unchanged bid, and the difference. Does a midpoint order guarantee a fill?

Find their answers in [the separate key](FOUNDATION_ANSWER_KEY.md) only after committing your attempt. These are a transfer check for Week 1; the later 40 cases are Module 3's gate.

## Forty fresh expiration-payoff cases

Every row is **one standard, physically settled stock option** with premium multiplier **100** and deliverable **100 shares**. The premium is quoted in dollars per share. `F` is a hypothetical **total dollar fee for that position**, stated separately from premium. `S` is the stock price at expiration. Assume the option's intrinsic value is realized under the classroom expiration model; real exercise instructions, assignment, and broker procedures need separate checks.

For **each** row calculate: (a) premium cash paid or received, (b) intrinsic value or obligation, (c) total expiration profit or loss **after F**, (d) expiration break-even stock price **after F**, and (e) greatest idealized expiration loss, if it has a finite ceiling. For short puts, evaluate the maximum at stock price zero; for uncovered short calls, state that the theoretical loss has no finite ceiling. State the obligation separately for each short position that finishes in the money. Do not infer the actual broker's processing from the classroom model.

| Case | Position | Strike K | Premium | Final S | F |
| ---: | --- | ---: | ---: | ---: | ---: |
| 01 | Long call | $50 | $1.50 | $48 | $2 |
| 02 | Long call | $60 | $2.50 | $62 | $2 |
| 03 | Long call | $100 | $4.00 | $109 | $4 |
| 04 | Long call | $40 | $0.80 | $40 | $2 |
| 05 | Long call | $75 | $3.00 | $82 | $2 |
| 06 | Long call | $30 | $1.00 | $32 | $4 |
| 07 | Long call | $95 | $2.20 | $94 | $2 |
| 08 | Long call | $120 | $5.00 | $125 | $4 |
| 09 | Long call | $15 | $0.60 | $16 | $2 |
| 10 | Long call | $200 | $7.00 | $215 | $4 |
| 11 | Long put | $55 | $1.75 | $52 | $2 |
| 12 | Long put | $65 | $2.25 | $68 | $2 |
| 13 | Long put | $105 | $4.50 | $96 | $4 |
| 14 | Long put | $45 | $0.90 | $45 | $2 |
| 15 | Long put | $80 | $3.20 | $75 | $2 |
| 16 | Long put | $35 | $1.10 | $32 | $4 |
| 17 | Long put | $90 | $2.40 | $93 | $2 |
| 18 | Long put | $130 | $5.25 | $124 | $4 |
| 19 | Long put | $18 | $0.70 | $17 | $2 |
| 20 | Long put | $210 | $8.00 | $196 | $4 |
| 21 | Short uncovered call | $52 | $1.80 | $57 | $2 |
| 22 | Short uncovered call | $62 | $2.60 | $59 | $2 |
| 23 | Short uncovered call | $102 | $4.10 | $112 | $4 |
| 24 | Short uncovered call | $42 | $0.85 | $42 | $2 |
| 25 | Short uncovered call | $77 | $3.10 | $80 | $2 |
| 26 | Short uncovered call | $32 | $1.20 | $36 | $4 |
| 27 | Short uncovered call | $97 | $2.30 | $95 | $2 |
| 28 | Short uncovered call | $122 | $5.20 | $130 | $4 |
| 29 | Short uncovered call | $17 | $0.75 | $18 | $2 |
| 30 | Short uncovered call | $205 | $7.50 | $218 | $4 |
| 31 | Short put | $48 | $1.65 | $44 | $2 |
| 32 | Short put | $58 | $2.35 | $61 | $2 |
| 33 | Short put | $98 | $4.20 | $89 | $4 |
| 34 | Short put | $38 | $0.95 | $38 | $2 |
| 35 | Short put | $73 | $3.30 | $68 | $2 |
| 36 | Short put | $28 | $1.05 | $25 | $4 |
| 37 | Short put | $93 | $2.50 | $97 | $2 |
| 38 | Short put | $118 | $5.40 | $110 | $4 |
| 39 | Short put | $13 | $0.65 | $12 | $2 |
| 40 | Short put | $195 | $7.25 | $180 | $4 |

**Pass standard:** At least 36 of 40 complete rows correct on first attempt, with every premium-multiplier conversion, maximum-loss classification, and share/cash obligation correct after a new attempt. If you miss any safety-critical item, work a newly generated case with different numbers before advancing. Your tutor or peer can create one by changing K, premium, S, and F while keeping the stated contract terms. Do not retake only memorized rows. The compact numeric key and formulas are in [FOUNDATION_ANSWER_KEY.md](FOUNDATION_ANSWER_KEY.md).

For a fresh, reproducible changed-number retest, run `python3 scripts/generate_foundation_cases.py --seed 20261027 --output-dir practice_retest` from the project root. It writes separate question and answer Markdown files. Change the seed for each later attempt, keep the seed and first answers in [your learning record](LEARNING_RECORD_TEMPLATE.md), and open the generated key only afterward. The generator covers the same four standard-option position types; adjusted contracts and assignment remain separate safety exams.

## Mixed safety exam: attempt without notes

The numbers and situations here differ from the teaching examples. For numerical questions, show inputs, units, formula or cash-flow table, and answer. Where an exact contract term or broker procedure is missing, say what you would check.

1. For a physically settled stock **call** and **put**, state the buyer's right and the assigned writer's obligation. Does receiving premium cap a writer's loss?
2. A standard option shows `$1.25 bid / $1.45 ask`, a past last trade of `$1.70`, and multiplier 100. What is the displayed one-contract ask cost, bid proceeds, and immediate ask-to-bid difference before fees? Is the last trade a current sale price?
3. An **adjusted call** has quoted premium `$0.20` with premium multiplier 100. Its exact contract sheet says exercise requires **$50 cash** and delivers **10 current shares**, each worth $8 at the classroom settlement point. Total hypothetical fees are $2. Compute premium dollars, exercise value, intrinsic value, and net expiration profit. Explain why multiplying `(8 − 0.50) × 100` would be wrong.
4. You are short one standard $52 call and long one standard $57 call, with no shares. The short call is assigned early. Before any further action, what stock position, strike cash flow, and option position can appear? Does the long call automatically close?
5. You are assigned on one standard $45 put. What shares and strike cash move? If the account holds only $1,000 free cash, how much additional cash would the $4,500 purchase require before considering other account assets or broker action?
6. You buy one standard $80 call for $4. The stock finishes at $83; hypothetical fees total $2. What is the after-fee expiration profit or loss, and the after-fee break-even price?
7. A stock bought at $80 falls to $60. What was the percentage loss? What percentage gain from $60 restores $80?
8. A hypothetical $20,000 practice account has a classroom new-position risk cap of 0.25%. One long option costs `$0.45 × 100` plus $2 fees. How many whole contracts fit that cap? What if the quote is $0.55 instead? Explain the rounding rule.
9. A short American-style stock call appears out of the money at the regular close. Can you conclude it cannot be assigned that evening? What timing and broker facts would you check?
10. A cash-settled index call has strike 2,000, final settlement value 2,015, and multiplier 100. What cash amount does the long holder receive under the simplified exercise calculation? How many index shares arrive?
11. A learner owns 100 shares bought at $70 and sold one standard $75 call for $2. The stock finishes at $80 and the short call is assigned. Assume a $2 total hypothetical fee. Calculate combined stock-plus-call profit relative to original share cost.
12. A chain shows an option premium of $1.50 but hides its premium multiplier and adjusted deliverable. Can you compute the one-contract premium dollars and assignment shares with confidence? Name the missing contract fields and an authoritative place to verify an adjustment.

**Pass standard:** At least 11 of 12 correct on a first attempt; items 1, 3–5, 8–10, and 12 are safety-critical and must be correct on a fresh retest if missed. Explain every share and cash amount. A tutor or peer should change the numbers and scenario order for the retest. Until the operational cases are correct, stay in observation mode. This assessment is a foundation gate, not permission for live trading.
