import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState} from '../dist/physics.js';
import {computeReference,optimizeForReference} from '../dist/trim-optimizer.js';
import {aeroForces} from '../dist/aero.js';
import {spinPoleRig} from '../dist/orc-sails.js';
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
for(const type of ['spinnaker','gennaker']){
 const boat=type==='spinnaker'?boats.find(b=>b.areas.spinnaker>0&&!b.areas.gennaker):boats.find(b=>b.name==='NEXT GEN'),s=newState(boat);s.foresail=type;s.windAngle=type==='spinnaker'?150:120;s.controls.spinnaker.poleLift=0;
 const reference=computeReference(s,p=>console.log(JSON.stringify({type,phase:p.progress}))),solution=optimizeForReference(s,reference),a=solution.state;
 assert.equal(a.foresail,type,'AUTO preserves the user-selected available sail');assert.deepEqual(a.sailDesigns,s.sailDesigns,'measured shape retained');assert.deepEqual(a.sailAreas,s.sailAreas,'certificate areas retained');
 const measured=aeroForces(a,reference.polarTarget),actual=100*Math.cbrt(measured.usefulDrive/reference.score);assert.ok(Math.abs(actual-solution.achievable)<1e-6,'performance comes from the actual new pressure surfaces');
 if(type==='spinnaker'){assert.ok(a.controls.spinnaker.poleLift>=0&&a.controls.spinnaker.poleLift<=100);const other=structuredClone(s);other.controls.spinnaker.poleLift=100;const again=optimizeForReference(other,reference);assert.ok(a.controls.spinnaker.poleLift!==s.controls.spinnaker.poleLift||again.state.controls.spinnaker.poleLift!==other.controls.spinnaker.poleLift,'AUTO actually searches the new pole-height dimension');assert.ok(Number.isFinite(spinPoleRig(a).tip[1]));}
 console.log(JSON.stringify({type,boat:boat.name,percent:solution.achievable,poleLift:a.controls.spinnaker.poleLift,evaluations:solution.evaluations}));
}
console.log('PASS: both certified downwind plans retained, new pole-height control optimized, dimensions fixed and pressure-derived achievable performance.');
