export type PracticalCaseId = "A" | "B" | "C" | "D";
export type PracticalStage = "initial" | "transfer";
type Unit = "USD" | "USD/share" | "contracts" | "shares";
type Field = { key: string; label: string; unit: Unit };
export type PracticalForm = {
  id: PracticalCaseId;
  stage: PracticalStage;
  title: string;
  scenario: string;
  fields: Field[];
  reasoningPrompt: string;
};
export type PracticalCheck = { key: string; correct: boolean; expected: number; explanation: string };
type KeyedField = Field & Omit<PracticalCheck, "key" | "correct">;
type Case = Pick<PracticalForm, "title" | "scenario" | "reasoningPrompt"> & { fields: KeyedField[] };

const contractTerms = "These fictional U.S. stock options expire January 15, 2027. Each is American-style, physically settled and unadjusted, with a 100 premium multiplier and a 100-share deliverable. Option prices and marks are per share. Use only the stated fees. Exclude taxes, interest, dividends and borrow costs.";
const field = (key: string, label: string, unit: Unit, expected: number, explanation: string): KeyedField =>
  ({ key, label, unit, expected, explanation });

function ticketFields(ticket: 1 | 2, side: "buy" | "sell", orderSize: number, initialPosition: number, limitCents: number, quoteCents: number, size: number): KeyedField[] {
  const eligible = side === "buy" ? quoteCents <= limitCents : quoteCents >= limitCents;
  const filled = eligible ? Math.min(orderSize, size) : 0;
  const limit = limitCents / 100, quote = quoteCents / 100;
  const fee = filled * 0.75;
  const premiumCents = filled * quoteCents * 100;
  const premium = premiumCents / 100;
  const open = side === "buy" ? initialPosition + filled : initialPosition - filled;
  const cash = side === "buy" ? premium + fee : premium - fee;
  const prefix = `Ticket ${ticket}`;
  const price = `$${quote.toFixed(2)} ${side === "buy" ? "ask" : "bid"}`;
  const fillExplanation = eligible
    ? `The ${price} meets the $${limit.toFixed(2)} ${side} limit. The order requests ${orderSize} and displayed size is ${size}, so ${filled} fill.`
    : `The ${price} fails the $${limit.toFixed(2)} ${side} limit. The order receives zero fills.`;
  return [
    field(`t${ticket}Filled`, `${prefix} · Filled quantity`, "contracts", filled, fillExplanation),
    field(`t${ticket}Unfilled`, `${prefix} · Unfilled quantity`, "contracts", orderSize - filled, `Requested ${orderSize} minus ${filled} filled leaves ${orderSize - filled} unfilled.`),
    field(`t${ticket}Open`, `${prefix} · Open long position after this ticket`, "contracts", open, `This independent account starts with ${initialPosition} long. ${side === "buy" ? "Add" : "Subtract"} ${filled} filled to obtain the final position.`),
    field(`t${ticket}Fees`, `${prefix} · Fees paid`, "USD", fee, `Only filled contracts incur fees. ${filled} × $0.75 = $${fee.toFixed(2)}.`),
    field(`t${ticket}Cash`, `${prefix} · ${side === "buy" ? "Total cash paid including fees" : "Net cash received after fees"}`, "USD", cash, `Gross premium is ${filled} × $${quote.toFixed(2)} × 100 = $${premium.toFixed(2)}. ${side === "buy" ? "Add" : "Subtract"} $${fee.toFixed(2)} in fees to get $${cash.toFixed(2)}.`),
  ];
}

