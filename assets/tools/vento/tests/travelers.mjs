import assert from 'node:assert/strict';
import {newState} from '../dist/physics.js';
import {DECK,deckLayout,mainTravelerPosition,genoaCarPosition,genoaLeadGeometry,genoaUsableCarForward} from '../dist/deck-layout.js';
import {controlSpec,controlToValue,valueToControl,CONTROL_COLORS} from '../dist/control-spec.js';
import {rigPlan} from '../dist/rig-plan.js';
const s=newState();
for(const x of [-1.35,-1.349,-.123,0,.001,.438,1.349,1.35]){s.controls.main.traveler=valueToControl('main','traveler',x);assert.ok(Math.abs(mainTravelerPosition(s)[0]-x)<1e-12);assert.equal(mainTravelerPosition(s)[1],DECK.mainTrackY);assert.equal(mainTravelerPosition(s)[2],DECK.mainTrackZ);assert.ok(Math.abs(controlToValue('main','traveler',s.controls.main.traveler)-x)<1e-12);const sheet=rigPlan(s).find(x=>x.part==='main-sheet');assert.ok(Math.abs(sheet.points[1][0]-x)<1e-12,'sheet is attached to actual traveller position');}
const actualCarMax=genoaUsableCarForward(s)-DECK.genoaTrackAft;
for(const metres of [0,.001,.173,1.234,actualCarMax-.001,actualCarMax]){s.controls.genoa.car=valueToControl('genoa','car',metres,s);for(const side of [-1,1]){const p=genoaCarPosition(s,side);assert.equal(p[0],side*deckLayout(s).genoaTrackX);assert.ok(Math.abs(p[2]-(DECK.genoaTrackAft+metres))<1e-12);}const path=rigPlan(s).find(x=>x.part==='genoa-sheet');assert.ok(Math.abs(path.points[1][2]-genoaCarPosition(s)[2])<1e-12);}
s.controls.genoa.car=100;assert.equal(genoaCarPosition(s)[2],genoaUsableCarForward(s));assert.ok(DECK.genoaTrackForward>DECK.shroudZ);s.controls.genoa.car=0;assert.equal(genoaCarPosition(s)[2],DECK.genoaTrackAft);
assert.equal(controlSpec('main','traveler').step,.001);assert.equal(controlSpec('genoa','car').step,.001);assert.equal(valueToControl('main','traveler',99),100);assert.equal(valueToControl('genoa','car',-99),0);
const a=newState(),b=newState();a.controls.genoa.barber=0;b.controls.genoa.barber=100;assert.deepEqual(genoaCarPosition(a),genoaCarPosition(b),'barber changes sheet lead, not carriage position');assert.notDeepEqual(genoaLeadGeometry(a).ring,genoaLeadGeometry(b).ring);
for(const wind of [-52,52]){s.windAngle=wind;s.controls.main.traveler=valueToControl('main','traveler',.483);assert.ok(Math.abs(mainTravelerPosition(s)[0]-.483)<1e-12,'traveller stays at same boat coordinate on either tack');}
assert.equal(new Set(Object.values(CONTROL_COLORS)).size,26);for(const line of rigPlan(newState()))assert.ok(CONTROL_COLORS[line.id]);
console.log('OK: millimetre positioning, both travel end stops, cockpit width, coachroof/shroud limits, actual sheet attachments, barber separation and 26 unique colours.');
