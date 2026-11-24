import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState} from '../dist/physics.js';
import {sailPoint,mainBoomPoint,sailShape,BOOM_E_OVERHANG} from '../dist/sail-geometry.js';
import {rigDimensions} from '../dist/orc-sails.js';
import {newSailProfile} from '../dist/sail-profiles.js';
import {sailDesign} from '../dist/sail-measures.js';
import {aeroForces} from '../dist/aero.js';
const length=a=>Math.hypot(...a);
const dist=(a,b)=>length(a.map((n,i)=>n-b[i]));
const books=['La barca veloce, cap. 1 (tesabase)','La fisica in barca a vela, cap. 5 (concavità della vela)'];
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
const options=[newState(),...['NEXT GEN','IY 9.98'].map(name=>newState(boats.find(b=>b.name===name)))];
assert.equal(BOOM_E_OVERHANG,1.045);
let checks=0;
for(const base of options){
 for(const wind of [-145,55,120])for(const sheet of [10,90])for(const vang of [0,100]){
  const s=structuredClone(base);s.windAngle=wind;s.controls.main.sheet=sheet;s.controls.main.vang=vang;
  const expected=rigDimensions(s).E*BOOM_E_OVERHANG;
  const gaps=[],clews=[];
  for(const outhaul of [0,25,50,75,90,100]){
   s.controls.main.outhaul=outhaul;
   const tack=sailPoint('main',0,0,s),clew=sailPoint('main',0,1,s),end=mainBoomPoint(1,s);
   assert.ok(Math.abs(dist(mainBoomPoint(0,s),end)-expected)<1e-8,'boom length is 104.5% of unmodified rig E');
   const at=u=>mainBoomPoint(u/BOOM_E_OVERHANG,s);
   const gap=Math.max(...[.25,.5,.75].map(u=>dist(sailPoint('main',0,u,s),at(u))));
   gaps.push(gap);clews.push(dist(tack,clew));
   if(outhaul===100){
    assert.ok(Math.abs(dist(tack,clew)-rigDimensions(s).E)<1e-7,'fully tensioned clew reaches E');
    assert.ok(gap<.061,'entire fully tensioned main foot rides the top of the boom (at most 6.1 cm offset)');
    assert.ok(sailShape('main',s,0).camber<1e-8,'no fabric fullness survives at the fully tensioned foot');
   }
   checks++;
  }
  for(let i=1;i<gaps.length;i++){
   assert.ok(gaps[i]<gaps[i-1]-.002,'outhaul progressively brings main foot toward boom');
   assert.ok(clews[i]>clews[i-1]+.000001,`outhaul progressively hauls the clew outward: ${base.boat?.name||'lab'}/${wind}/${sheet}/${vang} i=${i} lengths ${clews}`);
  }
  assert.ok(gaps[0]-gaps.at(-1)>.30,'full outhaul has substantial visible travel');
 }
}
const custom=newState();custom.sailProfiles.main=newSailProfile('main');custom.sailProfiles.main.enabled=true;
for(const station of custom.sailProfiles.main.stations){station.depth=22;station.entry=32;station.exit=24;station.hook=12;station.footRound=5;}
custom.controls.main.outhaul=100;
assert.ok(sailShape('main',custom,0).camber===0,'outhaul can completely tension a custom-moulded foot');
for(let i=1;i<=19;i++){
 const u=i/20,where=mainBoomPoint(u/BOOM_E_OVERHANG,custom);
 assert.ok(dist(sailPoint('main',0,u,custom),where)<.061,'custom mould must not hold the foot off the boom');
}
const rigged=newState();rigged.controls.main.outhaul=100;const originalBoom=dist(mainBoomPoint(0,rigged),mainBoomPoint(1,rigged));rigged.sailDesigns.main.E*=.9;
assert.ok(Math.abs(dist(mainBoomPoint(0,rigged),mainBoomPoint(1,rigged))-originalBoom)<1e-9,'editing the sail cut does not change metal boom length');
rigged.reef=2;
assert.ok(Math.abs(dist(mainBoomPoint(0,rigged),mainBoomPoint(1,rigged))-originalBoom)<1e-9,'reefing does not resize hardware');
const loose=newState(),tight=newState();loose.controls.main.outhaul=0;tight.controls.main.outhaul=100;
const low=aeroForces(loose,6,'coarse'),high=aeroForces(tight,6,'coarse');
assert.ok(Math.abs(low.usefulDrive-high.usefulDrive)>.1,'outhaul physically changes aerodynamic force as well as fabric geometry');
assert.ok(Number.isFinite(high.usefulDrive));
console.log(`PASS: ${checks} main boom/foot samples across 3 hulls and multiple sheets, winds and vang settings; E preserved; customized mould, reef, and aerodynamic effect; references ${books.join('; ')}.`);