const bank: Record<PracticalCaseId, Record<PracticalStage, Case>> = {
  A: {
    initial: {
      title: "Exercise and an immediate share sale",
      scenario: "You bought one ORCH $50 call for $1.80 and paid a $1 entry fee. At expiration ORCH is $51. You exercise the call, pay the strike for the shares, then sell all of them at $51 with no price change. The combined exercise and stock-sale fees are $1. The stock-sale proceeds arrive after you pay the strike. Use these same fixed fees for break-even.",
      reasoningPrompt: "Explain how the call can finish in the money while the account loses money. Which payment must be funded before the sale proceeds arrive?",
      fields: [
        field("intrinsic", "Intrinsic value of the whole contract", "USD", 100, "The right to buy at $50 when shares are $51 is worth ($51 − $50) × 100 = $100 at expiration."),
        field("exercisePayment", "Gross strike payment before share-sale proceeds", "USD", 5000, "Exercise requires paying $50 × 100 = $5,000 before the $5,100 sale proceeds arrive."),
        field("netResult", "Signed whole-case result after fees", "USD", -82, "Pay $181 on entry and $5,000 on exercise. Receive $5,100 from selling the shares and pay $1 in final fees. Net result is −$82."),
        field("breakEven", "After-fee expiration break-even share price", "USD/share", 51.82, "The exercised shares must recover $50 strike, $1.80 premium and $2 ÷ 100 in fees per share, giving $51.82."),
      ],
    },
    transfer: {
      title: "Choose a funded exit before expiration",
      scenario: "You bought one ORCH $52 call at $2.30 with a $1 entry fee. On January 14 ORCH is $54 and you have $4,800 in settled cash after that purchase, zero shares and no borrowing. The account requires the full strike payment before any share-sale proceeds. You must close the position today without adding cash. A sale to close at $2.20 for one contract is available as a stipulated fill with a $1 fee. Compare the exercise funding requirement with available cash, then book the funded exit.",
      reasoningPrompt: "Choose the exit that fits the cash rule, explain what happens to the shares, and distinguish the cash raised today from the result since entry.",
      fields: [
        field("exercisePayment", "Gross payment if you exercise", "USD", 5200, "The call would require $52 × 100 = $5,200 before a sale of the delivered shares."),
        field("shortfall", "Additional cash needed to fund exercise", "USD", 400, "The account has $4,800 after entry, leaving $5,200 − $4,800 = $400 unfunded."),
        field("saleReceipt", "Net cash received on selling the option to close", "USD", 219, "The option sale pays $2.20 × 100 less the $1 closing fee = $219."),
        field("netResult", "Signed round-trip result for the funded exit", "USD", -12, "The $219 closing receipt minus the $231 entry outlay gives −$12."),
        field("shares", "Stock shares after the funded exit", "shares", 0, "Selling the call closes the option. Without exercise, no shares are delivered."),
      ],
    },
  },
  B: {
    initial: {
      title: "Two independent buy-to-open tickets",
      scenario: "The fictional LIND $35 call snapshot is January 12 at 10:00 ET during the exercise's open session. The bid is $0.90 for four contracts and the ask is $1.10 for one. Ticket 1 buys to open two with a $1.00 limit. Ticket 2 buys to open two with a $1.10 limit. Evaluate each day order independently against the original snapshot from a flat account. A buy fills at the ask only if the ask is at or below its limit, up to displayed ask size. There are no later fills. Entry fees are $0.75 per filled contract.",
      reasoningPrompt: "Why do these two buy limits have different outcomes? Explain the distinction between the unfilled order quantity and the option position that exists after each ticket.",
      fields: [...ticketFields(1, "buy", 2, 0, 100, 110, 1), ...ticketFields(2, "buy", 2, 0, 110, 110, 1)],
    },
    transfer: {
      title: "Two independent sell-to-close tickets",
      scenario: "You own three LIND $35 calls. A fictional January 14 snapshot at 11:00 ET during the exercise's open session shows a $1.40 bid for two contracts and a $1.60 ask for four. Ticket 1 sells to close three with a $1.40 limit. Ticket 2 sells to close three with a $1.50 limit. Reset the three-contract position and quote before evaluating each independent day order. A sell fills at the bid only if the bid is at or above its limit, up to displayed bid size. There are no later fills. Sale fees are $0.75 per filled contract.",
      reasoningPrompt: "Which quote side controls this sale and what position needs a later decision? For a separate proposed order whose deliverable and quote timestamp are missing, record your decision and the two facts you need to verify.",
      fields: [...ticketFields(1, "sell", 3, 3, 140, 140, 2), ...ticketFields(2, "sell", 3, 3, 150, 140, 2)],
    },
  },
  C: {
    initial: {
      title: "Reconcile the cash from a completed round trip",
      scenario: "Start with $2,000 cash and no positions. On January 11 buy two MESA $40 puts for $0.95 each and pay $0.65 per contract in entry fees. On January 13 sell both puts to close at $1.25 each and pay $0.65 per contract in exit fees. Both transactions fill in full. There are no other cash flows or positions.",
      reasoningPrompt: "Trace each side's premium and fee. Why does the $250 gross sale premium differ from the completed profit, and what happened to the puts?",
      fields: [
        field("cashAfterEntry", "Cash balance after opening the position", "USD", 1808.70, "Deduct two × $0.95 × 100 and two × $0.65 from $2,000, leaving $1,808.70."),
        field("exitReceipt", "Net cash received on closing", "USD", 248.70, "The $250 gross sale premium less $1.30 in sale fees gives $248.70."),
        field("finalCash", "Final cash balance", "USD", 2057.40, "Add the $248.70 closing receipt to $1,808.70 in cash to get $2,057.40."),
        field("realized", "Signed realized round-trip result", "USD", 57.40, "Both puts were sold. Subtract the $191.30 entry outlay from the $248.70 closing receipt to obtain +$57.40."),
      ],
    },
    transfer: {
      title: "Reconcile a partial close and its remaining mark",
      scenario: "Start with $1,500 and no positions. Buy three identical MESA $38 puts at $1.20 on January 11 with a $0.50 fee per contract. On January 14 only two sell to close at $1.50, with a $0.75 fee on each sale. Mark each remaining put at $0.90 at the same moment. Allocate the identical purchase costs and entry fees equally by contract. There are no other flows or positions.",
      reasoningPrompt: "Explain which cash flows belong to the two completed contracts and how the remaining option enters equity. What depends on a future fill?",
      fields: [
        field("cashAfterEntry", "Cash balance after buying all three puts", "USD", 1138.50, "Premium of $360 and entry fees of $1.50 bring $1,500 down to $1,138.50."),
        field("finalCash", "Cash balance after the partial sale", "USD", 1437, "Two sold puts bring in $300 before $1.50 in sale fees. Add $298.50 to $1,138.50."),
        field("realized", "Signed realized result on the closed contracts only", "USD", 57.50, "Each sold put cost $120.50 including entry fee. The two closed contracts returned $298.50 after sale fees, generating $298.50 − $241 = +$57.50."),
        field("openContracts", "Long puts remaining", "contracts", 1, "Three opened less two sold leaves one put."),
        field("openValue", "Value of remaining option at its supplied mark", "USD", 90, "The one remaining put is marked at $0.90 × 100 = $90."),
        field("equity", "Account equity including the remaining option", "USD", 1527, "Combine $1,437 in cash with the $90 open-option mark to get $1,527."),
      ],
    },
  },
  D: {
    initial: {
      title: "Early assignment of a short put",
      scenario: "Start with $6,000 cash and no shares. Sell one TEAL $30 put at $1.40 and buy one TEAL $25 put at $0.40. On January 13 only the short put is assigned early. Record the share delivery and strike payment. TEAL is $28 and the unexercised long put is marked at $0.15. No further transactions occur. All fees are zero.",
      reasoningPrompt: "Identify the remaining option by right and strike. Compare the opening credit with the gross assignment payment, and explain how the stock and remaining option enter equity.",
      fields: [
        field("entryCredit", "Net cash received on opening both options", "USD", 100, "The $140 short-put premium less the $40 long-put premium leaves $100."),
        field("assignmentPayment", "Gross payment upon put assignment", "USD", 3000, "The assigned short $30 put requires purchasing 100 shares for $3,000."),
        field("cash", "Cash balance after assignment", "USD", 3100, "Start at $6,000, add the $100 credit, and pay $3,000 for shares."),
        field("shares", "Signed shares held after assignment", "shares", 100, "Put assignment delivers 100 shares that you must buy."),
        field("openContracts", "Remaining long $25 puts", "contracts", 1, "Only the short put was assigned. The long $25 put remains open."),
        field("openValue", "Remaining put at its supplied mark", "USD", 15, "One long put marked at $0.15 × 100 contributes $15."),
        field("equity", "Total marked equity", "USD", 5915, "Cash $3,100 + shares worth $2,800 + long put worth $15 = $5,915."),
        field("equityChange", "Signed change from starting equity", "USD", -85, "Ending marked equity of $5,915 less the starting $6,000 gives −$85."),
      ],
    },
    transfer: {
      title: "Early assignment of a short call",
      scenario: "Start with $7,500 cash, no shares and permission to carry short stock in this fictional account. Sell one TEAL $42 call for $1.60 and buy one TEAL $47 call for $0.55. On January 13 only the short call is assigned early. Deliver the shares at the strike using borrowed stock and book the sale proceeds. TEAL is $46 and the unexercised long call is marked at $0.45. No buyback or other transaction occurs. All fees are zero.",
      reasoningPrompt: "Identify the remaining right and strike. Explain why receiving cash on assignment can accompany a decline in equity and which exposure a share-price rise would increase.",
      fields: [
        field("entryCredit", "Net cash received on opening both options", "USD", 105, "The short-call premium is $160 and the long call costs $55, for a net $105 credit."),
        field("assignmentReceipt", "Gross strike proceeds from delivering stock", "USD", 4200, "You deliver 100 shares for $42 each and receive $4,200."),
        field("cash", "Cash balance after assignment", "USD", 11805, "Combine $7,500 starting cash with the $105 opening credit and $4,200 assignment receipt."),
        field("shares", "Signed shares held after assignment", "shares", -100, "Starting from zero, delivering 100 borrowed shares leaves a short-stock position of −100."),
        field("openContracts", "Remaining long $47 calls", "contracts", 1, "The long $47 call was neither sold nor exercised, so one remains."),
        field("openValue", "Remaining call at its supplied mark", "USD", 45, "One long call marked at $0.45 × 100 contributes $45."),
        field("equity", "Total marked equity", "USD", 7250, "Cash $11,805 minus $4,600 owed in short shares plus the $45 long call gives $7,250."),
        field("equityChange", "Signed change from starting equity", "USD", -250, "Ending marked equity of $7,250 less starting equity of $7,500 gives −$250."),
      ],
    },
  },
};

