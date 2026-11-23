// Sailmaking exploration: mould sections, not manufacturing panels or certified cuts.
import {clamp,lerp,RAD} from './constants.js';
const defaults={main:{depth:14,draft:42},genoa:{depth:15,draft:38},spinnaker:{depth:33,draft:50},gennaker:{depth:32,draft:40}};
export const PROFILE_FIELDS=[
 ['depth','Grasso iniziale',1,48,.2,'% corda','Profondità del profilo di progetto prima dell’effetto delle manovre.'],
 ['draft','Posizione del grasso',12,85,.5,'% corda','Distanza dall’inferitura del punto di massima profondità.'],
 ['entry','Angolo di entrata',0,75,.5,'°','Pendenza del profilo vicino al bordo di attacco.'],
 ['exit','Angolo di uscita',-15,75,.5,'°','Pendenza del profilo verso la balumina; valori negativi creano un’uscita riflessa.'],
 ['twist','Svergolamento di taglio',-20,50,.5,'°','Rotazione aggiuntiva di questa sezione rispetto alla base.'],
 ['hook','Ritorno di balumina',-15,15,.5,'°','Curvatura locale nel terzo posteriore: chiusura o apertura dell’uscita.'],
 ['chord','Corda locale',30,180,.5,'%','Larghezza locale rispetto alla corda ricostruita dalle misure ORC.'],
 ['luffRound','Giro d’inferitura',-4,5,.1,'% corda','Equivalente didattico del volume prodotto dal giro d’inferitura quando la vela è armata.'],
 ['broadseam','Volume da cuciture',-2,4,.1,'% corda','Equivalente di broadseaming aggiunto al profilo, non una larghezza di cucitura da tagliare.'],
 ['footRound','Giro di base',0,5,.1,'% corda','Arrotondamento della base, raccordato alle sezioni superiori.']
];
export function newSailProfile(type){const d=defaults[type],station=h=>({h,depth:d.depth,draft:d.draft,entry:Math.atan((d.depth/100)*Math.PI/(2*d.draft/100))/RAD,exit:Math.atan((d.depth/100)*Math.PI/(2*(1-d.draft/100)))/RAD,twist:0,hook:0,chord:100,luffRound:0,broadseam:0,footRound:0});return{enabled:false,revision:0,layout:'crosscut',battened:null,stretch:30,weight:type==='main'||type==='genoa'?240:65,stations:[0,.25,.5,.75,1].map(station)};}
const cache=new WeakMap();
export function profileAt(type,h,s){const p=s?.sailProfiles?.[type];if(!p?.enabled)return null;let c=cache.get(p);if(!c||c.revision!==p.revision){c={revision:p.revision,values:new Map()};cache.set(p,c);}h=clamp(h);if(c.values.has(h))return c.values.get(h);const list=p.stations;let i=1;while(i<list.length-1&&h>list[i].h)i++;const a=list[i-1],b=list[i],t=clamp((h-a.h)/Math.max(1e-6,b.h-a.h)),f=t*t*(3-2*t),value={};for(const [key]of PROFILE_FIELDS)value[key]=lerp(a[key],b[key],f);value.h=h;c.values.set(h,value);return value;}
export const profileChord=(type,h,s)=>profileAt(type,h,s)?.chord/100||1;
export function applySailProfile(type,shape,h,s){const p=profileAt(type,h,s);if(!p)return shape;const d=defaults[type],gravity=(s.sailProfiles[type].weight/1000*9.81)/Math.max(.5,.5*1.225*((s.windSpeed||0)*.514444)**2*3),strain=(s.sailProfiles[type].stretch/100)*clamp(((s.windSpeed||0)/18)**2,0,2)*.045,camber=clamp(shape.camber*p.depth/d.depth/(1+.35*gravity)+(p.luffRound*.35+p.broadseam*.5)/100+strain,.005,.60),draft=clamp(shape.draft+(p.draft-d.draft)/100+strain*.8,.1,.88);return{...shape,camber,draft,twist:shape.twist+(h>.001?p.twist/Math.max(.01,h**(type==='main'||type==='genoa'?1:1.25)):0),entry:p.entry,exit:p.exit,hook:p.hook,footRound:p.footRound,customProfile:true};}
export function profileOrdinate(shape,u){if(u<=0||u>=1)return 0;const d=shape.draft,H=shape.camber;if(!shape.customProfile)return H*Math.sin((u<d?u/d:(1-u)/(1-d))*Math.PI/2);let y;if(u<=d){const t=u/d;y=H*(-2*t**3+3*t*t)+Math.tan(shape.entry*RAD)*d*(t**3-2*t*t+t);}else{const t=(u-d)/(1-d);y=H*(2*t**3-3*t*t+1)-Math.tan(shape.exit*RAD)*(1-d)*(t**3-t*t);}const q=clamp((u-.70)/.30);return y+(shape.hook||0)*.0016*Math.sin(Math.PI*q)*q;}
export function materialMass(type,s){return(s?.sailProfiles?.[type]?.enabled?s.sailProfiles[type].weight/1000:type==='main'||type==='genoa'?.24:.065);}
export function profileWarnings(type,s){const p=s?.sailProfiles?.[type];if(!p?.enabled)return[];const warnings=[];for(const n of p.stations){if(n.entry>Math.atan(3*(n.depth/100)/(n.draft/100))/RAD+3||n.exit>Math.atan(3*(n.depth/100)/(1-n.draft/100))/RAD+3||n.depth>(type==='spinnaker'||type==='gennaker'?45:24)||n.draft<22||n.draft>65||n.entry>65||n.exit>60||n.exit<0||Math.abs(n.hook)>10||Math.abs(n.twist)>35||n.chord<60||n.chord>135)warnings.push(n.h);}return warnings;}
// Numerical arc length permits shaped entry/exit while conserving flying foot and half-girth.
export function mouldArc(shape){const N=64,x=[],y=[],arc=[0];for(let i=0;i<=N;i++){const u=i/N;x.push(u);y.push(profileOrdinate(shape,u));if(i)arc.push(arc[i-1]+Math.hypot(x[i]-x[i-1],y[i]-y[i-1]));}const length=arc[N];return{length,point:u=>{const target=clamp(u)*length;let a=0,b=N;while(b-a>1){const j=(a+b)>>1;if(arc[j]<target)a=j;else b=j;}const t=(target-arc[a])/Math.max(1e-9,arc[b]-arc[a]);return[lerp(x[a],x[b],t),lerp(y[a],y[b],t)];}};}
