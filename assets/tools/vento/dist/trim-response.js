// Educational cloth response: gradual load dependence, not a universal maximum-tension rule.
import {clamp} from './constants.js';
import {rigResponse} from './standing-rig.js';
import {rigDimensions} from './orc-sails.js';
const softplus=x=>Math.max(0,x)+Math.log1p(Math.exp(-Math.abs(x)));
export const smoothBound=(x,lo,hi,k=.006)=>lo+k*(softplus((x-lo)/k)-softplus((x-hi)/k));
const knots=[[4,0],[8,.22],[12,.46],[16,.68],[20,.84],[24,.94],[30,1]];
export function windDemand(tws){if(tws<=4)return 0;if(tws>=30)return 1;let i=1;while(tws>knots[i][0])i++;const a=knots[i-1],b=knots[i],h=b[0]-a[0],t=(tws-a[0])/h,slope=j=>{if(j===0||j===knots.length-1)return 0;const l=(knots[j][1]-knots[j-1][1])/(knots[j][0]-knots[j-1][0]),r=(knots[j+1][1]-knots[j][1])/(knots[j+1][0]-knots[j][0]);return 2*l*r/(l+r);};return(2*t**3-3*t*t+1)*a[1]+(t**3-2*t*t+t)*h*slope(i-1)+(-2*t**3+3*t*t)*b[1]+(t**3-t*t)*h*slope(i);}
export function windTrimResponse(tws,twa=52){const demand=windDemand(tws),reach=clamp((Math.abs(twa)-70)/80),up=1-.42*reach;return{demand,battens:55,halyard:clamp(12+88*demand*up,0,100),draft:.39+.035*reach,mainCamber:.17-.075*demand+.025*reach,genoaCamber:.16-.055*demand+.02*reach,mainTwist:4+12*demand+5*reach,genoaTwist:5+10*demand+7*reach};}
// Bounds describe useful, boat-dependent search regions. No control is forced to 100% by TWS alone.
export function autoTensionRange(cat,key,tws,twa=52){if(key==='twist')return[0,50];const w=windTrimResponse(tws,twa),run=clamp((Math.abs(twa)-95)/65);if(key==='halyard')return[clamp(w.halyard-(cat==='main'?12:cat==='genoa'?16:30),0,100),clamp(w.halyard+(cat==='spinnaker'?30:28),0,100)];if(cat==='rig'){const seed=key==='backstay'?(12+82*w.demand)*(1-.65*run):key==='forestay'?30+65*w.demand*(1-.20*run):42+53*w.demand;const range=key==='shrouds'?12:key==='forestay'?18:22;return[clamp(seed-range,0,100),clamp(seed+range,0,100)];}if(cat==='main'&&key==='outhaul')return[20+55*w.demand*(1-.45*run),55+45*w.demand];if(cat==='main'&&key==='cunningham')return[Math.max(0,70*w.demand-20)*(1-.7*run),25+75*w.demand*(1-.6*run)];if(key==='battens')return[45,65];return[0,100];}
// Geometry and pressure determine performance; no bonus for matching a prescribed ideal shape.
export function rigPressureSupport(type,s){const r=rigResponse(s),rig=rigDimensions(s),span=Math.max(1,rig.ISP),lateral=Math.max(0,r.tipDeflection/(span*.008)-1),sag=type==='genoa'?Math.max(0,r.sag/(Math.hypot(span,rig.J)*.025)-1):0;return 1/(1+.22*lateral*lateral+.65*sag*sag);}
export const profileQuality=()=>1;
export function battenPressureSupport(type,shape,s,h){if(!shape.battened)return 1;const preload=s.controls[type].battens/100;return 1-.035*(Math.max(0,.25-preload)/.25)**2*h*h-.025*(Math.max(0,preload-.8)/.2)**2*h*h;}
export const headsailCamber=(c,sag,footClosing,battened)=>smoothBound(.105+sag*.22-footClosing*.032-c.halyard*.00027+(battened?(c.battens-55)*.00012:0),.035,.25);
export const headsailDraft=(c,weather)=>smoothBound(weather.draft+.14*weather.demand-c.halyard*.0014,.24,.61,.008);

// A soft setup preference resolves near-equivalent AUTO candidates; it never changes pressure or speed.
export function trimPreference(s){const w=windTrimResponse(s.windSpeed,s.windAngle),run=clamp((Math.abs(s.windAngle)-95)/65),c=s.controls;let cost=0;if(s.main)cost+=((c.main.halyard-w.halyard)/45)**2+((c.main.outhaul-(40+50*w.demand*(1-.35*run)))/50)**2+((c.main.cunningham-Math.max(0,85*w.demand-12)*(1-.65*run))/65)**2+.3*((c.main.battens-55)/15)**2;if(c[s.foresail])cost+=((c[s.foresail].halyard-w.halyard)/55)**2;cost+=.3*((c.rig.shrouds-(42+53*w.demand))/30)**2;return cost;}
