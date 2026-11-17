// ORC measured-area formulae and flat-cut reconstruction. These are editable inferred cuts, not certified originals.
import {clamp,lerp} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
import {boatProfile,boatScale} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/boats.js';
export const MEASURE_FIELDS={
 main:[['P','Inferitura P'],['E','Base E'],['MQW','Corda ¼ MQW'],['MHW','Corda ½ MHW'],['MTW','Corda ¾ MTW'],['MUW','Corda ⅞ MUW'],['MHB','Penna MHB']],
 genoa:[['HLU','Inferitura HLU'],['HLP','Perpendicolare HLP'],['HQW','Corda ¼ HQW'],['HHW','Corda ½ HHW'],['HTW','Corda ¾ HTW'],['HUW','Corda ⅞ HUW'],['HHB','Penna HHB']],
 spinnaker:[['SLU','Ralinga SLU'],['SLE','Balumina SLE · simmetrica'],['SFL','Base SFL'],['SHW','Corda ½ SHW']],
 gennaker:[['SLU','Inferitura SLU'],['SLE','Balumina SLE'],['SFL','Base SFL'],['SHW','Corda ½ SHW']]
};
export function measuredArea(type,m){if(type==='main')return m.P/8*(m.E+2*m.MQW+2*m.MHW+1.5*m.MTW+m.MUW+.5*m.MHB);if(type==='genoa')return .1125*m.HLU*(1.44444*m.HLP+2*m.HQW+2*m.HHW+1.5*m.HTW+m.HUW+.5*m.HHB);return(type==='spinnaker'&&!m.exploratory?m.SLU:(m.SLU+m.SLE)/2)*(m.SFL+4*m.SHW)/6;}
const girthRatio=h=>1-h+.08*h+.13*4*h*(1-h);
export function defaultSailDesigns(boat){const k=boat.length/10,source=boat.rig,P=source?.P||12.55*Math.sqrt(boat.areas.main/36.8932038835);let main;
 if(source){let E=source.E,ratio=boat.areas.main/(P*E);if(ratio<.505){E=boat.areas.main/(P*.505);ratio=.505;}const coeff=measuredArea('main',{P:1,E:1,MQW:4*.25*.75,MHW:1,MTW:4*.75*.25,MUW:4*.875*.125,MHB:0})-1/8;let roach=Math.min(.13,Math.max(0,(ratio-.505)/coeff));for(let attempt=0;attempt<18;attempt++){const head=Math.max(.01,2*(ratio-coeff*roach)-1),width=h=>E*(1-h+head*h+roach*4*h*(1-h));main={P,E,MQW:width(.25),MHW:width(.5),MTW:width(.75),MUW:width(.875),MHB:width(1)};try{measuredProfile('main',main);break;}catch(error){roach*=.65;if(attempt===17)throw error;}}}
 else{main={P,E:1,MQW:girthRatio(.25),MHW:girthRatio(.5),MTW:girthRatio(.75),MUW:girthRatio(.875),MHB:.08};const f=boat.areas.main/measuredArea('main',main);for(const key of Object.keys(main))if(key!=='P')main[key]*=f;}
 const I=source?.I||P+.8*k,J=source?.J||4.32*k,HLU=source?Math.hypot(I,J)*.985:Math.hypot(P+.8*k,J),genoa={HLU,HLP:1,HHB:.02,HQW:.755,HHW:.51,HTW:.265,HUW:.1425},g=boat.areas.genoa/measuredArea('genoa',genoa);for(const key of Object.keys(genoa))if(key!=='HLU')genoa[key]*=g;
 const flying=(type,area)=>{
  const reference=flyingMeasureReference(type,boat),nominal=reference.SLU,girths=type==='spinnaker'?[1.04,1.025,1]:[.96,.92,1],leeches=type==='spinnaker'?[1]:[.90,.92,.88],luffs=type==='spinnaker'?[nominal]:[nominal,1.03*Math.hypot(reference.Isp,reference.TPS),1.08*Math.hypot(reference.Isp,reference.TPS)];
  const candidates=lengths=>{const options=[];for(const SLU of lengths)for(const edgeRatio of leeches){const SLE=SLU*edgeRatio,asl=type==='spinnaker'?SLU:(SLU+SLE)/2,lo=type==='spinnaker'?1:.92,hi=type==='spinnaker'?1.05:1,fit=clamp((6*area/(asl*reference.SFL)-1)/4,lo,hi);for(const ratio of new Set([fit,...girths])){const SFL=6*area/(asl*(1+4*ratio)),m={SLU,SLE,SFL,SHW:SFL*ratio},cost=4*Math.log(SFL/reference.SFL)**2+Math.log(SLU/nominal)**2+(edgeRatio-(type==='spinnaker'?1:.90))**2+.1*(ratio-reference.SHWratio)**2;options.push({m,cost});}}return options.sort((a,b)=>a.cost-b.cost);};
  const solve=lengths=>{for(const{m}of candidates(lengths)){try{flyingCut(type,m);return m;}catch(error){}}return null;};
  const primary=solve(luffs);if(primary)return primary;
  // Area is authoritative. Extreme inventories may require a shorter hoist or
  // more luff than the heuristic band to admit a regular, non-stretched cut.
  for(let j=1;j<=24;j++)for(const factor of[1+j*.035,1/(1+j*.035)]){const found=solve([nominal*factor]);if(found)return found;}
  throw Error('Area ORC incompatibile con una ricostruzione regolare del portante.');
 };
 return{main,genoa,spinnaker:flying('spinnaker',boat.areas.spinnaker||77.2869*k*k),gennaker:flying('gennaker',boat.areas.gennaker||116.486*k*k)};
}
// The user's sizing heuristics supply rig-dependent targets, not replacement areas.
export function flyingMeasureReference(type,boat){const k=boat.length/10,r=boat.rig,I=r?.I||13.55*k,J=r?.J||4.32*k,Isp=r?.ISP||Math.max(I,(r?.P||12.55*k)+.95*k),SPL=r?.SPL||J,TPS=r?.TPS||J+1.08*k,SLU=type==='spinnaker'?.95*Math.hypot(I,J):1.055*Math.hypot(Isp,TPS);return{I,J,Isp,SPL,TPS,SLU,SLE:type==='spinnaker'?SLU:.90*SLU,SFL:type==='spinnaker'?1.80*SPL:1.75*TPS,SHWratio:type==='spinnaker'?1.04:.96};}

