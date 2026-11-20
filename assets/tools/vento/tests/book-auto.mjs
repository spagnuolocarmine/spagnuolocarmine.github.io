import assert from 'node:assert/strict';
import {newState,equilibrium,installReference} from '../dist/physics.js';
import {computeReference,optimizeForReference} from '../dist/trim-optimizer.js';
import {aeroForces} from '../dist/aero.js';
import {autoTensionRange} from '../dist/trim-response.js';
const rows=[];
for(const [wind,angle,sail] of [[8,45,'genoa'],[12,52,'genoa'],[20,60,'genoa'],[12,150,'spinnaker'],[12,175,'spinnaker'],[12,135,'gennaker']]){
 const s=newState();s.windSpeed=wind;s.windAngle=angle;s.foresail=sail;const input=structuredClone(s),start=performance.now(),reference=computeReference(s);installReference(reference);const result=optimizeForReference(s,reference),m=equilibrium(result.state);assert.deepEqual(s,input);assert.equal(result.state.foresail,sail);assert.ok(result.targetReached,`${wind}/${angle}/${sail}: ${result.achievable}%`);assert.ok(Math.abs(m.polarEfficiency-100)<.5,`settled actual speed ${m.polarEfficiency}%`);assert.ok(Math.abs(result.achievable-100*Math.cbrt(aeroForces(result.state,reference.polarTarget).usefulDrive/reference.score))<1e-7,'speed must come from actual pressure-derived forces, never an AUTO display override');
 for(const [category,controls]of Object.entries(result.state.controls))if(['main','rig',sail].includes(category))for(const [key,value]of Object.entries(controls)){const [lo,hi]=autoTensionRange(category,key,wind,angle);assert.ok(value>=lo-1e-7&&value<=hi+1e-7);}
 const poor=structuredClone(result.state);poor.controls.main.sheet=100;poor.controls[sail].sheet=0;if(angle<170)assert.ok(equilibrium(poor).polarEfficiency<m.polarEfficiency-1,'bad trim must still reduce performance');
 const row={wind,angle,sail,polarEfficiency:+m.polarEfficiency.toFixed(4),flowAppropriate:result.flowReached,attached:m.telltales.attached,total:m.telltales.total,brace:+result.state.controls.spinnaker.brace.toFixed(2),sheet:+result.state.controls[sail].sheet.toFixed(2),halyard:+result.state.controls[sail].halyard.toFixed(2),seconds:+((performance.now()-start)/1000).toFixed(1)};rows.push(row);console.log(JSON.stringify(row));
}
const early=rows.find(x=>x.wind===8),strong=rows.find(x=>x.wind===20);assert.ok(strong.halyard>early.halyard,'halyard response progresses with load');assert.ok(rows.find(x=>x.angle===175).brace>rows.find(x=>x.angle===150).brace,'actual S2 AUTO squares further on a deep run');
console.log('PASS: six suitable original plans at calculated 100% polar equilibrium; gradual trim, unchanged user selection and pressure-derived losses from bad settings.');
