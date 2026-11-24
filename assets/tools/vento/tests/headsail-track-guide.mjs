// Guide: Headsail Track Travel & Sheeting Geometry (pp.1–3,5).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState} from '../dist/physics.js';
import {genoaRailDimensions,deckLayout,genoaCarPosition,genoaLeadGeometry} from '../dist/deck-layout.js';
import {controlSpec} from '../dist/control-spec.js';
import {headsailInhaulAllowed,headsailInfo} from '../dist/orc-sails.js';
const near=(a,b,eps=1e-7)=>assert.ok(Math.abs(a-b)<eps,`${a} ≠ ${b}`);
let count=0, zero=0;
for(const size of [80,90,95,105,115,130,145,160,185]){
 for(const wind of [5,13])for(const tack of [-55,55]){
  const s=newState();s.genoaSize=size;s.windSpeed=wind;s.windAngle=tack;
  const track=genoaRailDimensions(s),deck=deckLayout(s),overlap=headsailInfo(s).percent;
  assert.ok(track.trackLength>.3&&track.trackLength<4.8,'realistic travel');
  assert.ok(track.aft<track.neutral&&track.forward>track.neutral,'luff bisector lead on track');
  near(track.trackLength,track.forward-track.aft);
  near(track.trackLength,controlSpec('genoa','car',s).max);
  near(track.trackX,deck.genoaTrackX);
  assert.ok(track.leadAngle>=7&&track.leadAngle<=12);
  assert.ok(track.forward<=4.71&&track.aft>=-4.71,'track stays within modeled foredeck');
  // Diagnostic point for selected sail (all dimensions are internal 10m scale).
  assert.ok(Math.abs(track.neutral-track.clewZ)<1.5);
  if(overlap>=95&&overlap<=105)assert.ok(track.trackLength>=.9&&track.trackLength<=1.5,'#3 jib guide 0.9-1.5 m');
  if(overlap>=130&&overlap<=150)assert.ok(track.trackLength>=1.8&&track.trackLength<=3.0,'reefable genoa guide 1.8-3 m');
  for(const p of [0,20,50,75,100]){
   s.controls.genoa.car=p;
   const pos=genoaCarPosition(s);near(pos[2],track.aft+track.trackLength*p/100);
   for(const sheet of [0,45,100,120]){
    s.controls.genoa.sheet=sheet;
    const v=genoaLeadGeometry(s);
    assert.ok(Number.isFinite(v.sheetTension)&&Number.isFinite(v.angle)&&Number.isFinite(v.sheetLength));
    if(sheet===0){near(v.sheetTension,0,1e-9);zero++;}
    count++;
   }
  }
  assert.equal(headsailInhaulAllowed(s),overlap<=105.000001);
 }
}
// Foot and track reference are fixed with wind / transient sail load.
for(const size of[80,105,145,160]){
 const s=newState();s.genoaSize=size;const before=genoaRailDimensions(s);
 Object.assign(s,{windAngle:-120,windSpeed:30,boatSpeed:9});s.controls.genoa.sheet=120;s.controls.genoa.car=100;s.controls.rig.forestay=0;
 const after=genoaRailDimensions(s);
 for(const key of['aft','forward','neutral','trackLength','trackX'])near(before[key],after[key]);
}
// Edited dimensions must change the neutral lead, unlike a fixed generic rail.
const modified=newState(),initial=genoaRailDimensions(modified);modified.sailDesigns.genoa.HLP*=1.20;
const changed=genoaRailDimensions(modified);
assert.ok(Math.abs(changed.neutral-initial.neutral)>.1&&Math.abs(changed.trackX-initial.trackX)>.05);
// Certificate data may be incomplete. The calculator must stay finite.
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
let catalog=0;
for(const b of boats){const s=newState(b),r=genoaRailDimensions(s);assert.ok(Number.isFinite(r.trackLength)&&r.trackLength>0);assert.ok(r.forward>r.aft);assert.ok(r.aft>=-4.71&&r.forward<=4.71);catalog++;}
console.log(`PASS: ${count} car + sheet states (${zero} fully slack), ${catalog} certificate geometries, guide travel ranges, steady lead, edits and inhauler.`);
