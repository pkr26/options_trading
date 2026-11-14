"use client";

import { useId, useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, FlaskConical, Info } from "lucide-react";

const dollars = (n:number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:2}).format(n);

export default function PayoffLab() {
  const id=useId();
  const [kind,setKind]=useState<"call"|"put">("call");
  const [strike,setStrike]=useState("50");
  const [premium,setPremium]=useState("2");
  const [stock,setStock]=useState("55");
  const [fees,setFees]=useState("0");
  const parsed=[strike,premium,stock,fees].map(Number);
  const valid=[strike,premium,stock,fees].every(v=>v.trim()!=="") && parsed.every(Number.isFinite) && parsed[0]>0 && parsed[0]<=10000 && parsed.slice(1).every(v=>v>=0 && v<=20000);
  const [k,p,s,f]=parsed;
  const result=useMemo(() => {
    if(!valid)return null;
    const pnl=(value:number)=>100*Math.max(kind==="call"?value-k:k-value,0)-p*100-f;
    const maxS=Math.max(k*1.7,s*1.15,k+p*2,10);
    const samples=Array.from({length:101},(_,i)=>({stock:maxS*i/100,profit:pnl(maxS*i/100)}));
    const bottom=Math.min(...samples.map(v=>v.profit),0),top=Math.max(...samples.map(v=>v.profit),0);
    const padding=Math.max((top-bottom)*0.14,50);
    const low=bottom-padding,high=top+padding;
    const x=(value:number)=>56+value/maxS*570;
    const y=(value:number)=>260-(value-low)/(high-low)*220;
    const be=kind==="call"?k+p+f/100:k-p-f/100;
    return {profit:pnl(s),intrinsic:100*Math.max(kind==="call"?s-k:k-s,0),cost:p*100+f,be,maxS,x,y,pnl,path:samples.map((v,i)=>`${i?"L":"M"}${x(v.stock).toFixed(2)},${y(v.profit).toFixed(2)}`).join(" "),low,high};
  },[kind,k,p,s,f,valid]);

  return <div className="practice-layout">
    <section className="panel lab-inputs">
      <div className="panel-icon"><FlaskConical size={21}/></div>
      <h2>Make the numbers yours.</h2><p className="muted">Change one thing. Watch the expiration result change.</p>
      <fieldset className="segmented" aria-label="Option type"><legend className="sr-only">Option type</legend><button type="button" className={kind==="call"?"selected":""} aria-pressed={kind==="call"} onClick={()=>setKind("call")}><ArrowUpRight size={16}/>Long call</button><button type="button" className={kind==="put"?"selected":""} aria-pressed={kind==="put"} onClick={()=>setKind("put")}><ArrowDownRight size={16}/>Long put</button></fieldset>
      <label htmlFor={`${id}-strike`}>Strike price <span>per share</span></label><div className="money-input"><span>$</span><input id={`${id}-strike`} type="number" min="0.01" max="10000" step="0.5" value={strike} onChange={e=>setStrike(e.target.value)}/></div>
      <label htmlFor={`${id}-premium`}>Premium paid <span>per share</span></label><div className="money-input"><span>$</span><input id={`${id}-premium`} type="number" min="0" max="20000" step="0.1" value={premium} onChange={e=>setPremium(e.target.value)}/></div>
      <label htmlFor={`${id}-stock`}>Stock at expiration <span>per share</span></label><div className="money-input"><span>$</span><input id={`${id}-stock`} type="number" min="0" max="20000" step="0.5" value={stock} onChange={e=>setStock(e.target.value)}/></div>
      <label htmlFor={`${id}-fees`}>Total fees <span>whole position</span></label><div className="money-input"><span>$</span><input id={`${id}-fees`} type="number" min="0" max="20000" step="0.5" value={fees} onChange={e=>setFees(e.target.value)}/></div>
      <div className="lab-assumption"><Info size={16}/><span>One standard contract. Multiplier 100. Fictional prices. Taxes excluded.</span></div>
    </section>
    <div className="lab-results">
      {!result?<div className="panel empty-state" role="alert"><Info size={24}/><h2>Check your numbers</h2><p>Enter a strike above $0 and up to $10,000. Other fields must be between $0 and $20,000.</p></div>:<>
        <section className="panel chart-panel">
          <div className="section-row"><div><p className="eyebrow">EXPIRATION EXPLORER</p><h2>The shape of a long {kind}</h2></div><span className="tag">Illustrative</span></div>
          <div className="lab-profit"><span>Profit / loss at stock {dollars(s)}</span><strong className={result.profit<0?"negative":"positive"}>{result.profit>0?"+":""}{dollars(result.profit)}</strong></div>
          <svg className="payoff-chart" viewBox="0 0 660 315" role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}><title id={`${id}-chart-title`}>Long {kind} profit at expiration</title><desc id={`${id}-chart-desc`}>At a stock price of {dollars(s)}, modeled profit is {dollars(result.profit)}. Premium and stated fees are included.</desc>
            {[0,1,2,3].map(i=>{const value=result.low+(result.high-result.low)*i/3;return <g key={i}><line x1="56" x2="626" y1={result.y(value)} y2={result.y(value)} stroke="#e7ebe5"/><text x="47" y={result.y(value)+4} textAnchor="end" fill="#526448" fontSize="12">{Math.round(value).toLocaleString()}</text></g>;})}
            <line x1="56" x2="626" y1={result.y(0)} y2={result.y(0)} stroke="#9ca99f" strokeDasharray="4 4"/>
            <path d={result.path} fill="none" stroke="#2b7053" strokeWidth="3" strokeLinecap="round"/>
            {result.be>=0&&result.be<=result.maxS&&<g><line x1={result.x(result.be)} x2={result.x(result.be)} y1="35" y2="260" stroke="#e3a076" strokeDasharray="4 5"/><text x={Math.min(result.x(result.be)+8,550)} y="28" fill="#865431" fontSize="12">Break-even {dollars(result.be)}</text></g>}
            <circle cx={result.x(s)} cy={result.y(result.profit)} r="6" fill="#d88351" stroke="white" strokeWidth="3"/>
            {[0,1,2,3,4].map(i=><text key={i} x={result.x(result.maxS*i/4)} y="282" textAnchor="middle" fill="#526448" fontSize="12">${(result.maxS*i/4).toFixed(0)}</text>)}
            <text x="340" y="309" textAnchor="middle" fill="#526448" fontSize="12">Stock price at expiration →</text><text x="14" y="19" fill="#526448" fontSize="12">P&amp;L ($)</text>
          </svg>
          <label className="slider-label" htmlFor={`${id}-slider`}>Move the final stock price <strong>{dollars(s)}</strong></label><input id={`${id}-slider`} className="stock-slider" type="range" min="0" max={Math.max(k*2,s,10)} step="0.5" value={s} onChange={e=>setStock(e.target.value)}/>
          <div className="lab-metrics"><div><span>Premium + fees</span><strong>{dollars(result.cost)}</strong></div><div><span>Intrinsic value</span><strong>{dollars(result.intrinsic)}</strong></div><div><span>Expiration break-even</span><strong>{result.be<0?"None at stock ≥ $0":dollars(result.be)}</strong></div></div>
        </section>
        <section className="panel mini-lesson"><span className="number-badge">?</span><div><h3>Try this before changing anything</h3><p>{kind==="call"?"Set the stock $1 above the strike. Is the call in the money? Now check whether its value covers your premium and fees.":"Set the stock $1 below the strike. The put has intrinsic value. Does it have enough to recover your premium and fees?"}</p><details><summary>Show the reasoning</summary><p>A $1 favorable difference gives $100 intrinsic value for this contract. Subtract the full premium and fees. “In the money” describes intrinsic value; it does not by itself mean a profit.</p></details></div></section>
        <section className="panel outcome-table"><h3>Check the arithmetic</h3><div className="table-scroll"><table><thead><tr><th>Stock at expiration</th><th>Intrinsic value</th><th>Profit / loss</th></tr></thead><tbody>{[0,k*0.8,k,k*1.2,k*1.5].map((value,i)=><tr key={i}><td>{dollars(value)}</td><td>{dollars(100*Math.max(kind==="call"?value-k:k-value,0))}</td><td className={result.pnl(value)<0?"negative":"positive"}>{dollars(result.pnl(value))}</td></tr>)}</tbody></table></div></section>
      </>}
      <p className="fine-print">This is an expiration payoff model, not a trading signal or an option-pricing model. Before expiration, time, volatility, rates, dividends, and executable quotes affect price. Exercise of a stock option can create shares and funding obligations; these are not simulated here.</p>
    </div>
  </div>;
}