const defaults=new WeakMap();
export function sailDesign(type,s){if(s?.sailDesigns?.[type])return s.sailDesigns[type];const b=boatProfile(s);if(!defaults.has(b))defaults.set(b,defaultSailDesigns(b));return defaults.get(b)[type];}
export function smoothProfile(points,x){x=clamp(x);let k=1;while(k<points.length-1&&x>points[k][0])k++;const a=points[k-1],b=points[k],t=(x-a[0])/(b[0]-a[0]),slope=i=>{if(i===0)return(points[1][1]-points[0][1])/(points[1][0]-points[0][0]);if(i===points.length-1)return(points[i][1]-points[i-1][1])/(points[i][0]-points[i-1][0]);const l=(points[i][1]-points[i-1][1])/(points[i][0]-points[i-1][0]),r=(points[i+1][1]-points[i][1])/(points[i+1][0]-points[i][0]);return l*r<=0?0:2*l*r/(l+r);};const h=b[0]-a[0];return(2*t**3-3*t*t+1)*a[1]+(t**3-2*t*t+t)*h*slope(k-1)+(-2*t**3+3*t*t)*b[1]+(t**3-t*t)*h*slope(k);}
const profileCache=new Map();
// Width stations refer to fractions along the leech, rather than horizontal fractions of P.
export function strictMeasuredProfile(type,m){const key=type+':'+Object.values(m).join(',');if(profileCache.has(key))return profileCache.get(key);const main=type==='main',height=main?m.P:m.HLU,base=main?m.E:m.HLP,vals=main?[m.E,m.MQW,m.MHW,m.MTW,m.MUW,m.MHB]:[m.HLP,m.HQW,m.HHW,m.HTW,m.HUW,m.HHB],stations=[0,.25,.5,.75,.875,1],pts=stations.map((x,i)=>[x,vals[i]]),head=vals[5]/base,roach=vals[2]/base-.5-head*.5,curve=t=>base*(1-t+head*t+roach*4*t*(1-t)),quadratic=main&&stations.every((h,i)=>Math.abs(vals[i]-curve(h))<1e-6),width=t=>quadratic?curve(t):smoothProfile(pts,t),N=160,ws=Array.from({length:N+1},(_,i)=>width(i/N)),dw=Array.from({length:N},(_,i)=>(ws[i+1]-ws[i])*N),minL=Math.max(...dw.map(Math.abs))*(1+1e-9),ys=L=>{const y=[0];for(const d of dw)y.push(y.at(-1)+Math.sqrt(Math.max(0,L*L-d*d))/N);return y;};let lo=minL,hi=Math.hypot(height,minL)*2;
 // Arbitrary extreme chord sets may not admit equally spaced folded-leech points.
 if(ys(lo).at(-1)>height*1.001)throw Error('Corde incompatibili con questa inferitura: riduci le differenze fra sezioni adiacenti.');
 for(let i=0;i<32;i++){const mid=(lo+hi)/2;if(ys(mid).at(-1)<height)lo=mid;else hi=mid;}const y=ys((lo+hi)/2),result={height,base,leech:(lo+hi)/2,widthAtHeight:h=>{const target=clamp(h)*height;let a=0,b=N;while(b-a>1){const j=(a+b)>>1;if(y[j]<target)a=j;else b=j;}const t=(target-y[a])/Math.max(1e-10,y[b]-y[a]);return width((a+t)/N);},stationHeight:t=>lerp(y[Math.floor(t*N)],y[Math.min(N,Math.floor(t*N)+1)],t*N-Math.floor(t*N))/height};profileCache.set(key,result);if(profileCache.size>160)profileCache.delete(profileCache.keys().next().value);return result;
}
function sampleEdge(fn,N=160){const points=[fn(0)],lengths=[0];let length=0;for(let i=1;i<=N;i++){const p=fn(i/N),q=points.at(-1);length+=Math.hypot(p[0]-q[0],p[1]-q[1]);points.push(p);lengths.push(length);}return{length,at:f=>{const target=clamp(f)*length;let a=0,b=N;while(b-a>1){const j=(a+b)>>1;if(lengths[j]<target)a=j;else b=j;}const t=(target-lengths[a])/Math.max(1e-12,lengths[b]-lengths[a]);return points[a].map((x,i)=>lerp(x,points[b][i],t));}};}
function solve3(A,b){const m=A.map((r,i)=>[...r,b[i]]);for(let k=0;k<3;k++){let p=k;for(let j=k+1;j<3;j++)if(Math.abs(m[j][k])>Math.abs(m[p][k]))p=j;if(Math.abs(m[p][k])<1e-10)return null;[m[k],m[p]]=[m[p],m[k]];for(let j=k+1;j<3;j++){const f=m[j][k]/m[k][k];for(let i=k;i<4;i++)m[j][i]-=f*m[k][i];}}const x=[0,0,0];for(let k=2;k>=0;k--){let v=m[k][3];for(let j=k+1;j<3;j++)v-=m[k][j]*x[j];x[k]=v/m[k][k];}return x;}
const cutCache=new Map();
export function strictFlyingCut(type,m){const key=type+':'+Object.values(m).join(',');if(cutCache.has(key))return cutCache.get(key);const {SLU:lu,SLE:le,SFL:F,SHW:G}=m;if(lu+le<=F||Math.abs(lu-le)>=F)throw Error('Le lunghezze non formano una vela: verifica SLU, SLE e SFL.');const target=[lu/F,le/F,G/F],evaluate=v=>{const [x,H,B]=v,point=(t,side)=>{if(type==='spinnaker'){const w=1-t**7+B*Math.sin(Math.PI*t),center=.5+(x-.5)*t;return[center+(side?1:-1)*w/2,H*t];}return[side?1+(x-1)*t+B*1.10*Math.sin(Math.PI*t):x*t-B*.22*Math.sin(Math.PI*t),H*t];},left=sampleEdge(t=>point(t,0)),right=sampleEdge(t=>point(t,1)),a=left.at(.5),b=right.at(.5),values=[left.length,right.length,Math.hypot(a[0]-b[0],a[1]-b[1])],error=values.map((x,i)=>x-target[i]);return{point,left,right,values,error,cost:error.reduce((n,x)=>n+x*x,0)};};let x=(lu*lu-le*le+F*F)/(2*F*F),v=[x,Math.max(.2,Math.sqrt(Math.max(.05,(lu/F)**2-x*x))*.90),type==='spinnaker'?-.04:.28],best=evaluate(v);
 for(let i=0;i<38&&best.cost>1e-17;i++){const columns=v.map((x,k)=>{const trial=[...v],step=1e-4*Math.max(1,Math.abs(x));trial[k]+=step;const e=evaluate(trial);return e.error.map((q,j)=>(q-best.error[j])/step);}),A=[0,1,2].map(j=>columns.map(c=>c[j])),step=solve3(A,best.error.map(e=>-e));if(!step)break;let accepted=false;for(let factor=1;factor>.001;factor*=.5){const next=v.map((x,k)=>x+step[k]*factor);if(next[1]<=.03||next[2]<-.7||next[2]>3)continue;const e=evaluate(next);if(e.cost<best.cost){v=next;best=e;accepted=true;break;}}if(!accepted)break;}
 if(best.cost>1e-10)throw Error('SHW e lunghezze incompatibili con una superficie regolare: modifica corde o ralinghe.');const result={...m,height:v[1]*F,headX:v[0]*F,width:F,point:(t,u)=>{const a=best.left.at(t),b=best.right.at(t);return[lerp(a[0],b[0],u)*F,lerp(a[1],b[1],u)*F];}};cutCache.set(key,result);if(cutCache.size>160)cutCache.delete(cutCache.keys().next().value);return result;}
