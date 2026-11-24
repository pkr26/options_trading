import json,math,subprocess, pathlib
root=pathlib.Path(__file__).resolve().parents[2]
node=r'''
import {europeanPrice,europeanSensitivities,strategyComparison,callAssignmentLedger,executionReplay} from './lib/graduate-models.ts';
import {makeGraduatePractice,gradeGraduatePractice} from './lib/graduate-practice.ts';
import {portfolioStress,makeResearchCase,gradeResearchCase} from './lib/portfolio-research-models.ts';
const prices=[];for(const spot of [1,50,100,150,10000])for(const strike of [1,100,10000])for(const years of [1/365,1,10])for(const volatility of [.01,.2,2])for(const rate of [-.1,.05,.3])for(const dividendYield of [0,.02,.3])for(const right of ['call','put']){const p={spot,strike,years,volatility,rate,dividendYield,right};prices.push({p,got:europeanPrice(p)});}
const greeks=[];for(const spot of [80,100,120])for(const years of [1/365,.25,1,10])for(const volatility of [.01,.2,2])for(const rate of [-.1,.05])for(const dividendYield of [0,.02,.3])for(const right of ['call','put']){const p={spot,strike:100,years,volatility,rate,dividendYield,right};greeks.push({p,got:europeanSensitivities(p)});}
const strategies=[];for(const finalStock of [0,70,90,95,100,110,130])for(const fees of [0,1,10]){const p={initialStock:100,finalStock,budget:11000,putStrike:95,putPremium:3,callStrike:110,callPremium:2,fees};strategies.push({p,got:strategyComparison(p)});}
const assignments=[];for(const stock of [0,90,100,110,130])for(const longMark of [0,3,10]){assignments.push({stock,longMark,got:callAssignmentLedger(100,105,2,1000,stock,longMark)});}
const executions=[0,2,2.09,2.1,2.19,2.2,20].map(limit=>({limit,got:executionReplay(limit)}));
const practice=[];for(const sequence of [0,1,2,3,47,96,97,193,999,1000000])for(let moduleId=1;moduleId<=26;moduleId++){const q=makeGraduatePractice(moduleId,sequence);const result=gradeGraduatePractice(moduleId,sequence,Object.fromEntries(q.map(q=>[q.id,0])));practice.push({moduleId,sequence,expected:result.map(q=>q.expected)});}
const research=[];for(let seed=0;seed<32;seed++){const packet=makeResearchCase(seed);const chosen={lookahead:packet.quoteTime>packet.decisionTime,holdout:packet.holdoutDescription.includes('after each'),costs:packet.costDescription.includes('headline'),benchmark:packet.benchmarkDescription.includes('twice')};research.push({packet,got:gradeResearchCase(seed,chosen)});}
const stress={positions:[{label:'A',spot:100,shares:100,contracts:2,delta:.55,gamma:.03,vega:.12,loading:1},{label:'B',spot:80,shares:100,contracts:-1,delta:-.35,gamma:.02,vega:.10,loading:.8}],marketShockPercent:-10,ivShockPoints:12,initialEquity:50000,liquidCash:5000,cashObligation:1500,additionalCollateral:4000,exitCost:250,lossLimit:2000};
console.log(JSON.stringify({prices,greeks,strategies,assignments,executions,practice,research,stress:{p:stress,got:portfolioStress(stress)}}));
'''
data=json.loads(subprocess.check_output(['node','--experimental-strip-types','--input-type=module','-e',node],cwd=root/'course-app',text=True))
def Phi(x):return .5*(1+math.erf(x/math.sqrt(2)))
def phi(x):return math.exp(-x*x/2)/math.sqrt(2*math.pi)
def ref(p):
 s,k,t,v,r,q=p['spot'],p['strike'],p['years'],p['volatility'],p['rate'],p['dividendYield'];right=p['right']
 if t==0:return max((s-k) if right=='call' else (k-s),0)
 a,b=s*math.exp(-q*t),k*math.exp(-r*t)
 if not s or not v:return max(a-b if right=='call' else b-a,0)
 d1=(math.log(s/k)+(r-q+v*v/2)*t)/(v*math.sqrt(t));d2=d1-v*math.sqrt(t)
 return a*Phi(d1)-b*Phi(d2) if right=='call' else b*Phi(-d2)-a*Phi(-d1)
