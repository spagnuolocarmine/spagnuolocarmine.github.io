import assert from 'node:assert/strict';
import {newState} from '../dist/physics.js';
import {controlEnabled,setControlEnabled,restoreFixedControls} from '../dist/control-state.js';
import {computeReference,optimizeForReference,optimalControlSettings,controlTargetKey} from '../dist/trim-optimizer.js';
import {aeroForces} from '../dist/aero.js';
import {headsailInfo,headsailInhaulAllowed} from '../dist/orc-sails.js';
import {controlSpec,controlToValue,valueToControl} from '../dist/control-spec.js';
import {genoaLeadGeometry} from '../dist/deck-layout.js';
import {constrainAutoJibCar} from '../dist/jib-trim-constraints.js';

const base=newState(),reference=computeReference(base),frozen=structuredClone(base);
frozen.controls.genoa.car=0;frozen.controls.rig={backstay:0,forestay:0,shrouds:0};
frozen.controls.main.halyard=0;
let count=0;
for(const [cat,values] of Object.entries(frozen.controls))for(const key of Object.keys(values)){
 assert.ok(controlEnabled(frozen,cat,key),'all controls enabled by default');
 setControlEnabled(frozen,cat,key,false);assert.equal(controlEnabled(frozen,cat,key),false);count++;
}
assert.equal(count,26);const fixed=structuredClone(frozen.controls),input=structuredClone(frozen);
const solution=optimizeForReference(frozen,reference);
assert.deepEqual(solution.state.controls,fixed,'all 26 controls remain fixed in every AUTO stage');
assert.deepEqual(frozen,input,'AUTO leaves its input untouched');
assert.equal(solution.targetReached,false,'poor fixed trim cannot be reported as 100%');
assert.ok(Math.abs(solution.achievable-100*Math.cbrt(aeroForces(solution.state,reference.polarTarget).usefulDrive/reference.score))<1e-8);
const storm=structuredClone(frozen);storm.windSpeed=30;const stormResult=optimizeForReference(storm,{...reference,polarTarget:7});
assert.deepEqual(stormResult.state.controls,fixed,'30 kn minimum-tension search bounds never override a fixed value');
const subset=structuredClone(base);subset.controls.genoa.car=0;
for(const [cat,key] of [['main','battens'],['rig','backstay'],['rig','forestay'],['rig','shrouds'],['genoa','car']])setControlEnabled(subset,cat,key,false);
const partial=optimizeForReference(subset,reference);
for(const [id,value] of Object.entries(subset.fixedControls)){const [cat,key]=id.split('.');assert.equal(partial.state.controls[cat][key],value,id);}
assert.ok(constrainAutoJibCar(partial.state));
const target=optimalControlSettings(subset,reference),other=structuredClone(subset);other.controls.main.sheet=3;other.controls.genoa.sheet=9;
assert.equal(controlTargetKey(other),controlTargetKey(subset));
assert.deepEqual(optimalControlSettings(other,reference).controls,target.controls,'ideal targets ignore other enabled live settings');
other.controls.rig.backstay=4;setControlEnabled(other,'rig','backstay',false);
assert.notEqual(controlTargetKey(other),controlTargetKey(subset),'fixed values belong to the target key');
setControlEnabled(other,'rig','backstay',true);assert.ok(controlEnabled(other,'rig','backstay'));
const zero=structuredClone(base);zero.controls.main.sheet=0;setControlEnabled(zero,'main','sheet',false);zero.controls.main.sheet=88;restoreFixedControls(zero);assert.equal(zero.controls.main.sheet,0,'a fixed zero is not an absent lock');

for(const percent of [104.99,105,105.01,160]){
 const s=newState();s.sailDesigns.genoa.exploratory=true;s.sailDesigns.genoa.HLP=4.32*percent/100;
 const allowed=percent<=105;assert.equal(headsailInhaulAllowed(s),allowed);assert.ok(Math.abs(headsailInfo(s).percent-percent)<1e-8);
 const p=controlSpec('genoa','barber',s);assert.equal(p.min,allowed?-100:0);
 assert.equal(controlToValue('genoa','barber',50,s),0);assert.equal(valueToControl('genoa','barber',0,s),50);
 assert.equal(valueToControl('genoa','barber',100,s),100);assert.equal(valueToControl('genoa','barber',-100,s),allowed?0:50);
 s.controls.genoa.barber=0;const g=genoaLeadGeometry(s);
 if(!allowed){assert.equal(g.barber,0,'physical lead clamps stale inhaul settings');assert.deepEqual(g.ring,g.lead);}
}
const illegal=newState();illegal.controls.genoa.car=100;setControlEnabled(illegal,'genoa','car',false);const previous=illegal.controls.genoa.car;constrainAutoJibCar(illegal);assert.equal(illegal.controls.genoa.car,previous,'car constraints cannot move a fixed carriage');
console.log('PASS: 26 default-enabled controls, fixed zero / rig / sheets / car retained through global and individual AUTO, tension bounds and wind changes; honest pressure-derived attainable speed; real LP/J 105% threshold enforced in slider mapping and physical barber lead.');
