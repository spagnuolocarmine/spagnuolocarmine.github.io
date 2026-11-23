import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState} from '../dist/physics.js';
import {controlEnabled,setControlEnabled,restoreFixedControls} from '../dist/control-state.js';
import {restoreSessionState,snapshotState} from '../dist/session-store.js';
import {computeReference,optimizeForReference,optimalControlSettings,controlTargetKey,provisionalReference} from '../dist/trim-optimizer.js';
import {mainLeechBalance} from '../dist/main-balance.js';
import {preserveStaticSailTwist} from '../dist/sail-twist.js';
import {sailShape,mainSheetAngle,sailPoint} from '../dist/sail-geometry.js';
import {aeroForces} from '../dist/aero.js';

const base=newState();
assert.equal(base.controls.main.twist,10);
assert.equal(base.controls.genoa.twist,10);
for(const type of ['main','genoa']){
 assert.equal(controlEnabled(base,type,'twist'),false,'static twist is not an AUTO dimension');
 setControlEnabled(base,type,'twist',false);
 assert.equal(base.fixedControls[type+'.twist'],undefined,'AUTO locking cannot apply to a static property');
}
const legacy=snapshotState(base);
legacy.controls.main.twist=32;
legacy.controls.genoa.twist=4;
legacy.fixedControls={'main.twist':9,'genoa.twist':19};
const migrated=restoreSessionState(legacy);
assert.equal(migrated.controls.main.twist,32,'only the saved design value survives');
assert.equal(migrated.controls.genoa.twist,4);
assert.equal(migrated.fixedControls['main.twist'],undefined,'legacy AUTO lock discarded');
assert.equal(migrated.fixedControls['genoa.twist'],undefined,'legacy AUTO lock discarded');
const fixed=structuredClone(base);fixed.controls.main.twist=33;fixed.fixedControls['main.twist']=4;
restoreFixedControls(fixed);assert.equal(fixed.controls.main.twist,33,'old fixed-control paths cannot overwrite user twist');

const input=newState();input.windSpeed=0;input.controls.main.twist=35;input.controls.genoa.twist=6;
const snapshot=structuredClone(input);
const reference=computeReference(input);
assert.equal(reference.state.controls.main.twist,10,'original certified reference uses original design twist');
assert.equal(reference.state.controls.genoa.twist,10);
const other=structuredClone(input);other.controls.main.twist=0;other.controls.genoa.twist=50;
assert.equal(computeReference(other).score,reference.score,'changing design twist does not recalibrate original polar reference');
// Full optimizer paths are exercised separately; the zero-wind solution is
// deterministic and allows an inexpensive check of protected state propagation.
const solution=optimizeForReference(input,reference);
for(const type of ['main','genoa'])assert.equal(solution.state.controls[type].twist,input.controls[type].twist,'global AUTO must retain static sail design');
assert.deepEqual(input,snapshot,'AUTO cannot mutate the user state');
assert.notEqual(controlTargetKey(input),controlTargetKey(other),'single manoeuvre target cache is invalidated when the sail design changes');
const single=optimalControlSettings(input,reference);
for(const type of ['main','genoa'])assert.equal(single.controls[type].twist,input.controls[type].twist,'single AUTO cannot change static twist');
const optimizerSource=fs.readFileSync(new URL('../dist/trim-optimizer.js',import.meta.url),'utf8');
assert.match(optimizerSource,/key!=='twist'&&controlEnabled/,'bounds skip static twist');
assert.match(optimizerSource,/preserveStaticSailTwist\(state,input\)/,'quick optimization preserves user twist');
assert.match(optimizerSource,/k==='twist'\?DEFAULT_TWIST:50/,'factory reference neutralizes user twist');
const injected=structuredClone(base);injected.controls.main.twist=0;injected.controls.genoa.twist=50;preserveStaticSailTwist(injected,input);assert.equal(injected.controls.main.twist,35);assert.equal(injected.controls.genoa.twist,6);
const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
assert.match(app,/preserveStaticSailTwist\(state,\{controls:previousControls\}\)/,'UI applies AUTO without replacing sail-design twist');
assert.match(app,/if\(key==='twist'\)return; \/\/ This static design property is only editable/);
assert.match(app,/const twistRow=staticTwist\?/,'twist remains in the measures section');

for(const [windAngle,sheet] of [[45,88],[90,35],[140,25],[155,0]]){
 const s=newState();s.windAngle=windAngle;s.windSpeed=14;s.boatSpeed=5;s.controls.main.sheet=sheet;
 const states=[];
 for(const vang of [0,25,50,75,100]){
  s.controls.main.vang=vang;const angle=mainSheetAngle(s);
  const leech=mainLeechBalance(s,angle);const shape=sailShape('main',s,.8);
  const clew=sailPoint('main',0,1,s);const metric=vang===0||vang===100?aeroForces(s,5,'coarse'):{usefulDrive:0};
  assert.ok([shape.twist,leech.elevation,clew[1],metric.usefulDrive].every(Number.isFinite));
  states.push({vang,twist:shape.twist,lift:leech.elevation,clew:clew[1],drive:metric.usefulDrive});
 }
 for(let i=1;i<states.length;i++){
  assert.ok(states[i].twist<=states[i-1].twist+1e-8,`hauling vang closes main leech ${windAngle}/${sheet}`);
  assert.ok(states[i].lift<=states[i-1].lift+1e-8,`hauling vang reduces boom lift ${windAngle}/${sheet}`);
  assert.ok(states[i].clew<=states[i-1].clew+1e-8,`hauling vang lowers boom ${windAngle}/${sheet}`);
 }
 if(sheet<=35){
  assert.ok(states[0].twist-states.at(-1).twist>10,'vigorous leech response when sheet is eased');
  assert.ok(states[0].clew-states.at(-1).clew>.35,'visible boom lowering under vang tension');
  if(windAngle===140)assert.ok(Math.abs(states[0].drive-states.at(-1).drive)>1,'actual aerodynamic drive must respond, not only geometry');
 }
 if(sheet>=88)assert.ok(states[0].twist-states.at(-1).twist<6,'sheet retains its authority upwind');
}
console.log('PASS: user-only static twist persists through legacy session/lock, certified reference, zero-wind AUTO paths and protections for full optimization, cache invalidation and UI; vang reduces leech twist and boom lift progressively with pressure-dependent drive, most strongly on eased sheets.');
