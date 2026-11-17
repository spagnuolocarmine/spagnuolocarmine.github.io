import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState,evaluate} from '../dist/physics.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {sailArea} from '../dist/aero.js';
import {selectedArea,rigDimensions} from '../dist/orc-sails.js';
import {measuredArea,measuredProfile,flyingCut,resizeFlyingDesign} from '../dist/sail-measures.js';
import {positiveMeasurements,designWarnings,editableDesign} from '../dist/sail-exploration.js';
import {rigPlan} from '../dist/rig-plan.js';
import {windLayout} from '../dist/wind-settings.js';
const initial=newState();assert.equal(initial.windAngle,45);initial.foresail='none';let m=evaluate(initial,5);assert.deepEqual(m.sails.map(s=>s.type),['main']);assert.equal(m.area,sailArea('main',initial));assert.ok(rigPlan(initial).filter(r=>r.active).every(r=>!/^genoa|^spinnaker|^gennaker/.test(r.part)));initial.main=false;m=evaluate(initial,0);assert.equal(m.area,0);assert.equal(m.lift,0);assert.equal(m.drag,0);assert.equal(m.targetSpeed,0);
assert.deepEqual(windLayout(1),{density:1,streams:12,perStream:22,particles:264});assert.ok(windLayout(4).particles>windLayout(1).particles&&windLayout(4).streams>12);assert.ok(windLayout(.5).particles<264);
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats,boat=boats.find(b=>b.name==='NEXT GEN'),state=newState(boat),cert=structuredClone(boat.areas),rigBefore=rigDimensions(state).ISP;
state.sailDesigns.main={...state.sailDesigns.main,MHW:state.sailDesigns.main.MHW*1.2,exploratory:true};assert.equal(sailArea('main',state),measuredArea('main',state.sailDesigns.main));assert.notEqual(sailArea('main',state),cert.main);assert.deepEqual(state.boat.areas,cert);
const fields={main:{P:2,E:7,MQW:15,MHW:.01,MTW:10,MUW:.1,MHB:4},genoa:{HLU:1,HLP:9,HQW:.01,HHW:8,HTW:.1,HUW:7,HHB:2},spinnaker:{SLU:2,SLE:1,SFL:25,SHW:1},gennaker:{SLU:2,SLE:30,SFL:1,SHW:20}};
let checked=0;
for(const [type,values] of Object.entries(fields)){
 const s=newState();s.sailDesigns[type]={...values,exploratory:true};s.foresail=type==='main'?'none':type;s.windAngle=type==='main'||type==='genoa'?45:130;
 assert.ok(positiveMeasurements(type,s.sailDesigns[type]));assert.ok(Object.keys(designWarnings(type,s.sailDesigns[type],s)).length>0);
 const cut=type==='main'||type==='genoa'?measuredProfile(type,s.sailDesigns[type]):flyingCut(type,s.sailDesigns[type]);assert.ok(cut.approximate,'incompatible dimensions use an explicit approximate surface');
 for(const v of [0,.2,.4,.7,.95,1])for(const u of [0,.2,.5,.8,1]){assert.ok(sailPoint(type,v,u,s).every(Number.isFinite),type+' finite independent-dimension geometry');checked++;}
 const out=evaluate(s,5,'coarse');for(const key of ['cl','cd','lift','drag','area','targetSpeed'])assert.ok(Number.isFinite(out[key]),type+' finite '+key);
}
resizeFlyingDesign('gennaker',state,cert.gennaker*1.5);assert.ok(Math.abs(selectedArea('gennaker',state)-cert.gennaker*1.5)<1e-8);assert.deepEqual(state.boat.areas,cert);assert.equal(rigDimensions(state).ISP,rigBefore);
assert.throws(()=>positiveMeasurements('main',{...state.sailDesigns.main,P:-1}));
const generic=newState(),edit=editableDesign('genoa',generic);assert.ok(Math.abs(measuredArea('genoa',edit)-sailArea('genoa',generic))<1e-8,'editor displays actual dimensions before independent editing');
for(const type of ['spinnaker','gennaker']){const s=newState();s.foresail=type;s.windAngle=130;s.windSpeed=20;s.controls[type].halyard=0;const low=sailPoint(type,1,0,s),a=evaluate(s,6,'coarse');s.controls[type].halyard=100;const high=sailPoint(type,1,0,s),b=evaluate(s,6,'coarse');assert.ok(high[1]>low[1]+.05,type+' halyard changes head height');assert.ok(Math.abs(a.cl-b.cl)>.0001,type+' halyard changes integrated pressures');assert.equal(a.area,b.area);}
console.log(`PASS: 45° default, mainsail-only and no-sail forces, wind density, independent certificate areas and ${checked} finite vertices plus finite pressure/force results for incompatible cuts on all four sails.`);