function findCase(id: PracticalCaseId, stage: PracticalStage): Case {
  if (!Object.hasOwn(bank, id) || (stage !== "initial" && stage !== "transfer")) throw new RangeError("Choose a listed practical case and stage.");
  return bank[id][stage];
}

export function getPracticalForm(id: PracticalCaseId, stage: PracticalStage): PracticalForm {
  const { title, scenario, fields, reasoningPrompt } = findCase(id, stage);
  return { id, stage, title, scenario: `${contractTerms}\n\n${scenario}`, fields: fields.map(({ key, label, unit }) => ({ key, label, unit })), reasoningPrompt };
}

export function gradePractical(id: PracticalCaseId, stage: PracticalStage, answers: Record<string, number>): PracticalCheck[] {
  const { fields } = findCase(id, stage);
  if (!answers || typeof answers !== "object" || Array.isArray(answers) || Reflect.ownKeys(answers).length !== fields.length) {
    throw new TypeError("Enter one numeric answer for every field on this form.");
  }
  return fields.map(({ key, unit, expected, explanation }) => {
    if (!Object.hasOwn(answers, key) || !Number.isFinite(answers[key])) throw new TypeError("Each issued field requires a finite numeric answer.");
    const answer = answers[key];
    const count = unit === "contracts" || unit === "shares";
    const correct = count ? Number.isInteger(answer) && answer === expected : Math.abs(answer - expected) <= 0.005 + Number.EPSILON * Math.abs(expected);
    return { key, correct, expected, explanation };
  });
}