checks=0;maxprice=0;worstprice=None
for row in data['prices']:
 error=abs(row['got']-ref(row['p']));checks+=1
 if error>maxprice:maxprice,worstprice=error,row
 assert error<.01,(row,error)
gerrs={'delta':(0,None),'gamma':(0,None),'vega':(0,None),'theta':(0,None)}
for row in data['greeks']:
 p=row['p'];s,k,t,v,r,q=p['spot'],p['strike'],p['years'],p['volatility'],p['rate'],p['dividendYield'];d1=(math.log(s/k)+(r-q+v*v/2)*t)/(v*math.sqrt(t))
 expected={'delta':math.exp(-q*t)*(Phi(d1) if p['right']=='call' else Phi(d1)-1),'gamma':math.exp(-q*t)*phi(d1)/(s*v*math.sqrt(t)),'vega':s*math.exp(-q*t)*phi(d1)*math.sqrt(t)/100,'theta':ref({**p,'years':max(0,t-1/365)})-ref(p)}
 for key,x in expected.items():
  error=abs(row['got'][key]-x)
  if error>gerrs[key][0]:gerrs[key]=(error,row)
for row in data['strategies']:
 p=row['p'];s,f,b,kp,pp,kc,cp,fee=[p[k] for k in ['initialStock','finalStock','budget','putStrike','putPremium','callStrike','callPremium','fees']]
 cash=[b,b-100*s-fee,b-100*s-100*pp-2*fee,b-100*s-100*pp+100*cp-3*fee]
 terminal=[0,100*f,100*f+100*max(kp-f,0),100*f+100*max(kp-f,0)-100*max(f-kc,0)]
 for i,got in enumerate(row['got']):
  assert math.isclose(got['initialCash'],cash[i],abs_tol=1e-8);checks+=1
  assert math.isclose(got['finalWealth'],cash[i]+terminal[i],abs_tol=1e-8);checks+=1
  assert math.isclose(got['profit'],cash[i]+terminal[i]-b,abs_tol=1e-8);checks+=1
for row in data['assignments']:
 got=row['got'];s=row['stock'];mark=row['longMark']
 assert got['cash']==11200 and got['shares']==-100 and got['longCalls']==1;checks+=1
 assert got['equity']==11200-100*s+100*mark;checks+=1
 assert got['coverCash']==100*s and got['longExerciseCash']==10500;checks+=1
for row in data['executions']:
 limit=row['limit'];filled=int(limit>=2.1)+int(limit>=2.2);cash=210*int(limit>=2.1)+220*int(limit>=2.2);g=row['got']
 assert g['filled']==filled and g['cashPaid']==cash and g['remaining']==0;checks+=1
 assert g['average']==(cash/(100*filled) if filled else None);checks+=1
for row in data['practice']:
 z=row['sequence'];x=z%97;n=1+z%4;k=40+x;p=2+x/20;fee=1+z%3;up=z%2==0;price=k+(8 if up else -6)
 eps=[None,
 [(price-k)/k*100,(10+z%50)/(90-z%50)*100,k*100*(1.05**2)],
 [-30*n,p*100*n,p*100-fee],
 [(8 if up else 6)*100-p*100-fee,p,k+p if up else k-p],
 [n*k*100,-100*n,k*100],
 [(10-p)*100,p*100,(5+p)*100],
 [20,math.floor((400+x*10)/(150+x)),350],
 [((.45+x/1000 if up else -.35-x/1000)*(1+n if up else -1-n)+.5*(.04+x/10000)*(1+n)**2)*100,(3 if up else -3)*(.12+x/1000)*100,-(.04+x/10000)*100*n],
 [(1+x/100)*math.sqrt(252),10,20+x%70],
 [(n*(.6+x/1000)-(n+1)*.3)*100,((.15+x/1000)-.09)*200,n],
 [.4*(300+x*10)-.6*(200+x*5)-20,(1500+x*20)-(600+x*10)-(250+x),math.floor((500+x*10)/(155+x))],
 [p+.1,(2*p+.2)*100+fee*2,0],
 [10000+x*100+140,10+n,20],
 [.8*(100+x)-.2*(500+x),(10+x)/(30+x)*100,(100+x)**2],
 [(50+x)/math.sqrt(25+x),10+x-1.96*4,5/(10+x)],
 [5/k*100,5+x,(1+x)**2],
 [30-n,p*100,3+x],
 [12+x/10-(100+x)+(100+x)/1.05,.5,((100+x)*1.05-(80+x))/40*100],
 [ref({'spot':100+x,'strike':100,'years':1,'volatility':.2,'rate':.05,'dividendYield':0,'right':'call' if up else 'put'}),(2 if up else -2)*(.38+x/1000)*100,1],
 [math.sqrt(((.25+x/1000)**2-(.2+x/1000)**2*.5)/.5)*100,1,2],
 [150+x*5,2+n,9*(100+x)-(1200+x)],
 [20+x,(200+x*10)*.2,((.2+x/100)*100+2)*n],
 [10000+x*100-103,(2.5+x/100)*100,10/(100+x)*100],
 [12+x,(100+x)/5,500+x*10-(5+n)*100],
 [100,-650-2*x,2000],
 [500+x*5,p*n*100,300],
 [9800+x*100,10-n,10+x+9.8]]
 for actual,expected in zip(row['expected'],eps[row['moduleId']]):
  assert abs(actual-expected)<.001,(row,expected,actual)
  checks+=1
