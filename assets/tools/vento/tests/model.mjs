import assert from 'node:assert/strict';
import {newState,equilibrium,optimize,CONTROL_DEFS,sailShape} from '../dist/physics.js';
let checked=0;
for(const wind of [0,4,8,12,20,24,35])for(const angle of [0,25,40,52,75,90,120,150,180,-52,-150])for(const sail of ['genoa','gennaker','spinnaker']){
 const s=newState();Object.assign(s,{windSpeed:wind,windAngle:angle,foresail:sail});const m=equilibrium(s);
 for(const [key,value] of Object.entries(m))if(typeof value==='number')assert.ok(Number.isFinite(value),`${key}: ${wind} kn / ${angle}° / ${sail}`);
 assert.ok(m.speed>=0&&m.speed<20);assert.ok(m.efficiency>=0&&m.efficiency<=100);assert.ok(m.cd>=0);
 if(wind===0||Math.abs(angle)<26)assert.equal(m.speed,0);checked++;
}
const left=newState(),right=newState();left.windAngle=-right.windAngle;assert.equal(equilibrium(left).speed,equilibrium(right).speed);
for(const category of Object.keys(CONTROL_DEFS))for(const [key] of CONTROL_DEFS[category]){
 const s=newState();if(category!=='main'&&category!=='rig')s.foresail=category;s.genoaSize=105;
 const low=structuredClone(s),high=structuredClone(s);low.controls[category][key]=0;high.controls[category][key]=100;
 const type=category==='rig'?'main':category,l=equilibrium(low),h=equilibrium(high);
 assert.ok(JSON.stringify(sailShape(type,low))!==JSON.stringify(sailShape(type,high))||l.efficiency!==h.efficiency||l.heel!==h.heel,`${category}.${key} must affect the model`);
}
for(const angle of [40,52,90,120,150]){
 const s=newState();s.windAngle=angle;optimize(s);const good=equilibrium(s);const bad=structuredClone(s);bad.controls.main.sheet=0;bad.controls[bad.foresail].sheet=0;const other=structuredClone(s);other.controls.main.sheet=100;other.controls[other.foresail].sheet=100;
 assert.ok(good.speed>=Math.min(equilibrium(bad).speed,equilibrium(other).speed),`AUTO improvement at ${angle}°`);
}
console.log(`OK: ${checked} wind/course/sail combinations, mirror symmetry, all controls, and AUTO trim gains.`);
