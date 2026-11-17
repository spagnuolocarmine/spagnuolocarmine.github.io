import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState,equilibrium,installReference} from '../dist/physics.js';
import {computeReference,optimizeForReference} from '../dist/trim-optimizer.js';
import {aeroForces} from '../dist/aero.js';
import {hasSail} from '../dist/boats.js';
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
let cases=0;
for(const boat of [undefined,boats.find(b=>b.name==='NEXT GEN'),boats.find(b=>b.areas.spinnaker&&!b.areas.gennaker)]){const base=newState(boat);base.windAngle=150;const reference=computeReference(base);installReference(reference);for(const sail of ['genoa','gennaker','spinnaker']){if(!hasSail(sail,base))continue;const s=structuredClone(base);s.foresail=sail;s.main=sail!=='genoa';if(sail==='genoa'){s.jibAngleRad=1.2;s.jibAngularVelocity=.3;}if(!boat)s.genoaSize=160;const snapshot=structuredClone(s),solution=optimizeForReference(s,reference),a=solution.state;assert.equal(a.foresail,sail,'AUTO must never select a different foresail');assert.equal(a.main,s.main,'AUTO must not re-hoist a lowered main');assert.equal(a.genoaSize,s.genoaSize,'AUTO keeps generic user sizing');assert.deepEqual(a.sailDesigns,s.sailDesigns);assert.deepEqual(s,snapshot,'optimizer does not mutate the input');const force=aeroForces(a,reference.polarTarget),actual=100*Math.cbrt(force.usefulDrive/reference.score);assert.ok(Math.abs(solution.achievable-actual)<.00001);const m=equilibrium(a);assert.ok(Number.isFinite(m.speed));if(solution.targetReached)assert.ok(Math.abs(m.polarEfficiency-100)<.5);console.log(JSON.stringify({boat:a.boat.name,sail,main:a.main,actual:+m.polarEfficiency.toFixed(2)}));cases++;}}
const calm=newState();calm.windSpeed=0;calm.foresail='spinnaker';calm.main=false;const zero=optimizeForReference(calm,computeReference(calm));assert.equal(zero.state.foresail,'spinnaker');assert.equal(zero.state.main,false);
console.log(`PASS: ${cases} user-selected plans retained for generic/asymmetric/symmetric inventories, lowered main retained, input unmodified, pressure-derived achievable efficiency and zero-wind plan preservation.`);
