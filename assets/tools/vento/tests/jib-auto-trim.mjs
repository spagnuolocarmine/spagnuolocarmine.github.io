import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState} from '../dist/physics.js';
import {genoaLeadGeometry,genoaCarPosition} from '../dist/deck-layout.js';
import {constrainAutoJibCar,autoJibCarClearance} from '../dist/jib-trim-constraints.js';
import {advanceJibDynamics} from '../dist/jib-dynamics.js';
import {computeReference,optimizeForReference} from '../dist/trim-optimizer.js';
import {sailPoint} from '../dist/sail-geometry.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
let cases=0,frames=0;
for(const boat of[undefined,catalog.find(b=>b.name==='NEXT GEN')])for(const size of[105,115,160])for(const wind of[8,20])for(const angle of[-52,52,150])for(const sheet of[0,50,100]){
 const s=newState(boat);Object.assign(s,{genoaSize:size,windSpeed:wind,windAngle:angle,boatSpeed:6});s.controls.genoa.sheet=sheet;s.controls.genoa.car=100;
 assert.ok(constrainAutoJibCar(s),'a physical lead behind the clew must exist');const car=genoaCarPosition(s),clew=sailPoint('genoa',0,1,s);
 assert.ok(car[2]<=clew[2]-.0009,'AUTO never leads forward past the actual drawn clew');assert.ok(s.controls.genoa.car>=0&&s.controls.genoa.car<=100);cases++;
}
for(const angle of[-52,52,150])for(const[from,to]of[[0,100],[100,0]]){
 const s=newState();s.genoaSize=160;s.windAngle=angle;s.boatSpeed=6;s.controls.genoa.sheet=from;advanceJibDynamics(s,0);s.controls.genoa.sheet=to;
 for(let frame=0;frame<360;frame++){advanceJibDynamics(s,1/60);assert.ok(constrainAutoJibCar(s,100));assert.ok(autoJibCarClearance(s)>=.0009,'plumb-line constraint also holds during live cloth motion');frames++;}
}
const hauled=newState();hauled.windAngle=52;hauled.genoaSize=160;hauled.boatSpeed=6;hauled.controls.genoa.car=45;hauled.controls.genoa.sheet=100;const lead=genoaLeadGeometry(hauled);
assert.ok(!lead.contactLimited,'a clear curved sail must reach the true nearest lead, without the old flat-envelope stop');assert.ok(Math.abs(lead.angle-lead.unconstrainedClosedAngle)<1e-9);assert.ok(Math.abs(lead.sheetLength-lead.minimumSheetLength)<1e-9);
for(const boat of[undefined,catalog.find(b=>b.name==='NEXT GEN')]){
 const s=newState(boat);s.genoaSize=160;s.controls.genoa.car=100;s.controls.genoa.sheet=100;const reference=computeReference(s),solution=optimizeForReference(s,reference),a=solution.state;
 assert.equal(a.foresail,'genoa');assert.ok(autoJibCarClearance(a)>=.0009,'returned AUTO solution is constrained, including reference fast path');assert.ok(Number.isFinite(solution.achievable));
}
console.log(`PASS: ${cases} sail/wind/track cases, ${frames} transient frames, true full-haul endpoint and constrained generic/certificate AUTO results.`);
