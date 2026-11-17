// Deterministic multi-start coordinate search on the actual corrected pressure cells.
import {clamp} from './constants.js';
import {windTrimResponse,autoTensionRange} from './trim-response.js';
import {aeroForces} from './aero.js';
import {polarSpeed} from './polar.js';
import {boatProfile,hasSail,GENERIC_BOAT} from './boats.js';
import {defaultSailDesigns,sailDesign,MEASURE_FIELDS} from './sail-measures.js';
import {selectedArea,hasHeadsailBattens,headsailInhaulAllowed} from './orc-sails.js';
import {constrainAutoJibCar} from './jib-trim-constraints.js';
import {controlEnabled,restoreFixedControls,hasFixedControls} from './control-state.js';
export const referenceKey=s=>`v20:${boatProfile(s).id}:${Number(s.windSpeed).toFixed(2)}:${Number(s.windAngle).toFixed(2)}`;
const cache=new Map(),clone=s=>JSON.parse(JSON.stringify(s));
const forceRatio=(m,target)=>m.usefulDrive/Math.max(1e-12,target);
const atTarget=(m,target)=>forceRatio(m,target)>=.995;
function bounds(s,cat,key){const r=autoTensionRange(cat,key,s.windSpeed);if(cat==='genoa'&&key==='barber'&&!headsailInhaulAllowed(s))r[0]=50;return r;}
function applyBounds(s){for(const [cat,values] of Object.entries(s.controls))for(const key of Object.keys(values))if(controlEnabled(s,cat,key)){const [lo,hi]=bounds(s,cat,key);values[key]=clamp(values[key],lo,hi);}return restoreFixedControls(s);}
function inventory(s){
 const a=Math.abs(s.windAngle),w=s.windSpeed,options=[{sail:'genoa',sizes:boatProfile(s).id!==GENERIC_BOAT.id?[105]:w>20?[105]:w>13?[105,125]:[105,135,160]}];
 if(hasSail('gennaker',s)&&a>=78&&a<=160&&w<=25)options.push({sail:'gennaker',sizes:[105]});
 if(hasSail('spinnaker',s)&&a>=115&&w<=27)options.push({sail:'spinnaker',sizes:[105]});
 return options.flatMap(o=>o.sizes.map(size=>({sail:o.sail,size})));
}
function seed(s,sail,size,variant=0,locked=false){
 const b=clone(s);delete b.jibAngleRad;delete b.jibAngularVelocity;delete b.jibSide;
 const c=b.controls,w=s.windSpeed,a=Math.abs(s.windAngle),weather=windTrimResponse(w,a);b.main=locked?s.main:true;b.foresail=sail;b.genoaSize=size;
 if(variant===2)return applyBounds(b);
 c.main={halyard:weather.halyard,cunningham:clamp(3*w-8,15,90),outhaul:clamp(30+2.5*w,30,95),traveler:50,sheet:clamp((84-Math.max(5,a*.65-14))/.8,0,100),battens:weather.battens,vang:70};
 c.genoa={car:45,barber:a<65?35:a>70?75:50,sheet:clamp((90-a*.6)/.81,0,100),halyard:weather.halyard,battens:weather.battens};
 c.gennaker={halyard:weather.halyard,tack:clamp(100-a*.4+w*.5,25,90),sheet:clamp((118-a*.72)/.9,0,100)};
 c.spinnaker={halyard:weather.halyard,sheet:55,brace:clamp((a-112)/.7,0,100),poleLift:50,barberSheet:45,barberBrace:45};
 c.rig={backstay:clamp(4*w-5,15,95),forestay:clamp(40+2*w,45,95),shrouds:75};
 if(variant===1){c.main.sheet=clamp(c.main.sheet+20,0,100);c.main.vang=35;c.rig.backstay=25;if(c[sail])c[sail].sheet=clamp(c[sail].sheet-20,0,100);if(sail==='spinnaker')c.spinnaker.brace=80;}
 // A separate running seed explores a squared pole / eased asymmetric shoulder.
 if(variant===3){c.main.sheet=0;c.main.traveler=s.windAngle<0?100:0;c.spinnaker.brace=clamp((a-90)/.85,0,100);c.spinnaker.sheet=65;c.spinnaker.poleLift=35;c.gennaker.sheet=clamp(90-a*.43,12,70);c.gennaker.tack=35;}
 return applyBounds(b);
}
function dimensions(s){
 const main=(s.main?['sheet','traveler','vang','outhaul','cunningham','halyard','battens']:[]).map(k=>['main',k]),fore=Object.keys(s.controls[s.foresail]||{}).filter(k=>k!=='battens'||hasHeadsailBattens(s)).map(k=>[s.foresail,k]);
 return[main[0],fore.find(x=>x[1]==='sheet'),...main.slice(1),...fore.filter(x=>x[1]!=='sheet'),...['backstay','forestay','shrouds'].map(k=>['rig',k])].filter(x=>x&&controlEnabled(s,...x));
}
function driveBetter(a,b){return !b||a.usefulDrive>b.usefulDrive*(1+1e-7)||(Math.abs(a.usefulDrive-b.usefulDrive)<1e-7&&a.telltales.loss<b.telltales.loss);}
// Within 0.5% of target thrust, attached ribbons take priority over extra thrust.
// Outside that band, do not sacrifice attainable speed to manufacture a green indicator.
export function preferTargetFlow(a,b,target){
 if(!b)return true;const aa=atTarget(a,target),bb=atTarget(b,target);
 if(aa!==bb)return aa;
 if(!aa){if(Math.abs(a.usefulDrive-b.usefulDrive)>target*.0001)return a.usefulDrive>b.usefulDrive;}
 if(a.telltales.allAttached!==b.telltales.allAttached)return a.telltales.allAttached;
 if(Math.abs(a.telltales.loss-b.telltales.loss)>1e-6)return a.telltales.loss<b.telltales.loss;
 if(Math.abs(a.exposedFlyingArea-b.exposedFlyingArea)>.001)return a.exposedFlyingArea>b.exposedFlyingArea;
 return Math.abs(a.usefulDrive-target)<Math.abs(b.usefulDrive-target);
}
function search(s,speed,{quality='coarse',steps=[25,10,3],target=null}={}){
 s.boatSpeed=speed;restoreFixedControls(s);
 // The car projection must never move a fixed car or silently release a fixed sheet.
 let feasible=constrainAutoJibCar(s);
 if(!feasible&&controlEnabled(s,'genoa','sheet')){const original=s.controls.genoa.sheet,car=s.controls.genoa.car;s.controls.genoa.sheet=0;feasible=constrainAutoJibCar(s);if(!feasible){s.controls.genoa.sheet=original;s.controls.genoa.car=car;}}
 let count=0,best=aeroForces(s,speed,quality),bestFeasible=feasible;
 const better=(a,b)=>target?preferTargetFlow(a,b,target):driveBetter(a,b);
 for(const step of steps)for(const [cat,key] of dimensions(s)){
  const [lo,hi]=bounds(s,cat,key),original=clamp(s.controls[cat][key],lo,hi),originalCar=s.controls.genoa.car,values=new Set([original,lo,hi]);
  for(let d=-2;d<=2;d++)values.add(clamp(original+d*step,lo,hi));let chosen=original,chosenCar=originalCar;
  for(const value of values){
   s.controls.genoa.car=originalCar;s.controls[cat][key]=value;if(!constrainAutoJibCar(s))continue;
   const m=aeroForces(s,speed,quality);count++;
   if(!bestFeasible||better(m,best)){best=m;bestFeasible=true;chosen=s.controls[cat][key];chosenCar=s.controls.genoa.car;}
  }
  s.controls[cat][key]=chosen;s.controls.genoa.car=chosenCar;
 }
 restoreFixedControls(s);return{state:s,metrics:best,score:best.usefulDrive,feasible:bestFeasible,evaluations:count};
}
const runBetter=(a,b,target=null)=>!b||(a.feasible&&!b.feasible)||(a.feasible===b.feasible&&(target?preferTargetFlow(a.metrics,b.metrics,target):driveBetter(a.metrics,b.metrics)));
function optimizeInventory(input,onProgress=()=>{},locked=false){
 const v=polarSpeed(input.windSpeed,input.windAngle,input),items=locked?[{sail:input.foresail,size:input.genoaSize}]:inventory(input);let best=null,total=0;
 for(let j=0;j<items.length;j++){
  const o=items[j];let winner=null;const variants=['spinnaker','gennaker'].includes(o.sail)?[0,1,2,3]:[0,1,2];
  for(const variant of variants){const run=search(seed(input,o.sail,o.size,variant,locked),v,{steps:[25,10]});total+=run.evaluations;if(runBetter(run,winner))winner=run;}
  const refine=search(winner.state,v,{quality:'normal',steps:[8,2]});total+=refine.evaluations;if(runBetter(refine,best))best=refine;onProgress({progress:(j+1)/items.length,sail:o.sail,score:best.score});
 }
 for(let i=0;i<3;i++){const before=best.score;best=search(best.state,v,{quality:'normal',steps:[1,.25]});total+=best.evaluations;if(best.score<before*1.0002)break;}
 return{...best,evaluations:total};
}
export function computeReference(input,onProgress=()=>{}){
 const key=referenceKey(input);if(cache.has(key))return clone(cache.get(key));
 const baseline=clone(input);delete baseline.jibAngleRad;delete baseline.jibAngularVelocity;delete baseline.jibSide;baseline.fixedControls={};
 // Original inventory calibration must not depend on user-disabled controls or their current values.
 for(const values of Object.values(baseline.controls))for(const k of Object.keys(values))values[k]=50;
 baseline.sailDesigns=defaultSailDesigns(boatProfile(input));baseline.sailAreas={gennaker:boatProfile(input).areas.gennaker,spinnaker:boatProfile(input).areas.spinnaker};if(boatProfile(input).id!==GENERIC_BOAT.id)baseline.genoaSize=105;
 const v=polarSpeed(input.windSpeed,input.windAngle,input);if(v<.01){const out={key,score:0,polarTarget:0,state:baseline,attachment:0,maxPressure:0,cp95:0,evaluations:0};cache.set(key,out);return out;}
 const run=optimizeInventory(baseline,onProgress),m=aeroForces(run.state,v),out={key,score:m.usefulDrive,polarTarget:v,state:run.state,attachment:m.attachment,maxPressure:m.maxPressure,cp95:m.cp95,heel:m.heel,roughness:m.roughness,telltales:m.telltales,evaluations:run.evaluations,calibration:'pressure-force-equilibrium'};
 cache.set(key,clone(out));if(cache.size>24)cache.delete(cache.keys().next().value);return out;
}
function matchThrust(anchor,reference){
 const target=reference.score,v=reference.polarTarget;let best=clone(anchor),m=aeroForces(best,v),gap=Math.abs(forceRatio(m,target)-1),evaluations=0;
 if(m.usefulDrive<=target*1.001)return{state:best,metrics:m,evaluations};
 for(const [cat,key] of dimensions(anchor)){
  const [lo,hi]=bounds(anchor,cat,key);let prev=null;
  for(let i=0;i<=10;i++){
   const value=lo+(hi-lo)*i/10,candidate=clone(anchor);candidate.controls[cat][key]=value;if(!constrainAutoJibCar(candidate)){prev=null;continue;}
   const cm=aeroForces(candidate,v);evaluations++;
   if(prev&&(prev.metric.usefulDrive-target)*(cm.usefulDrive-target)<=0){
    let low=prev.value,high=value,found=candidate,fm=cm;
    for(let j=0;j<12;j++){const mid=(low+high)/2,trial=clone(anchor);trial.controls[cat][key]=mid;if(!constrainAutoJibCar(trial))break;const tm=aeroForces(trial,v);evaluations++;found=trial;fm=tm;if((prev.metric.usefulDrive-target)*(tm.usefulDrive-target)<=0)high=mid;else low=mid;}
    const err=Math.abs(forceRatio(fm,target)-1),flow=fm.telltales,base=m.telltales;
    if(err<gap&&flow.attached>=base.attached&&flow.loss<=base.loss+.001){best=found;m=fm;gap=err;}
   }
   prev={value,metric:cm};
  }
 }
 return{state:best,metrics:m,evaluations};
}
export function optimizeForReference(input,reference,onProgress=()=>{}){
 if(reference.polarTarget<.01)return{state:restoreFixedControls(clone(input)),achievable:0,targetReached:false,flowReached:false,constraintsFeasible:true,evaluations:0};
 const defaults=defaultSailDesigns(boatProfile(input)),same=Object.entries(MEASURE_FIELDS).every(([type,fields])=>!hasSail(type,input)||fields.every(([key])=>Math.abs(sailDesign(type,input)[key]-defaults[type][key])<.00001))&&['gennaker','spinnaker'].every(type=>!hasSail(type,input)||Math.abs(selectedArea(type,input)-boatProfile(input).areas[type])<.005),samePlan=input.foresail===reference.state.foresail&&input.main===reference.state.main&&(input.foresail!=='genoa'||boatProfile(input).id!==GENERIC_BOAT.id||input.genoaSize===reference.state.genoaSize);
 const v=reference.polarTarget,target=reference.score;let run;
 if(same&&samePlan&&!hasFixedControls(input)){
  const state=clone(input);state.controls=clone(reference.state.controls);delete state.jibAngleRad;delete state.jibAngularVelocity;delete state.jibSide;state.boatSpeed=v;
  const metrics=aeroForces(state,v);run={state,metrics,score:metrics.usefulDrive,feasible:constrainAutoJibCar(state),evaluations:0};
 }else run=optimizeInventory(input,onProgress,true);
 let total=run.evaluations,best=run;
 // All enabled controls participate in the target/flow refinement. A running seed
 // changes several coupled controls together, avoiding a single-coordinate trap.
 const candidates=[clone(run.state)];
 if(['spinnaker','gennaker'].includes(input.foresail))candidates.push(seed(input,input.foresail,input.genoaSize,3,true));
 for(const state of candidates){const candidate=search(state,v,{quality:'normal',steps:[12,4,1],target});total+=candidate.evaluations;if(runBetter(candidate,best,target))best=candidate;}
 const matched=best.feasible?matchThrust(best.state,reference):{state:best.state,metrics:best.metrics,evaluations:0};total+=matched.evaluations;
 const state=restoreFixedControls(matched.state);state.auto=true;const m=aeroForces(state,v),achievable=100*Math.cbrt(forceRatio(m,target));
 return{state,achievable,targetReached:best.feasible&&Math.abs(achievable-100)<=.5,flowReached:m.telltales.allAttached,telltales:m.telltales,constraintsFeasible:best.feasible,evaluations:total};
}

