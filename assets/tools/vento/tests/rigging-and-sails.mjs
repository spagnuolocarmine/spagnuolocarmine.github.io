import assert from 'node:assert/strict';
import {newState} from '../dist/physics.js';
import {sailPoint,mainContactAngle} from '../dist/sail-geometry.js';
import {shroudAtHeight,windSide,rigResponse} from '../dist/standing-rig.js';
import {sailDimensions,SAIL_AREA_LIMITS,measureFlat,MAIN_GIRTHS,RIG,spinPolePoint} from '../dist/orc-sails.js';
import {BOAT} from '../dist/constants.js';
let checks=0;
for(const angle of [-150,-52,52,150])for(const wind of [6,16,25])for(const tension of [0,50,100])for(const traveler of [0,50,100]){const s=newState();s.windSpeed=wind;s.windAngle=angle;s.controls.main.sheet=0;s.controls.main.vang=0;s.controls.main.outhaul=0;s.controls.main.traveler=traveler;for(const k of Object.keys(s.controls.rig))s.controls.rig[k]=tension;const side=windSide(s);
 for(let j=0;j<=40;j++){const v=j/40;let prev=sailPoint('main',v,0,s);for(let i=1;i<=60;i++){const p=sailPoint('main',v,i/60,s),wire=shroudAtHeight(s,side,p[1]),a=side*(prev[0]-wire[0]),b=side*(p[0]-wire[0]);if(a<=0&&b>=0){const t=-a/(b-a),z=prev[2]+(p[2]-prev[2])*t;assert.ok(z<wire[2]-.015,`mainsail must stay aft of shroud: ${wind}/${tension}/${traveler}/${v}`);checks++;}prev=p;}}
 assert.ok(mainContactAngle(0,s)<95);
}
for(const type of ['spinnaker','gennaker'])for(const area of [SAIL_AREA_LIMITS[type].min,SAIL_AREA_LIMITS[type].reference,SAIL_AREA_LIMITS[type].max]){const s=newState();s.sailAreas[type]=area;const d=sailDimensions(type,s);assert.ok(Math.abs(d.area-area)<1e-5);assert.ok(d.ratio>=.75,'ORC spinnaker mid-girth / foot minimum');assert.ok(d.SLU>0&&d.SLE>0);if(type==='spinnaker')assert.ok(Math.abs(d.SLU-d.SLE)<1e-10);for(let v=0;v<=1;v+=.05)for(let u=0;u<=1;u+=.05){const p=sailPoint(type,v,u,s);assert.ok(p.every(Number.isFinite));assert.ok(p[1]>0,'sail stays above water');}}
const area=RIG.P/8*(MAIN_GIRTHS.E+2*MAIN_GIRTHS.MQW+2*MAIN_GIRTHS.MHW+1.5*MAIN_GIRTHS.MTW+MAIN_GIRTHS.MUW+.5*MAIN_GIRTHS.MHB);assert.ok(Math.abs(area-BOAT.mainArea)<1e-10);
const a=newState(),b=newState();a.controls.spinnaker.brace=0;b.controls.spinnaker.brace=100;assert.ok(spinPolePoint(a)[2]>spinPolePoint(b)[2]+2,'advanced pole lies further forward than squared pole');assert.ok(Math.abs(spinPolePoint(b)[0])>Math.abs(spinPolePoint(a)[0]));
a.controls.rig.shrouds=0;b.controls.rig.shrouds=100;assert.ok(rigResponse(a).tipDeflection>rigResponse(b).tipDeflection);a.controls.rig.forestay=0;b.controls.rig.forestay=100;assert.ok(rigResponse(a).sag>rigResponse(b).sag);
console.log(`OK: ${checks} main/stay crossing clearances; ORC area and girth rules; variable-size flying sails; pole direction; load/tension response.`);
