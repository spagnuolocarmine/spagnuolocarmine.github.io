import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState} from '../dist/physics.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {rigPlan} from '../dist/rig-plan.js';
import {spinnakerBarberGeometry} from '../dist/spinnaker-barbers.js';
import {controlSpec} from '../dist/control-spec.js';
import {genoaLeadGeometry} from '../dist/deck-layout.js';
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
const mix=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const near=(a,b,e=1e-8)=>assert.ok(distance(a,b)<e,`${a} != ${b}`);
const html=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
assert.ok(html.includes("filter(d=>d[0]!=='twist'"),'twist excluded from manovre');
assert.ok(html.includes("const twistRow=staticTwist?")&&html.includes("twistRow+MEASURE_FIELDS[designType]"),'twist first measure');
for(const kind of ['main','genoa']){
 const s=newState();assert.equal(s.controls[kind].twist,10);const p=controlSpec(kind,'twist',s);assert.equal(p.min,0);assert.equal(p.max,50);
}
assert.equal(controlSpec('genoa','sheet',newState()).max,120,'sheet overtrim range must reach 120%');
let cases=0;
for(const angle of [-165,-140,140,165])for(const sheet of [40,60,100])for(const brace of [0,25,50,75,100])for(const barberSheet of [0,25,50,75,100]){
 const s=newState();s.windAngle=angle;s.foresail='spinnaker';s.controls.spinnaker.sheet=sheet;s.controls.spinnaker.brace=75;
 s.controls.spinnaker.barberSheet=barberSheet;s.controls.spinnaker.barberBrace=brace;
 const g=spinnakerBarberGeometry(s,{tack:sailPoint('spinnaker',0,0,s),clew:sailPoint('spinnaker',0,1,s)});
 const plan=rigPlan(s),get=id=>plan.find(p=>p.id==='spinnaker.'+id);
 for(const [kind,val,line] of [['sheet',barberSheet,'sheet'],['brace',brace,'brace']]){
  const b=g[kind],rope=get(line),barber=get(kind==='sheet'?'barberSheet':'barberBrace');
  assert.ok(barber&&rope);
  near(b.ring,mix(b.free,b.down,val/100));
  assert.ok(b.ring[1]>=1.13-1e-9);
  if(val===0){assert.equal(rope.points.length,2,`${kind}: zero barber must not turn the working rope`);const start=rope.points[0],end=rope.points[1];assert.ok(distance(cross(b.free.map((v,i)=>v-start[i]),end.map((v,i)=>v-start[i])),[0,0,0])<1e-7,'unused ring must lie on free line');}
  else {assert.deepEqual(rope.points[1],b.ring,'working rope must go through pulled ring');}
  if(val===100){assert.ok(b.ring[1]<=1.14,`${kind}: fully hauled ring must be near deck`);assert.ok(distance(b.ring,b.anchor)<.25,`${kind}: fully hauled ring should reach its deck attachment`);}
 }
 cases++;
}
console.log(`PASS: ${cases} independent spinnaker sheet/guy barber combinations, free 0%, progressively pulled ring 25–75%, near deck 100%, static twist placement, genoa 120% scale.`);
