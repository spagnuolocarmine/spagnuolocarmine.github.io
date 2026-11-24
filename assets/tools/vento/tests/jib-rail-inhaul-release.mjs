import assert from 'node:assert/strict';
import {newState} from '../dist/physics.js';
import {genoaRailDimensions,deckLayout,genoaLeadGeometry,genoaCarPosition} from '../dist/deck-layout.js';
import {headsailInhaulAllowed,headsailInfo} from '../dist/orc-sails.js';
import {controlSpec,controlToValue,valueToControl} from '../dist/control-spec.js';
import {sailShape} from '../dist/sail-geometry.js';
import {rigPlan} from '../dist/rig-plan.js';
import {restoreSessionState,snapshotState} from '../dist/session-store.js';
const close=(a,b,tol=1e-7)=>assert.ok(Math.abs(a-b)<=tol, `${a} != ${b}`);
let checked=0, footChecks=0;
for(const size of [80,95,105,115,130,160,185])for(const wind of [6,14])for(const angle of [-55,55]){
 const s=newState();Object.assign(s,{genoaSize:size,windSpeed:wind,windAngle:angle,boatSpeed:5});
 const rail=genoaRailDimensions(s),d=deckLayout(s),spec=controlSpec('genoa','car',s);
 assert.ok(rail.neutral>=rail.aft-1e-8&&rail.neutral<=rail.forward+1e-8);assert.ok(rail.forward>rail.aft);
 close(d.genoaTrackForward-d.genoaTrackAft,rail.trackLength);
 close(spec.max,rail.trackLength*(s.boat.length/10),1e-5);
 let easedReference=null;
 for(const car of [0,25,50,75,100]){
  s.controls.genoa.car=car;
  const pos=genoaCarPosition(s);close(pos[2],rail.aft+rail.trackLength*car/100);
  close(controlToValue('genoa','car',car,s),spec.max*car/100);
  close(valueToControl('genoa','car',spec.max*car/100,s),car);
  for(const sheet of [0,20,50,75,100,120]){
   s.controls.genoa.sheet=sheet;
   const g=genoaLeadGeometry(s);assert.ok(Number.isFinite(g.sheetTension));
   assert.ok(Number.isFinite(g.sheetLength));
   if(sheet===0){close(g.sheetTension,0,1e-10);close(g.sheetForce.reduce((sum,n)=>sum+n*n,0),0,1e-10);if(easedReference){close(g.angle,easedReference.angle,1e-7);g.clew.forEach((x,i)=>close(x,easedReference.clew[i],1e-7));}else easedReference={angle:g.angle,clew:g.clew};}
   else assert.ok(g.sheetTension>0, 'sheet load should be nonzero when hauled');
   if(car===0 && sheet>=100){const shape=sailShape('genoa',s,0);assert.ok(shape.camber<.001,`foot at full haul ${size} ${wind} ${angle}: ${shape.camber}`);footChecks++;}
   checked++;
  }
 }
 // Small headsails alone may use the inhauler, without any outboard direction.
 const allowed=headsailInhaulAllowed(s);s.controls.genoa.sheet=70;s.controls.genoa.car=35;
 const g0=genoaLeadGeometry(s);s.controls.genoa.barber=100;const g100=genoaLeadGeometry(s);
 if(allowed){assert.ok(Math.abs(g100.ring[0])<Math.abs(g0.ring[0])-1e-5);assert.ok(g100.barber>0);}
 else{close(g100.ring[0],g0.ring[0]);close(g100.barber,0);assert.ok(!rigPlan(s).find(x=>x.id==='genoa.barber'&&x.active));}
}
// LP/J threshold uses measured overlap, not the size selector label.
let below=null,above=null;
for(let size=100;size<=120;size+=.05){let s=newState();s.genoaSize=size;const v=headsailInfo(s).percent;if(v<=105)below=s;if(v>105){above=s;break;}}
assert.ok(below&&above);assert.ok(headsailInhaulAllowed(below));assert.ok(!headsailInhaulAllowed(above));
// Editing the cut updates the full span immediately.
const fixedRail=newState(),stationary=genoaRailDimensions(fixedRail);
fixedRail.windSpeed=28;fixedRail.windAngle=-130;fixedRail.controls.genoa.sheet=0;fixedRail.controls.genoa.car=100;fixedRail.controls.rig.forestay=10;
close(genoaRailDimensions(fixedRail).footLength,stationary.footLength);close(genoaRailDimensions(fixedRail).clewZ,stationary.clewZ);
const edited=newState();const before=genoaRailDimensions(edited);edited.sailDesigns.genoa.HLP*=1.22;const after=genoaRailDimensions(edited);assert.ok(after.footLength>before.footLength*1.05);
// Legacy center=50 -> zero, old inward=0 -> 100. New format stays stable.
const old=newState();old.controls.genoa.barber=50;close(restoreSessionState(old).controls.genoa.barber,0);
old.controls.genoa.barber=0;close(restoreSessionState(old).controls.genoa.barber,100);
const fresh=newState();fresh.controls.genoa.barber=67;const saved=snapshotState(fresh);close(restoreSessionState(saved).controls.genoa.barber,67);
console.log(`PASS: ${checked} full guide-sized car/sheet/sail/wind checks; ${footChecks} fully flattened-foot cases, threshold, legacy migration, no-outboard barber and zero-tension sheet.`);
