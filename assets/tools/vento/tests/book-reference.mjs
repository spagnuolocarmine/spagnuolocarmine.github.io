import assert from 'node:assert/strict';
import {newState,sailArea} from '../dist/physics.js';
import {aeroForces} from '../dist/aero.js';
import {sailFlowAtHeight} from '../dist/sail-flow.js';
import {sailPoint,shapeSummary,mainBoomPoint} from '../dist/sail-geometry.js';
import {rigResponse} from '../dist/standing-rig.js';
import {standingRigLayout} from '../dist/rig-layout.js';
import {autoTensionRange} from '../dist/trim-response.js';
import {setControlEnabled} from '../dist/control-state.js';
import {sheetLength} from '../dist/fixed-sheets.js';
import {telltaleLocations,telltaleStatus,telltaleRibbon} from '../dist/telltales.js';
import {V} from '../dist/constants.js';
const base=()=>Object.assign(newState(),{boatSpeed:6,windAngle:52});
const physical=(s,m)=>({...s,rigLoads:m.rigLoads,controls:Object.fromEntries(Object.entries(s.controls).map(([type,c])=>[type,{...c,...(m.effectiveSheets[type]===undefined?{}:{sheet:m.effectiveSheets[type]})}]))});
const s=base(),low=sailFlowAtHeight(s,2),high=sailFlowAtHeight(s,14);
assert.ok(high.tws>low.tws&&high.awa>low.awa,'wind shear changes both intensity and apparent direction');
for(const vang of [10,90]){s.controls.main.vang=vang;s.controls.main.sheet=10;const open=mainBoomPoint(1,s)[1],openTwist=shapeSummary('main',s).twist;s.controls.main.sheet=90;assert.ok(mainBoomPoint(1,s)[1]<open-.005,'hauling lowers the boom');assert.ok(shapeSummary('main',s).twist<openTwist,'hauling closes the leech, including close to rig contact');}
s.controls.main.sheet=20;s.controls.main.vang=0;const loose=mainBoomPoint(1,s)[1];s.controls.main.vang=100;assert.ok(mainBoomPoint(1,s)[1]<loose-.1,'vang restrains vertical boom lift');
const spi=base();spi.windAngle=150;spi.foresail='spinnaker';const footDepth=()=>{const a=sailPoint('spinnaker',0,0,spi),b=sailPoint('spinnaker',0,1,spi),chord=V.sub(b,a),L=V.length(chord);return Math.max(...Array.from({length:81},(_,i)=>V.length(V.cross(V.sub(sailPoint('spinnaker',0,i/80,spi),a),chord))/L**2));};spi.controls.spinnaker.sheet=20;const shallow=footDepth();spi.controls.spinnaker.sheet=80;assert.ok(footDepth()>shallow+.01,'hauling the filled S2 closes and deepens its foot');
const jib=base();jib.genoaSize=105;jib.controls.genoa.sheet=0;const free=aeroForces(jib,6);jib.controls.genoa.sheet=100;const tight=aeroForces(jib,6);assert.ok(tight.rigLoads.forestay>free.rigLoads.forestay+50,'pressure forces feed rig load');assert.ok(rigResponse(physical(jib,tight)).sag>rigResponse(physical(jib,free)).sag+.005,'forestay deforms under the actual changed load');
const run=base();run.windAngle=180;run.genoaSize=160;run.controls.main.sheet=0;run.controls.genoa.sheet=70;run.main=false;const alone=aeroForces(run,6).sails[0];run.main=true;const covered=aeroForces(run,6).sails.find(f=>f.type==='genoa');assert.ok(covered.force[2]<alone.force[2]*.85,'hoisted main blankets the genoa on a run');
const up=base();const both=aeroForces(up,6);up.foresail='none';const mainAlone=aeroForces(up,6).sails[0];assert.ok(Math.abs(both.sails[0].lift-mainAlone.lift)>1,'headsail changes main inflow as well as rig load');
const hardware=base(),layout=standingRigLayout(hardware);hardware.genoaSize=160;hardware.sailDesigns.genoa.HLP*=1.4;assert.deepEqual(standingRigLayout(hardware),layout,'a sail edit cannot move hardware');
for(const type of ['main','genoa','spinnaker','gennaker']){const p=base();p.foresail=type==='main'?'genoa':type;p.windAngle=type==='spinnaker'?155:type==='gennaker'?125:65;p.controls[type].sheet=55;setControlEnabled(p,type,'sheet',false);const length=p.fixedSheetLengths[type],raw=p.controls[type].sheet;p.windAngle+=10;const m=aeroForces(p,6),loaded=physical(p,m);assert.equal(p.controls[type].sheet,raw);assert.ok(Math.abs(sheetLength(type,loaded)-length)<.012,`${type}: locked rope preserves length where reachable`);}
const reef=base();const fullArea=sailArea('main',reef),fullHeight=sailPoint('main',1,0,reef)[1],boomLength=V.length(V.sub(mainBoomPoint(1,reef),mainBoomPoint(0,reef)));reef.reef=2;assert.ok(sailArea('main',reef)<fullArea*.6);assert.ok(sailPoint('main',1,0,reef)[1]<fullHeight-3);assert.ok(Math.abs(V.length(V.sub(mainBoomPoint(1,reef),mainBoomPoint(0,reef)))-boomLength)<1e-9);
const m=aeroForces(spi,6),loaded=physical(spi,m);for(const field of m.sails)for(const location of telltaleLocations(field.type)){const status=telltaleStatus(field.type,loaded,field,location.h,location.side,undefined,location),ribbon=telltaleRibbon(field.type,loaded,field,location.h,location.side,1,{location});assert.equal(status.mode,ribbon.meanMode);assert.ok(ribbon.positions.every(Number.isFinite));}assert.equal(telltaleLocations('main')[0].u,1);assert.ok(telltaleLocations('spinnaker').some(x=>x.u===.9));
for(const cat of ['main','genoa','spinnaker','gennaker','rig']){const key=cat==='rig'?'shrouds':'halyard',range=autoTensionRange(cat,key,30,150);assert.ok(range[0]<100&&range[1]>range[0],'no universal all-at-maximum rule');}
assert.ok(autoTensionRange('rig','backstay',20,175)[0]<autoTensionRange('rig','backstay',20,45)[0]);assert.deepEqual(autoTensionRange('main','battens',8),autoTensionRange('main','battens',30));
console.log('PASS: book-derived causal checks for main/boom/vang, S2 sheet, vertical wind, coupled sail/rig loads, genoa blanketing, fixed hardware, four locked rope lengths, reef area/height and unchanged boom, local visible telltales and course-dependent gradual setup.');
