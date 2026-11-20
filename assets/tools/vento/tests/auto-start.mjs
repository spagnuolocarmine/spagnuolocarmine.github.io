// Regression: steady optimisation passed while the live boat was trapped below 15%.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState,evaluate,equilibrium,installReference,lerp} from '../dist/physics.js';
import {computeReference,optimizeForReference} from '../dist/trim-optimizer.js';
import {advanceJibDynamics} from '../dist/jib-dynamics.js';
import {constrainAutoJibCar} from '../dist/jib-trim-constraints.js';
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
for(const [boat,wind,angle,sail]of [[boats.find(b=>b.name==='FINTO TONTO'),20,60,'genoa'],[boats.find(b=>b.name==='NEXT GEN'),12,-45,'genoa'],[undefined,30,52,'genoa'],[undefined,12,175,'spinnaker'],[undefined,12,135,'gennaker']]){
 const state=newState(boat);Object.assign(state,{windSpeed:wind,windAngle:angle,foresail:sail,boatSpeed:0});advanceJibDynamics(state,0);const reference=computeReference(state);installReference(reference);const solution=optimizeForReference(state,reference);assert.ok(solution.targetReached);state.controls=structuredClone(solution.state.controls);state.auto=true;const car=state.controls.genoa.car;let speed=0,m=evaluate(state,0);
 assert.equal(m.keelDrag,0);assert.equal(m.rudderDrag,0);
 for(let frame=0;frame<3600;frame++){const dt=.05;speed=lerp(speed,m.targetSpeed,1-Math.exp(-dt/(m.settlingTime||6)));state.boatSpeed=speed;advanceJibDynamics(state,dt);assert.ok(constrainAutoJibCar(state,car),'lead remains behind the moving clew');if(frame%4===0){m=evaluate(state,speed);state.rigLoads=m.rigLoads;state.effectiveSheets=m.effectiveSheets;}assert.ok(Number.isFinite(speed)&&speed>=0);}
 const efficiency=100*speed/reference.polarTarget;assert.ok(Math.abs(efficiency-100)<.5,`${state.boat.name}, ${wind}/${angle}/${sail}: live start settled at ${efficiency}%`);assert.ok(Math.abs(equilibrium(state).polarEfficiency-100)<.5);assert.equal(state.foresail,sail);console.log(JSON.stringify({boat:state.boat.name,wind,angle,sail,liveEfficiency:+efficiency.toFixed(4)}));
}
console.log('PASS: five live starts from zero across generic/certificate boats, both tacks, 12–30 kn, genoa/S2/A2; pressure-derived speed converges to the polar.');