export function validateDesign(type,m){for(const [key] of MEASURE_FIELDS[type])if(!Number.isFinite(m[key])||m[key]<=0)throw Error(`${key}: inserisci una misura positiva in metri.`);if(m.exploratory)return true;if(type==='main'||type==='genoa')measuredProfile(type,m);else{if(m.SHW/m.SFL<.75)throw Error('Per uno spinnaker ORC SHW deve essere almeno il 75% di SFL.');if(type==='spinnaker'&&Math.abs(m.SLU-m.SLE)>.001)throw Error('Il simmetrico richiede due ralinghe uguali.');flyingCut(type,m);}return true;}
// Preserve the certificate's measured area while editing one chord. Other girths compensate.
export function fitDesignArea(type,candidate,area,editedKey){const m={...candidate};
 if(type==='spinnaker'||type==='gennaker'){const asl=type==='spinnaker'?m.SLU:(m.SLU+m.SLE)/2,total=6*area/asl;if(editedKey==='SFL')m.SHW=(total-m.SFL)/4;else if(editedKey==='SHW')m.SFL=total-4*m.SHW;else{const factor=area/measuredArea(type,m);m.SFL*=factor;m.SHW*=factor;}}
 else{const fixed=new Set([type==='main'?'P':'HLU',editedKey]);if(type==='main')fixed.add('E');const adjustable=MEASURE_FIELDS[type].map(([key])=>key).filter(key=>!fixed.has(key)),zero={...m};for(const key of adjustable)zero[key]=0;const fixedArea=measuredArea(type,zero),scalable=measuredArea(type,m)-fixedArea,factor=(area-fixedArea)/scalable;if(!(factor>0))throw Error('Questa corda non consente di mantenere i m² del certificato.');for(const key of adjustable)m[key]*=factor;}
 validateDesign(type,m);return m;
}
export function resizeFlyingDesign(type,s,area){if(!Number.isFinite(area)||area<=0)throw Error('Inserisci una superficie positiva e finita.');const m={...sailDesign(type,s),exploratory:true},factor=area/measuredArea(type,m);m.SFL*=factor;m.SHW*=factor;s.sailDesigns??=defaultSailDesigns(boatProfile(s));s.sailDesigns[type]=m;s.sailAreas??={};s.sailAreas[type]=area;return m;}