for row in data['research']:
 p=row['packet'];g=row['got'];assert g['score']==4;checks+=1
 assert g['netPnl']==p['grossPnl']-p['modeledCosts'];checks+=1
 assert g['netDifference']==p['grossPnl']-p['modeledCosts']-p['benchmarkPnl'];checks+=1
p=data['stress']['p'];got=data['stress']['got'];delta=gamma=vega=0
for pos in p['positions']:
 move=pos['spot']*p['marketShockPercent']/100*pos['loading']
 delta+=(pos['shares']+100*pos['contracts']*pos['delta'])*move
 gamma+=.5*(100*pos['contracts']*pos['gamma'])*move*move
 vega+=100*pos['contracts']*pos['vega']*p['ivShockPoints']
for key,expected in {'deltaPnl':delta,'gammaPnl':gamma,'vegaPnl':vega,'localPnl':delta+gamma+vega,'markedEquity':50000+delta+gamma+vega,'conservativeLiquidationEstimate':50000+delta+gamma+vega-250,'grossCashRequired':5750,'cashHeadroom':-750,'cashShortfall':750}.items():
 assert abs(got[key]-expected)<1e-8;checks+=1
summary={'checked_assertions':checks,'price_cases':len(data['prices']),'max_price_error':maxprice,'worst_price_input':worstprice['p'],'greek_cases':len(data['greeks']),'max_greek_errors':{k:{'error':v[0],'input':v[1]['p']} for k,v in gerrs.items()},'strategy_scenarios':len(data['strategies']),'assignment_scenarios':len(data['assignments']),'execution_scenarios':len(data['executions']),'practice_numeric_keys':len(data['practice'])*3,'research_scenarios':len(data['research']),'stress_expected':got}
(root/'audit/2026-11-14/quantitative-validation-results.json').write_text(json.dumps(summary,indent=2))
print(json.dumps(summary,indent=2))
from decimal import Decimal as D
case_checks=[]
def check(module,label,got,expected,tol=1e-8):
 assert abs(float(got)-float(expected))<tol,(module,label,got,expected)
 case_checks.append({'module':module,'relationship':label,'result':float(got)})
check(1,'initial uncommitted cash',18000-12000-4000,2000);check(1,'updated uncommitted cash',18000-12000-5500,500)
check(2,'one contract ask cost',D('2.30')*100,230);check(2,'roundtrip quote-side loss',(D('2.00')-D('2.30'))*100,-30)
check(3,'buyer payoff',max(104-100,0)*100,400);check(3,'buyer profit before costs',(104-100-6)*100,-200);check(3,'buyer profit after costs',(104-100-6)*100-2,-202);check(3,'buyer break-even',100+6,106);check(3,'combined net costs',-202+198,-4)
check(4,'assignment cash purchase',50*100,5000);check(4,'cash after assignment',6100-50*100,1100);check(4,'share mark',47*100,4700)
for s,w,c,pnl in [(35,3500,3700,-1300),(50,5000,5200,200),(70,7000,5700,700)]:
 check(5,f'stock wealth at {s}',s*100,w);check(5,f'covered wealth at {s}',100*s+200-100*max(s-55,0),c);check(5,f'covered pnl at {s}',c-5000,pnl)
