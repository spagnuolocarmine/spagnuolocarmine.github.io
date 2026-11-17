import assert from 'node:assert/strict';
import {newState,equilibrium,installReference} from '../dist/physics.js';
import {aeroForces} from '../dist/aero.js';
import {computeReference,optimizeForReference,preferTargetFlow} from '../dist/trim-optimizer.js';
import {TELLTALE_HEIGHTS,telltaleStatus,telltaleRibbon} from '../dist/telltales.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {runnerPoleSupport} from '../dist/flying-surface.js';

// A real pressure field with fewer Newtons but attached flow must win once both
// candidates can deliver the requested target thrust.
const example=newState();example.foresail='none';example.boatSpeed=6;
example.controls.main.sheet=40;const attached=aeroForces(example,6);
example.controls.main.sheet=100;const separated=aeroForces(example,6),target=attached.usefulDrive;
assert.ok(attached.telltales.allAttached&&!separated.telltales.allAttached);
assert.ok(separated.usefulDrive>target);
assert.ok(preferTargetFlow(attached,separated,target));assert.ok(!preferTargetFlow(separated,attached,target));

for(const angle of [-175,-150,150,175]){
 const s=newState();s.windAngle=angle;s.boatSpeed=6;s.foresail='gennaker';s.controls.gennaker.tack=35;
 s.controls.gennaker.sheet=100;const tight=sailPoint('gennaker',.55,0,s);
 s.controls.gennaker.sheet=50;const eased=sailPoint('gennaker',.55,0,s);
 assert.ok(Math.sign(angle)*(eased[0]-tight[0])>1,'easing lets the A2 shoulder rotate windward on either tack');
}
const backwinded=newState();backwinded.foresail='none';backwinded.windAngle=175;backwinded.controls.main.sheet=100;assert.equal(aeroForces(backwinded,6).telltales.allAttached,false,'backflow from leech to luff must never be reported as streaming foil flow');
let last=-1;
for(const angle of [130,150,175]){
 const s=newState();s.windAngle=angle;s.boatSpeed=6;s.foresail='spinnaker';let best={support:-1,brace:0};
 for(let brace=0;brace<=100;brace++){s.controls.spinnaker.brace=brace;const support=runnerPoleSupport(s);if(support>best.support)best={support,brace};}
 assert.ok(best.brace>last,'the supported S2 pole squares progressively as apparent wind moves aft');last=best.brace;
}

let ribbons=0;const results=[];
for(const angle of [160,175]){
 const base=newState();base.windAngle=angle;const reference=computeReference(base);installReference(reference);
 for(const type of ['spinnaker','gennaker']){
  const input=structuredClone(base);input.foresail=type;const before=structuredClone(input),solution=optimizeForReference(input,reference),s=solution.state;
  assert.deepEqual(input,before);assert.equal(s.foresail,type);assert.deepEqual(s.sailDesigns,input.sailDesigns);
  s.boatSpeed=reference.polarTarget;const metric=aeroForces(s,reference.polarTarget);
  assert.ok(Math.abs(solution.achievable-100*Math.cbrt(metric.usefulDrive/reference.score))<1e-8);
  assert.deepEqual(solution.telltales,metric.telltales);assert.equal(solution.flowReached,metric.telltales.allAttached);
  for(const field of metric.sails){let good=0;for(const h of TELLTALE_HEIGHTS)for(const side of [-1,1]){
   const status=telltaleStatus(field.type,s,field,h,side),ribbon=telltaleRibbon(field.type,s,field,h,side,.5);
   assert.equal(ribbon.mode,status.mode);assert.equal(ribbon.bad,status.bad);good+=ribbon.mode==='aderente';ribbons++;
  }assert.equal(good,metric.telltales.sails.find(f=>f.type===field.type).attached,'AUTO reports the exact visible ribbon states');}
  if(solution.targetReached)assert.ok(Math.abs(equilibrium(s).polarEfficiency-100)<.6,'reached target must also settle near the polar speed');
  // A drag-dominated run is allowed to retain separation, never a fabricated all-green field.
  if(!metric.telltales.allAttached)assert.equal(solution.flowReached,false);
  const row={angle,type,achievable:solution.achievable,brace:s.controls.spinnaker.brace,sheet:s.controls[type].sheet,telltales:metric.telltales.attached,total:metric.telltales.total};results.push(row);console.log(JSON.stringify(row));
 }
}
assert.ok(results.find(x=>x.angle===175&&x.type==='spinnaker').brace>results.find(x=>x.angle===160&&x.type==='spinnaker').brace+10,'actual AUTO, not only its seed, squares the pole on the deeper run');
assert.ok(results.find(x=>x.angle===175&&x.type==='gennaker').sheet<results.find(x=>x.angle===160&&x.type==='gennaker').sheet,'actual AUTO eases the A2 sheet on the deeper run');
console.log(`PASS: real target-equivalent trims prefer attached flow; windward A2 shoulders on both tacks, progressive S2 support, four full AUTO runs and ${ribbons} matching pressure/optimizer/rendered ribbon diagnostics, honest downwind separation and pressure-derived performance.`);