const explorationProfiles=new Map(),explorationCuts=new Map();
export function measuredProfile(type,m){try{return strictMeasuredProfile(type,m);}catch(error){if(!m.exploratory)throw error;}
 const key=type+':'+Object.values(m).join(',');if(explorationProfiles.has(key))return explorationProfiles.get(key);
 const main=type==='main',height=main?m.P:m.HLU,vals=main?[m.E,m.MQW,m.MHW,m.MTW,m.MUW,m.MHB]:[m.HLP,m.HQW,m.HHW,m.HTW,m.HUW,m.HHB],pts=[0,.25,.5,.75,.875,1].map((v,i)=>[v,vals[i]]);
 const result={height,base:vals[0],approximate:true,widthAtHeight:v=>Math.max(.000001,smoothProfile(pts,v)),stationHeight:v=>clamp(v),leech:sampleEdge(v=>[smoothProfile(pts,v),height*v]).length};
 explorationProfiles.set(key,result);if(explorationProfiles.size>120)explorationProfiles.delete(explorationProfiles.keys().next().value);return result;
}
export function flyingCut(type,m){try{return strictFlyingCut(type,m);}catch(error){if(!m.exploratory)throw error;}
 const key=type+':'+Object.values(m).join(',');if(explorationCuts.has(key))return explorationCuts.get(key);
 const height=Math.max(.0001,(m.SLU+m.SLE)*.425),headX=m.SFL*(.5+.4*(m.SLU-m.SLE)/(m.SLU+m.SLE)),widths=[[0,m.SFL],[.5,m.SHW],[.8,m.SHW*.5],[1,0]],result={...m,height,headX,width:m.SFL,approximate:true,point:(v,u)=>{v=clamp(v);const width=Math.max(0,smoothProfile(widths,v)),center=lerp(m.SFL/2,headX,v);return[center+(u-.5)*width,height*v];}};
 explorationCuts.set(key,result);if(explorationCuts.size>120)explorationCuts.delete(explorationCuts.keys().next().value);return result;
}
