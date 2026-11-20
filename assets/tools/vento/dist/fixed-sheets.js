// A locked sheet retains metres of rope, not a wind-dependent fraction of angular travel.
import {stampGeometryState} from './geometry-state.js';
import {V,clamp} from './constants.js';
import {boatScale} from './boats.js';
import {genoaLeadGeometry,mainSheetLead,DECK} from './deck-layout.js';
import {mainBoomPoint,sailPoint} from './sail-geometry.js';
import {flyingSheetLead} from './flying-leads.js';
const cache=new Map();
export function sheetLength(type,s){const k=boatScale(s);if(type==='genoa')return genoaLeadGeometry(s).sheetLength;if(type==='main')return V.length(V.sub(mainBoomPoint(DECK.mainSheetAttachment,s),mainSheetLead(s)))*k;return V.length(V.sub(sailPoint(type,0,1,s),flyingSheetLead(type,s)))*k;}
export function resolveFixedSheets(input){const ids=Object.entries(input.fixedSheetLengths||{}).filter(([type,length])=>Number.isFinite(length)&&Object.hasOwn(input.fixedControls||{},type+'.sheet')&&(type==='main'?input.main:type===input.foresail));if(!ids.length)return{state:input,effectiveSheets:{},sheetLocks:[]};
 const key=JSON.stringify([input.boat.id,input.windSpeed,input.windAngle,Math.round((input.boatSpeed||0)*50),input.controls,input.genoaSize,input.reef,input.wingOnWing,input.sailProfiles,input.sailDesigns,input.sailAreas,input.rigLoads,ids]);let effective=cache.get(key);
 if(!effective){effective={};const probe={...input,controls:Object.fromEntries(Object.entries(input.controls).map(([cat,c])=>[cat,{...c}]))};delete probe.jibAngleRad;
  for(const [type,target] of ids){const lengthAt=value=>{probe.controls[type].sheet=value;stampGeometryState(probe);return sheetLength(type,probe);};let best={value:input.controls[type].sheet,error:Infinity},previous=null;for(let j=0;j<=12;j++){const value=j*100/12,length=lengthAt(value),error=Math.abs(length-target);if(error<best.error)best={value,error};if(previous&&(previous.length-target)*(length-target)<=0){let lo=previous.value,hi=value,lowLength=previous.length;for(let n=0;n<16;n++){const mid=(lo+hi)/2,m=lengthAt(mid);if(Math.abs(m-target)<best.error)best={value:mid,error:Math.abs(m-target)};if((lowLength-target)*(m-target)<=0)hi=mid;else{lo=mid;lowLength=m;}}}previous={value,length};}effective[type]=clamp(best.value,0,100);probe.controls[type].sheet=effective[type];}
  cache.set(key,effective);if(cache.size>80)cache.delete(cache.keys().next().value);
 }
 const controls={...input.controls};for(const [type,value] of Object.entries(effective))controls[type]={...controls[type],sheet:value};const state={...input,controls},sheetLocks=ids.map(([type,requested])=>{const actual=sheetLength(type,state);return{type,requested,actual,error:actual-requested,reachable:Math.abs(actual-requested)<.012};});return{state,effectiveSheets:{...effective},sheetLocks};
}