check(6,'initial modeled loss',(5-1)*100,400);check(6,'updated modeled loss',(5-1.5)*100,350)
check(7,'local contract change',(.5*1+.5*.04*1**2+.1*2-.03)*100,69)
check(8,'IV realized gap',35-20,15);check(8,'proportional change',(35/20-1)*100,75);check(8,'IV rank',(35-15)/(55-15)*100,50);check(8,'IV percentile',80/100*100,80)
check(9,'delta share equivalents',(.6-.45)*100,15);check(9,'contract vega',(.18-.1)*100,8);check(9,'assignment proceeds',100*100,10000)
initial=[(70,80000,92000,100990,102980),(90,100000,104000,100990,102980),(100,110000,110000,105990,107980),(110,120000,116000,115990,117980),(130,140000,128000,135990,117980)]
for s,a,b,c,d in initial:
 for name,got,want in [('A',1000*s+10000,a),('B',600*s+50000,b),('C',1000*s+1000*max(95-s,0)+5990,c),('D',1000*s+1000*max(95-s,0)-1000*max(s-110,0)+7980,d)]:check(10,f'{name} terminal wealth at {s}',got,want)
check(10,'initial C cash',10000-10*4*100-10,5990);check(10,'initial D cash',10000-10*4*100+10*2*100-20,7980);check(10,'updated C cash',10000-10*4.5*100-10,5490);check(10,'updated D cash',10000-10*4.5*100+10*1.5*100-20,6980);check(10,'C floor',95*1000+5990,100990);check(10,'D floor',95*1000+7980,102980);check(10,'D cap',110*1000+7980,117980);check(10,'B zero boundary',600*0+50000,50000)
check(11,'total fills',2+3,5);check(11,'cash paid',D('2.20')*200+D('2.30')*300,1130)
check(12,'selected sensitivity net',900-180-12,708)
check(13,'expected result',.9*100-.1*1200,-30);check(13,'break even win percent',1200/1300*100,92.3076923076923);check(13,'identical loss joint probability',.1*100,10);check(13,'joint loss',1200*2,2400)
check(14,'false-positive illustration',(1-.95**20)*100,64.15140775914581)
check(15,'first simple return',(102/100-1)*100,2);check(15,'second simple return',(101/102-1)*100,-.980392156862745)
check(17,'replicating delta',20/(120-80),.5);check(17,'cash bond',0-.5*80,-40);check(17,'call price',.5*100-40,10);check(17,'pricing up weight',(100-80)/(120-80),.5)
check(18,'central delta',(D('5.62')-D('4.52'))/2,.55);check(18,'vega per IV point',(D('5.30')-D('4.90'))/2,.2);check(18,'contract vega',D('.20')*100,20)
check(19,'reference butterfly credit',(13-2*10+4)*100,-300)
for s,want in [(80,0),(100,1000),(120,0)]:check(19,f'butterfly payoff at {s}',(max(s-90,0)-2*max(s-100,0)+max(s-110,0))*100,want)
check(19,'executable package debit',(14-2*8+5)*100,300)
check(20,'cumulative outcome',9*300-1600,1100)
check(22,'entry cash',(D('2.40')*100)+1,241);check(22,'exit proceeds',(D('2.10')*100)-1,209);check(22,'realized result',209-241,-32)
check(24,'aggregate modeled loss',2*(5-1)*100,800);check(24,'loss as equity percent',800/20000*100,4);check(24,'local delta stress',40*-5,-200);check(24,'gross assignment funding',50*100,5000)
check(25,'available hours',10*12,120);check(25,'budget after quoted dataset',300-250,50)
check(26,'trading net',2400-300-700,1400);check(26,'project net',2400-300-700-200,1200);check(26,'ending project wealth',20000+1200,21200);check(26,'project return',1200/20000*100,6);check(26,'benchmark difference',21200-21400,-200);check(26,'peak drawdown',(22000-19800)/22000*100,10);check(26,'actual fill corrected net',2400-300-200,1900)
summary['case_assertions']=len(case_checks);summary['case_numeric_modules']=sorted(set(x['module'] for x in case_checks));summary['case_checks']=case_checks
(root/'audit/2026-11-14/quantitative-validation-results.json').write_text(json.dumps(summary,indent=2))
print('CASE ASSERTIONS',len(case_checks),'NUMERIC MODULES',len(summary['case_numeric_modules']))
