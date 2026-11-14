import type { QuizQuestion } from "./types";
export type KeyedQuestion = QuizQuestion & {correctIndex:number;explanation:string};
export function buildQuiz(moduleId:number,variant:number):KeyedQuestion[] {
 if(!Number.isInteger(moduleId) || moduleId<1 || moduleId>8 || !Number.isInteger(variant) || variant<0 || variant>1) throw new Error("Unknown module or quiz variant");
 const v=variant===1?1:0, n=v?2:1;
 const questions:Omit<KeyedQuestion,"id">[]=[];
 const add=(prompt:string,correct:string,wrong:string[],explanation:string)=>questions.push({prompt,options:[correct,...wrong],correctIndex:0,explanation});
 switch(moduleId) {
 case 1: {
  const qty= v?7:4,price=v?12:25;
  add(`You buy ${qty} shares at $${price} each. Ignore fees. What is the total cost?`,`$${qty*price}`,[`$${price}`,`$${qty+price}`,`$${qty*price*100}`],`Share cost = number of shares × price per share = ${qty} × $${price} = $${qty*price}.`);
  add(`A share rises from $${v?80:50} to $${v?88:55}. What is the percentage gain before fees?`,"10%",["5%","20%","100%"],"Percentage gain = (ending price − starting price) ÷ starting price × 100. Both versions give 10%.");
  add("What does a stock index represent?","A measure that tracks a defined group of securities",["Shares you can buy directly in the index itself","An options broker","A guaranteed investment return"],"An index is a measurement. A fund may track it; the fund is a separate investment.");
  add(`A quote shows $${v?'9.90':'19.80'} bid / $${v?'10.10':'20.00'} ask. Which is the displayed price someone is offering to pay?`,`$${v?'9.90':'19.80'} bid`,["The midpoint","The ask","The last trade, regardless of its time"],"The bid is a displayed buying offer. It is still time-specific and has limited size.");
  add("You submit a buy limit below the current ask. What is guaranteed?","Your limit caps the price if filled; a fill is not guaranteed",["An immediate fill","A profit","A fill at the last-traded price"],"A limit controls the acceptable price. The order can remain unfilled."); break;
 }
 case 2: {
  add("What right does the buyer of a standard stock call receive?","The right to buy shares at the strike under the contract terms",["The obligation to buy every day","The right to sell shares at the strike","Ownership of the company immediately"],"A call gives its holder a buying right. Buying the option itself does not deliver shares.");
  add("What right does the buyer of a standard stock put receive?","The right to sell shares at the strike under the contract terms",["The right to buy shares at the strike","A guaranteed sale of the option for a profit","A dividend from the company"],"A put is a selling right; the option's seller may have the corresponding buying obligation.");
  const premium=v?1.8:2.4;
  add(`One option has a $${premium.toFixed(2)} premium quote and a confirmed 100 premium multiplier. Cost before fees?`,`$${premium*100}`,[`$${premium.toFixed(2)}`,`$${premium*10}`,"Unknown even with the multiplier given"],`$${premium.toFixed(2)} × 100 × one contract = $${premium*100}.`);
  add("Which two quotes are definitely for the same option series?","Same underlying, call/put type, strike, exact expiry and adjustment terms",["Same ticker only","Same premium only","Same strike but different expiry"],"An order to close must match the actual contract. Prices alone do not identify a series.");
  add("You own one call. Selling that same one call to close does what?","Removes your long call position when the sale fills",["Opens an uncovered short call automatically","Exercises the call","Makes you short 100 shares automatically"],"Sell to close disposes of an owned option. Sell to open creates a new short option obligation."); break;
 }
 case 3: {
  const k=v?60:50,p=v?3:2,s=v?68:56;
  add(`One $${k} call was bought for $${p}. Stock at expiration: $${s}. Standard multiplier 100; no fees. Profit?`,`$${(s-k-p)*100}`,[`$${(s-k)*100}`,`$${p*100}`,`−$${p*100}`],`Intrinsic value = ($${s} − $${k}) × 100; subtract $${p*100} premium. Profit = $${(s-k-p)*100}.`);
  add(`One $${k} put costs $${p}. Stock expires at $${k-5}. Standard multiplier100; no fees. Profit?`,`$${(5-p)*100}`,["$500",`−$${p*100}`,`$${(5+p)*100}`],`Put intrinsic value is $5 × 100 = $500. Subtract $${p*100}: $${(5-p)*100}.`);
  add(`A $${k} call costs $${p}. Its expiration break-even before fees is what stock price?`,`$${k+p}`,[`$${k}`,`$${k-p}`,`$${p}`],"Long-call expiration break-even is strike plus premium per share. It is not the price required to sell the option profitably before expiration.");
  add("What is the theoretical maximum loss of an uncovered short stock call?","No finite upper limit",["The premium received","The strike price","Exactly $100"],"Its obligation grows as the stock rises, and a stock has no fixed upper price ceiling.");
  add(`A $${k} call bought for $${p} expires with stock at $${k+1}. Which is correct?`,"It is in the money but loses money after premium",["In the money always means profitable","It is out of the money","The buyer earns the premium"],`Its intrinsic value is $1 per share, below the $${p} paid. Moneyness excludes the purchase premium.`); break;
 }
 case 4: {
  const d=v?0.35:0.4;
  add(`A long call has delta ${d}. With a small $1 stock rise, all else fixed, estimated premium change per share?`,`About +$${d.toFixed(2)}`,[`About +$${d*100}`,"Exactly +$1","Guaranteed zero"],"Delta is a local estimate per $1 underlying move. Multiply by the confirmed contract multiplier for an approximate dollar position change; delta can change.");
  add("What does gamma describe?","How delta changes as the underlying price changes",["A fixed daily fee","The number of shares in a contract","The option's last-traded price"],"Gamma describes the local change in delta for a $1 move; delta is not constant over large moves.");
  add("A long option has negative theta. Does that guarantee its market price falls tomorrow?","No; stock, volatility and other inputs may change",["Yes, regardless of other inputs","Yes, by the full premium","No, because time has no effect"],"Theta isolates an estimated time effect while other factors are held fixed. It is not a forecast of tomorrow's net price change.");
  add("After earnings, a stock rises but a purchased call loses value. Is this possible?","Yes; a fall in implied volatility and time effects can outweigh the stock effect",["No; every stock rise guarantees a call profit","Only puts have volatility exposure","It proves the broker changed the strike"],"A long call is exposed to several inputs. An expected event can pass with less uncertainty afterward.");
  add("Implied volatility tells you which of these?","A volatility input inferred from option market prices and a model",["The guaranteed direction of the next stock move","Tomorrow's exact return","The option seller's guaranteed profit"],"Implied volatility concerns priced uncertainty, depends on a model, and does not by itself predict direction."); break;
 }
 case 5: {
  const k=v?40:50;
  add(`You exercise one standard $${k} stock call. Ignore earlier premium and fees. What moves?`,`Pay $${k*100}; receive 100 shares`,[`Receive $${k*100}; deliver 100 shares`,"Receive only the option's cash profit","Pay only the original premium again"],`Exercise buys 100 shares at $${k}. This strike payment is separate from the premium already paid.`);
  add(`You are assigned on one standard short $${k} put. Ignore fees. What moves?`,`Pay $${k*100}; receive 100 shares`,["Receive the strike payment and deliver shares","Nothing; only buyers face share movements","Pay only $100"],"The assigned put writer must buy the underlying shares at the strike.");
  add("Can a short American-style stock option be assigned before expiration?","Yes",["No, only at expiration","Only if the writer agrees that day","Only if both spread legs exercise together"],"The holder controls exercise. Assignment can occur early; the writer does not choose its timing.");
  add("You leave a purchased in-the-money stock call open at expiration. Is the only possible result a cash payout?","No; exercise procedures can create a share purchase and funding needs",["Yes; stock options always settle in cash","Yes; long options cannot create shares","Nothing can happen if you ignore it"],"Exercise-by-exception, contrary instructions, broker procedures and contract terms matter. Shares resulting from exercise have separate risk.");
  add("An adjusted contract has premium multiplier100 but delivers10 current shares. What should you do?","Use its exact OCC adjustment terms and separate premium and deliverable calculations",["Assume it delivers100 shares anyway","Multiply every field by10","Ignore the adjustment if the ticker looks familiar"],"Premium multiplier and exercise deliverable are separate. An adjustment can include shares, cash or other assets."); break;
 }
 case 6: {
  const debit=v?3:2,width=v?8:5;
  add(`A matching one-to-one bull call spread has width $${width} and net debit $${debit} per share. Standard100 multiplier; no fees. Idealized maximum expiration loss?`,`$${debit*100}`,[`$${width*100}`,`$${(width-debit)*100}`,"Unlimited while modeled legs stay intact"],`The intact spread can expire worthless, losing the $${debit*100} debit. Assignment and remaining stock exposures need a separate operations plan.`);
  add(`A matching one-to-one bull put credit spread has width $${width} and credit $1 per share. Standard100 multiplier; no fees. Idealized maximum expiration loss?`,`$${(width-1)*100}`,["$100",`$${width*100}`,"Zero because it receives premium"],`Worst intrinsic obligation is width ×100; subtract the $100 credit = $${(width-1)*100}. This assumes matching intact legs in the expiration model.`);
  add("You own100 shares and sell one matching covered call. Does the call remove stock downside?","No; shares can still lose most of their value",["Yes; covered means loss-free","Yes; premium guarantees recovery","Only if the strike equals the purchase price"],"Premium offsets only part of a loss. The stock can fall substantially, while the short call also caps upside above its strike.");
  add(`Buy100 shares at $${50*n}, buy a $${45*n} protective put for $2 per share. Hold both to expiry, no fees. Maximum modeled loss?`,`$${(5*n+2)*100}`,["$200",`$${50*n*100}`,"Zero"],`Stock-plus-put floor is the strike. Loss = (share purchase price − put strike + put premium) ×100 = $${(5*n+2)*100}.`);
  add(`One standard $${40*n} cash-secured put can require what gross strike funding on assignment?`,`$${40*n*100}`,["Only the premium received","$100","No cash if the stock falls"],"Cash security funds the stock purchase; it does not prevent a large economic loss if the shares collapse."); break;
 }
 case 7: {
  add("A hypothetical strategy wins $20 with80% probability and loses $100 with20% probability. Expected result before costs?","−$4 per trial",["+$16 per trial","+$20 per trial","+$4 per trial"],"0.8 × $20 − 0.2 × $100 = $16 − $20 = −$4. A high win rate is insufficient.");
  const pct=v?50:20,recovery=v?100:25;
  add(`An account falls ${pct}%. What gain from its lower value restores its starting value?`,`${recovery}%`,[`${pct}%`,`${pct/2}%`,"Always10%"],`Recovery = loss fraction ÷ (1 − loss fraction). A ${pct}% loss requires a ${recovery}% gain.`);
  add("Your hypothetical maximum risk allowance is $100, but one option costs $160 plus fees. What fits the allowance?","Zero contracts",["One, because it is only slightly over","Two, to recover losses faster","One if a stop-loss is entered"],"A budget is a constraint. If the smallest position exceeds it, choose no trade; do not pretend a stop guarantees the premium loss cannot occur.");
  add("You buy calls on five closely related technology stocks. Is independent risk guaranteed?","No; the positions may lose together",["Yes; five tickers guarantees diversification","Yes; calls cannot be correlated","Yes; options always hedge one another"],"Different symbols can share the same market and sector risks. Inspect joint losses and concentration.");
  add("Does a stop order guarantee your maximum loss during a market gap?","No",["Yes, at exactly its trigger","Yes, for every option","Only if it was entered yesterday"],"A stop can trigger a market order at a worse price. A stop-limit can fail to fill. The position's exposure remains important."); break;
 }
 case 8: {
  const entry=v?1.8:2.2,exit=v?2.5:2.6;
  const pnl=Math.round((exit-entry)*100-2);
  add(`Buy1 option at $${entry.toFixed(2)}, sell to close at $${exit.toFixed(2)}; multiplier100; total fees$2. Net realized profit?`,`$${pnl}`,[`$${pnl+2}`,`$${exit*100}`,`−$${entry*100}`],`(${exit.toFixed(2)} − ${entry.toFixed(2)}) ×100 − $2 = $${pnl}. This is a stated hypothetical filled round trip.`);
  add("A paper limit order never fills, then its quoted value rises. What realized trading P&L do you record?","No trade P&L; retain the unfilled decision in the log",["The full later hypothetical gain","Profit at the midpoint","Delete the order so results look cleaner"],"A nonfill never created the assumed position. Preserve it to evaluate the whole decision and execution process.");
  add("A free quote is delayed. What belongs in your notebook?","Source, timestamp, delay, contract terms, bid/ask and displayed sizes",["Only the last price","Only today's date","A claim that you could fill at that exact price"],"Timing, size and contract identity determine what the observation can support. Delayed quotes are educational observations.");
  add("Your spread's short call is assigned; you held no shares and its long call remains open. What must you consider?","A short-stock position plus the remaining long call and cash/funding obligations",["Both options automatically disappeared","Guaranteed zero risk because it was a spread","Only the original net credit"],"Assignment of one leg does not close the other. Follow every share, option and cash flow; stock exposure has its own risk.");
  add("You pass every quiz and make money in a short paper record. What have you demonstrated?","Knowledge and simulation practice; live profitability remains unproven",["A guaranteed live edge","Automatic broker approval","That larger positions are now required"],"Knowledge, simulated fills and a small sample do not establish executable live performance or personal suitability."); break;
 }
 default: throw new Error("Unknown module");
 }
 return questions.map((q,i)=>{
  if(q.options.length!==4 || new Set(q.options).size!==4) throw new Error(`Invalid choices in module${moduleId},question${i}`);
  const shift=(moduleId+i+v)%4;
  const options=q.options.slice(shift).concat(q.options.slice(0,shift));
  return {...q,id:`m${moduleId}v${v}q${i+1}`,options,correctIndex:(4-shift)%4};
 });
}
