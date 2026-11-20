import assert from 'node:assert/strict';
import {newState,evaluate} from '../dist/physics.js';
import {windReferenceHeight,trueWindAtHeight,polarWindSpeed} from '../dist/wind-profile.js';
import {sailFlowAtHeight} from '../dist/sail-flow.js';
import {polarSpeed} from '../dist/polar.js';
import {buildWindPaths} from '../dist/wind-particles.js';
const s=newState();s.windSpeed=10;s.windAngle=45;s.boatSpeed=5;const H=windReferenceHeight(s);assert.equal(trueWindAtHeight(s,H),10);assert.equal(trueWindAtHeight(s,H+3),10);assert.equal(trueWindAtHeight(s,0),trueWindAtHeight(s,1.5));const heights=[1.5,3,6,10,H].sort((a,b)=>a-b),flows=heights.map(z=>sailFlowAtHeight(s,z));for(let i=1;i<flows.length;i++){assert.ok(flows[i].tws>flows[i-1].tws);assert.ok(flows[i].aws>flows[i-1].aws);assert.ok(flows[i].awa>flows[i-1].awa);}assert.ok(trueWindAtHeight(s,1.5)>7&&trueWindAtHeight(s,1.5)<9,'slight marine decrease, not a large boundary-layer collapse');
const copy=structuredClone(s);copy.controls.main.halyard=0;copy.controls.rig.backstay=100;copy.sailDesigns.main.MHB*=1.3;assert.equal(windReferenceHeight(copy),H,'trim and custom sail edits do not move the atmospheric reference');assert.ok(Math.abs(polarWindSpeed(s)-10*(10/H)**.11)<1e-12);assert.ok(Math.abs(polarSpeed(10,45,s)-polarSpeed(polarWindSpeed(s),45))<1e-10,'polar interpolation uses the equivalent 10 m reference once');
const uniform={...s,windShear:0};assert.equal(trueWindAtHeight(uniform,1.5),10);assert.equal(polarWindSpeed(uniform),10);
const m=evaluate(s,5),paths=buildWindPaths(s,m,12),ambient=paths.filter(p=>p.ambient),low=ambient.find(p=>p.windHeight===2),high=ambient.find(p=>p.windHeight===10);assert.ok(high.speed>low.speed);assert.ok(high.flow[0]<low.flow[0],'height changes the incoming apparent direction as well as speed');for(const path of paths){assert.ok(Number.isFinite(path.aws)&&path.aws>=0);assert.ok(path.flow.every(Number.isFinite));assert.ok(path.speed>=0);}
console.log('PASS: input at rig head, marine gradient and apparent veer, fixed hardware reference, 10 m polar conversion, uniform limit and height-dependent visual particles.');
