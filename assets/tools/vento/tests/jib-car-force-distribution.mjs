// LA BARCA VELOCE, cap. 1, "Il carrello": aft lead loads foot;
// forward lead loads leech. Physical contact must not be simulated by
// forcing small sails through the lower shrouds.
import assert from 'node:assert/strict';
import {newState} from '../dist/physics.js';
import {genoaLeadGeometry,genoaUsableCarForward,deckLayout} from '../dist/deck-layout.js';
import {controlSpec} from '../dist/control-spec.js';
import {sailPoint,sailShape} from '../dist/sail-geometry.js';
import {shroudPath,headsailSide} from '../dist/standing-rig.js';
import {V,clamp} from '../dist/constants.js';
const pointSegmentDistance=(p,a,b)=>{const d=V.sub(b,a),f=clamp(V.dot(V.sub(p,a),d)/V.dot(d,d));return V.length(V.sub(p,V.add(a,V.mul(d,f))));};
function closestLowerShroud(s){const wire=shroudPath(s,headsailSide(s),60);let best=Infinity;for(let v=.002;v<=.32;v+=.006)for(let u=0;u<=1;u+=.025){const p=sailPoint('genoa',v,u,s);for(let j=1;j<wire.length;j++){if(wire[j][1]>7)continue;best=Math.min(best,pointSegmentDistance(p,wire[j-1],wire[j]));}}return best;}
let checked=0;
for(const size of[80,95,105,130,160,185])for(const wind of[8,20])for(const angle of[-52,52]){
 const s=newState();Object.assign(s,{genoaSize:size,windSpeed:wind,windAngle:angle,boatSpeed:5});s.controls.genoa.sheet=100;
 const d=deckLayout(s),spec=controlSpec('genoa','car',s);
 assert.ok(Math.abs(spec.max-(genoaUsableCarForward(s)-d.genoaTrackAft))<1e-8);
 let lastCar=-Infinity,lastRatio=-Infinity,lastTwist=Infinity,first=null,final=null;
 for(const car of[0,25,50,75,100]){
  s.controls.genoa.car=car;const g=genoaLeadGeometry(s),shape=sailShape('genoa',s,0);
  const ratio=g.leechPull/Math.max(.001,g.footPull);
  assert.ok(g.car[2]>lastCar+1e-8,`car advances: ${size}/${angle}/${wind}/${car}`);
  if(car<=50)assert.ok(ratio>lastRatio-.025,`toward-vertical as car advances from aft: ${size}/${angle}/${wind}/${car}: ${ratio} vs ${lastRatio}`);
  if(car===100)assert.ok(g.leechPull>0,`forward car still loads leech: ${size}/${angle}/${wind}`);
  assert.ok(shape.twist<=lastTwist+.05,`car forward closes leech/twist: ${size}/${angle}/${wind}/${car}`);
  // Manual rail extends a full foot ahead of the nominal clew by request;
  // AUTO imposes the separate safe down-and-aft constraint.
  assert.ok(g.car[2]<=d.genoaTrackForward+1e-7,`lead on rail: ${size}/${angle}/${wind}/${car}`);
  assert.equal(s.controls.genoa.twist,10,'user-defined static twist is never a car manoeuvre');
  assert.ok(g.footPull>=0&&g.leechPull>=0&&Number.isFinite(g.sheetTension));
  lastCar=g.car[2];lastRatio=ratio;lastTwist=shape.twist;first??={g,shape};final={g,shape};checked++;
 }
 assert.ok(final.g.leechPull/Math.max(.001,final.g.footPull)>first.g.leechPull/Math.max(.001,first.g.footPull)*1.25,`forward car changes pulling vector: ${size}/${angle}/${wind}`);
 assert.ok(final.shape.twist<first.shape.twist-4,`forward car reduces sail twist: ${size}/${angle}/${wind}`);
}
for(const windAngle of[-52,52]){
 const s=newState();s.genoaSize=160;s.windAngle=windAngle;s.windSpeed=8;s.boatSpeed=5;s.controls.genoa.car=0;s.controls.genoa.sheet=100;
 const large=closestLowerShroud(s),g=genoaLeadGeometry(s);
 assert.ok(large>.015&&large<.17,`large overlapping genoa reaches close to lowers but cannot penetrate: ${large}`);
 assert.ok(sailShape('genoa',s,0).camber<.0002,'aft car and fully hauled sheet straighten the foot');
 s.genoaSize=80;const small=closestLowerShroud(s);
 assert.ok(small>large+.40,'small jib is not artificially stretched onto the shrouds');
}
console.log(`PASS: ${checked} loaded car/angle/wind/headsail cases for sheet-vector components and twist; correct size-aware rail stop, 160% headsail approaching lowers, 80% jib clear, no static-twist mutation.`);
