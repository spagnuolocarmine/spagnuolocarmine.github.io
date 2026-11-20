import assert from 'node:assert/strict';
import {newState} from '../dist/physics.js';
import {newSailProfile,profileAt,PROFILE_FIELDS,profileWarnings} from '../dist/sail-profiles.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {aeroForces} from '../dist/aero.js';
import {standingRigLayout} from '../dist/rig-layout.js';
let fields=0;
for(const type of ['main','genoa','spinnaker','gennaker']){
 const s=newState();s.boatSpeed=6;s.windAngle=type==='spinnaker'?155:type==='gennaker'?130:52;s.foresail=type==='main'?'genoa':type;s.sailProfiles[type]=newSailProfile(type);s.sailProfiles[type].enabled=true;const original=structuredClone(s.boat),hardware=standingRigLayout(s),sample=()=>[.12,.5,.78].flatMap(h=>[.15,.4,.8,1].flatMap(u=>sailPoint(type,h,u,s)));
 for(const [field]of PROFILE_FIELDS){const index=field==='footRound'?0:2,p=s.sailProfiles[type],before=sample(),value=p.stations[index][field];p.stations[index][field]+=field==='draft'?10:field==='entry'||field==='exit'?12:field==='luffRound'||field==='broadseam'||field==='footRound'?2:field==='chord'?20:field==='hook'?8:field==='twist'?8:5;p.revision++;const after=sample();assert.ok(after.every(Number.isFinite));assert.ok(after.some((x,i)=>Math.abs(x-before[i])>1e-7),`${type}.${field} must change the actual loaded geometry`);p.stations[index][field]=value;p.revision++;fields++;}
 s.sailProfiles[type].stations[2].depth+=5;s.sailProfiles[type].revision++;const m=aeroForces(s,6);assert.ok([m.cl,m.cd,m.usefulDrive,m.heelingMoment].every(Number.isFinite));assert.deepEqual(s.boat,original,'exploration never overwrites the certificate data');assert.deepEqual(standingRigLayout(s),hardware,'mould edits never move rig hardware');assert.equal(profileAt(type,.5,s).depth,s.sailProfiles[type].stations[2].depth);
 s.sailProfiles[type].stations[2].draft=83;s.sailProfiles[type].revision++;assert.ok(profileWarnings(type,s).includes(.5),'unusual profiles remain possible but are flagged');
}
const s=newState();s.sailProfiles.main=newSailProfile('main');s.sailProfiles.main.enabled=true;const ratio=s.sailProfiles.main.stations[2].h;s.sailDesigns.main.P*=1.2;s.sailDesigns.main.exploratory=true;assert.equal(profileAt('main',ratio,s).h,.5);assert.ok(sailPoint('main',1,0,s)[1]>15,'normalized sections follow changes of luff length');
console.log(`PASS: ${fields} real geometry responses across four sail families; local interpolation, pressure/moment feedback, proportional section heights, free unusual profiles and immutable boat/rig data.`);
