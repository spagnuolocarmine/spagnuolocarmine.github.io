import assert from 'node:assert/strict';
import {newState} from '../dist/physics.js';
import {aeroForces} from '../dist/aero.js';
import {rigResponse} from '../dist/standing-rig.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {autoTensionRange,windDemand} from '../dist/trim-response.js';
let swept=0;
for(const wind of [8,12,20,30]){
 const s=newState();s.windSpeed=wind;s.boatSpeed=6;const normal=aeroForces(s,6),loose=structuredClone(s);loose.controls.rig={backstay:0,forestay:0,shrouds:0};const poor=aeroForces(loose,6);if(wind>=12)assert.ok(poor.drive<normal.drive*.95,'excessive actual rig deformation must meaningfully reduce the pressure-supported drive');
 for(const key of ['backstay','forestay','shrouds']){let previous;for(let value=0;value<=100;value+=2){const t=structuredClone(s);t.controls.rig[key]=value;const r=rigResponse(t),point=sailPoint(key==='forestay'?'genoa':'main',.5,.75,t);assert.ok([...Object.values(r).filter(v=>typeof v==='number'),...point].every(Number.isFinite));if(previous)assert.ok(Math.hypot(...point.map((p,i)=>p-previous[i]))<.055,'rig geometry progresses without abrupt 2% steps');previous=point;swept++;}}
 const up=autoTensionRange('main','halyard',wind,45),run=autoTensionRange('main','halyard',wind,175);assert.ok(up[1]>up[0]&&run[1]>run[0]);assert.ok(run[0]<up[0]||wind===8);assert.ok(autoTensionRange('rig','shrouds',wind,45)[0]<100,'wind never forces every stay to maximum');console.log(JSON.stringify({wind,normalDrive:normal.drive,looseRigDrive:poor.drive,halyardRange:up,runningRange:run}));
}
let last=-1;for(let wind=4;wind<=30;wind+=.1){const d=windDemand(wind);assert.ok(d>=last-1e-10&&d<=1);if(last>=0)assert.ok(d-last<.012);last=d;}
assert.ok(windDemand(8)>.1);assert.deepEqual(autoTensionRange('main','battens',8),autoTensionRange('main','battens',30));// Reducing load can help an otherwise overpowered, untrimmed plan. Speed is compared against optimized settings in book-auto, not against arbitrary default trim.
console.log(`PASS: ${swept} smooth rig settings, early gradual demand, course-dependent AUTO ranges and pressure loss from excessive actual deformation; no universal maximum-tension or batten rule.`);
