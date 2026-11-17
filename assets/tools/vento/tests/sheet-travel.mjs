import assert from 'node:assert/strict';
import {newState} from '../dist/physics.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {genoaLeadGeometry} from '../dist/deck-layout.js';
import {flyingSheetTravel} from '../dist/sheet-travel.js';
import {V,RAD} from '../dist/constants.js';
let checks=0;
for(const angle of[-150,-52,52,90,150])for(const size of[105,160])for(const type of['main','genoa','gennaker','spinnaker']){const s=newState();s.boatSpeed=5;s.windAngle=angle;s.genoaSize=size;s.foresail=type==='main'?'genoa':type;const measure=()=>{const p=sailPoint(type,0,1,s);if(type==='genoa'){const f=genoaLeadGeometry(s),root=sailPoint(type,0,0,s),c=V.sub(p,V.add(root,V.mul(f.axis,f.along)));return Math.atan2(V.dot(c,f.lateral),V.dot(c,f.aft))/RAD;}const root=type==='main'?sailPoint(type,0,0,s):flyingSheetTravel(type,s).tack,side=-(Math.sign(Math.sin(angle*RAD))||1),d=V.sub(p,root);return(type==='spinnaker'?Math.atan2(-d[2],side*d[0]):Math.atan2(side*d[0],-d[2]))/RAD;};s.controls[type].sheet=0;const free=measure();s.controls[type].sheet=100;const closed=measure();let last=free;for(let value=0;value<=100;value++){s.controls[type].sheet=value;const actual=measure(),expected=free+(closed-free)*value/100;assert.ok(Math.abs(actual-expected)<.06,`${type}/${angle}/${size}/${value}: useful travel is proportional (${actual}/${expected})`);assert.ok((closed-free)*(actual-last)>=-1e-6);last=actual;if(type==='genoa'){const l=genoaLeadGeometry(s);assert.ok(Math.abs(l.travelProgress-value/100)<1e-8);if(value===100)assert.ok(Math.abs(l.angle-l.closedAngle)<1e-9);}checks++;}}
console.log(`PASS: ${checks} measured clew angles over the entire 0–100% travel, all four sheets, both tacks and 105/160% headsails; exact loaded endpoints and no reversed/dead ranges.`);