// Single-control targets ignore other enabled live controls, but honor fixed settings.
const fixedKey=s=>Object.entries(s.fixedControls||{}).sort(([a],[b])=>a.localeCompare(b));
export const controlTargetKey=s=>JSON.stringify([referenceKey(s),s.main,s.foresail,s.genoaSize,s.sailDesigns,s.sailAreas,fixedKey(s)]);
const controlTargetCache=new Map();
export function optimalControlSettings(input,reference,onProgress=()=>{}){
 const key=controlTargetKey(input);if(controlTargetCache.has(key))return clone(controlTargetCache.get(key));
 const neutral=clone(input);neutral.controls=Object.fromEntries(Object.entries(input.controls).map(([cat,controls])=>[cat,Object.fromEntries(Object.keys(controls).map(k=>[k,50]))]));restoreFixedControls(neutral);
 delete neutral.jibAngleRad;delete neutral.jibAngularVelocity;delete neutral.jibSide;
 const solution=optimizeForReference(neutral,reference,onProgress),result={key,controls:clone(solution.state.controls),achievable:solution.achievable,telltales:solution.telltales,constraintsFeasible:solution.constraintsFeasible};
 controlTargetCache.set(key,clone(result));if(controlTargetCache.size>12)controlTargetCache.delete(controlTargetCache.keys().next().value);return result;
}
