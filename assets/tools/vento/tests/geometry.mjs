import assert from 'node:assert/strict';
import {newState,evaluate,CONTROL_DEFS} from '../dist/physics.js';
import {sailPoint,mastPoint,forestayPoint,spinnakerWidth} from '../dist/sail-geometry.js';
let controls=0,points=0;
for(const category of Object.keys(CONTROL_DEFS))for(const [key] of CONTROL_DEFS[category]){
 const s=newState();s.genoaSize=105;if(category==='genoa'&&['car','barber'].includes(key))s.controls.genoa.sheet=55;if(!['main','rig'].includes(category))s.foresail=category;if(category==='spinnaker')s.windAngle=150;if(category==='gennaker')s.windAngle=110;
 const low=structuredClone(s),high=structuredClone(s);low.controls[category][key]=0;high.controls[category][key]=100;let displacement=0;
 for(const type of category==='rig'?['main','genoa']:[category])for(let j=1;j<=9;j++)for(let i=0;i<=12;i++){
  const a=sailPoint(type,j/10,i/12,low),b=sailPoint(type,j/10,i/12,high);displacement=Math.max(displacement,Math.hypot(...a.map((x,k)=>x-b[k])));
 }
 assert.ok(displacement>.03,`${category}.${key}: visible geometric response (${displacement} m)`);
 const l=evaluate(low,6),h=evaluate(high,6);assert.ok(Math.abs(l.cl-h.cl)+Math.abs(l.cd-h.cd)>1e-5,`${category}.${key}: changes aerodynamic result`);controls++;
}
for(const type of ['main','genoa','spinnaker','gennaker'])for(const angle of [-180,-52,0,90,180])for(const extreme of [0,50,100]){
 const s=newState();s.windAngle=angle;s.genoaSize=extreme===100?160:105;for(const c of Object.values(s.controls))for(const key of Object.keys(c))c[key]=extreme;
 for(let j=0;j<=32;j++)for(let i=0;i<=24;i++){const p=sailPoint(type,j/32,i/24,s);assert.ok(p.every(Number.isFinite));assert.ok(Math.abs(p[0])<20&&p[1]>=0&&p[1]<16&&Math.abs(p[2])<24);points++;}
}
assert.ok(spinnakerWidth(.8)>spinnakerWidth(.4)*.75,'spinnaker retains broad upper shoulders');assert.ok(spinnakerWidth(.98)>1,'rounded approach to head');
const a=newState(),b=newState();a.controls.rig.shrouds=0;b.controls.rig.shrouds=100;assert.ok(Math.abs(mastPoint(1,a)[0]-mastPoint(1,b)[0])>.10,'shrouds visibly move loaded mast');a.controls.rig.forestay=0;b.controls.rig.forestay=100;assert.ok(Math.abs(forestayPoint(.5,a)[0]-forestayPoint(.5,b)[0])>.05,'forestay tension changes sag');
// Steady loaded membrane is deterministic: time belongs to telltales/water, not the fabric geometry.
const s=newState();assert.deepEqual(sailPoint('main',.5,.6,s),sailPoint('main',.5,.6,s));
console.log(`OK: ${controls} controls change surface geometry and forces; ${points} finite vertices; wide spinnaker shoulders; loaded rigging; steady membrane.`);
