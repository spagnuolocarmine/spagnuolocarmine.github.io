import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState,CONTROL_DEFS} from '../dist/physics.js';
import {apparentWind,aeroForces} from '../dist/aero.js';
import {sailShape,sailPoint} from '../dist/sail-geometry.js';
import {controlSpec,controlPositionDescription} from '../dist/control-spec.js';
import {sectionTwistAngle} from '../dist/sail-twist.js';
import {spinPoleRig} from '../dist/orc-sails.js';
import {rigPlan} from '../dist/rig-plan.js';
import {flyingSheetLead} from '../dist/sheet-travel.js';

const close=(a,b,why='',tolerance=1e-6)=>assert.ok(Math.abs(a-b)<tolerance, `${why}: ${a} != ${b}`);
const state=newState();
for(const type of ['main','genoa']){
 assert.ok(CONTROL_DEFS[type].some(x=>x[0]==='twist'));
 assert.equal(state.controls[type].twist,10);
 const spec=controlSpec(type,'twist',state);
 assert.deepEqual([spec.min,spec.max,spec.step,spec.unit],[0,50,1,'°']);
 for(const amount of [0,10,25,50]){
  const s=newState();s.controls[type].twist=amount;
  const curve=sailShape(type,s,.45);
  close(curve.twist,amount,`${type} at ${amount} degrees`);
  for(const h of [0,.1,.25,.5,.75,1])close(sectionTwistAngle(curve.twist,h),h*amount,`${type} proportional twist at h=${h}`);
  const pt=sailPoint(type,.7,.9,s);assert.ok(pt.every(Number.isFinite));
 }
 assert.ok(controlPositionDescription(type,'twist',10,state).includes('10°'));
 const flat=newState(),large=newState();flat.controls[type].twist=0;large.controls[type].twist=50;
 const pf=sailPoint(type,.8,.9,flat),pl=sailPoint(type,.8,.9,large);
 assert.ok(Math.hypot(...pf.map((v,i)=>v-pl[i]))>.12,`${type} shape must really rotate`);
}
for(const twa of [-165,-80,-30,0,30,80,165]){
 const moving=apparentWind(13,twa,7),stopped=apparentWind(13,twa,0);
 close(stopped.angle,twa,'AWA at zero boat speed');
 assert.ok(Number.isFinite(moving.angle));
 assert.ok(moving.angle*twa>=0,'AWA tack is preserved');
}
const changed=newState();changed.controls.main.twist=50;
const normal=aeroForces(newState(),4,'coarse'),twisted=aeroForces(changed,4,'coarse');
assert.ok(Math.abs(normal.drive-twisted.drive)>.001,'main twist must affect aerodynamic driving force');
for(const brace of [0,25,50,75,100]){
 const s=newState();s.foresail='spinnaker';s.windAngle=150;s.controls.spinnaker.brace=brace;
 close(spinPoleRig(s).azimuth*180/Math.PI,8+82*brace/100,'physical pole angle');
 assert.ok(controlPositionDescription('spinnaker','brace',brace,s).includes(`${Math.round(8+82*brace/100)}°`));
}
for(const b of [0,1,40,100]){
 const s=newState();s.foresail='spinnaker';s.windAngle=150;s.controls.spinnaker.sheet=50;s.controls.spinnaker.barberSheet=b;
 const plan=rigPlan(s),sheet=plan.find(x=>x.id==='spinnaker.sheet'),barber=plan.find(x=>x.id==='spinnaker.barberSheet');
 assert.ok(sheet&&barber);
 assert.deepEqual(sheet.points.at(-1),flyingSheetLead('spinnaker',s));
 assert.equal(sheet.points.length,b===0?2:3,'only an eased barber removes the sheet guide ring');
 assert.ok(barber.points.length>=2,'barber rope remains visible');
}
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
for(const id of ['headerApparentDirection','windAwaValue','windAwaOutput','instrumentAwa','quickWindApparent'])assert.ok(html.includes(`id="${id}"`));
assert.ok(fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8').includes('syncApparentAngle()'));
console.log('PASS: AWA alongside TWA, direct main/genoa twist 0–50° and linear height distribution, aerodynamic consequence, pole to 90°, and completely slack barber with unrestricted sheet.');
