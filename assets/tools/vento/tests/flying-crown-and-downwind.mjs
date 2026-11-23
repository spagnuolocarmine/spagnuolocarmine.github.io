import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState,evaluate,polarSpeed} from '../dist/physics.js';
import {flyingSurface} from '../dist/flying-surface.js';
import {flyingProfile} from '../dist/flying-profile.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {sailDimensions} from '../dist/orc-sails.js';
import {V} from '../dist/constants.js';
import {hasSail} from '../dist/boats.js';
const allBoats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
const boats=[undefined,allBoats.find(b=>b.name==='NEXT GEN')].filter(Boolean);
const length=(fn,N=360)=>{let d=0,last=fn(0);for(let i=1;i<=N;i++){const p=fn(i/N);d+=V.length(V.sub(p,last));last=p;}return d;};
const sectionDepth=(type,v,s)=>{const a=sailPoint(type,v,0,s),b=sailPoint(type,v,1,s),m=sailPoint(type,v,.5,s),chord=V.sub(b,a);return V.length(V.cross(V.sub(m,a),chord))/Math.max(1e-9,V.dot(chord,chord));};
for(const boat of boats)for(const type of ['spinnaker','gennaker'])for(const angle of [120,150,180]){const s=newState(boat);s.foresail=type;s.windAngle=angle;s.boatSpeed=5;const f=flyingSurface(type,s,flyingProfile(type,s));const d=sailDimensions(type,s),scale=s.boat.length/10;
 assert.ok(sectionDepth(type,.85,s)> (type==='spinnaker'?.15:.1),`${type} upper shoulder not flat`);
 assert.ok(sectionDepth(type,.95,s)> (type==='spinnaker'?.13:.085),`${type} crown retains fullness`);
 assert.ok(sectionDepth('spinnaker',.9,{...s,foresail:'spinnaker'})>sectionDepth('gennaker',.9,{...s,foresail:'gennaker'}),'S2 is fuller than A2 near the head');
 for(const [index,measure] of [['SLU',v=>sailPoint(type,v,0,s)],['SLE',v=>sailPoint(type,v,1,s)],['SFL',u=>sailPoint(type,0,u,s)],['SHW',u=>sailPoint(type,.5,u,s)]]){const actual=length(measure)*scale;assert.ok(Math.abs(actual/d[index]-1)<.004,`${type}/${angle} keeps ${index}: ${actual} vs ${d[index]}`);}
 for(const u of [0,.2,.8,1])assert.ok(V.length(V.sub(f.head,sailPoint(type,1,u,s)))<1e-8,'common real halyard head');
}
for(const boat of boats)for(const angle of [150,180]){
 const s=newState(boat);s.windSpeed=12;s.windAngle=angle;s.foresail='none';const target=polarSpeed(s.windSpeed,s.windAngle,s);
 const solo=evaluate(s,target,'coarse');s.foresail='spinnaker';const spin=hasSail('spinnaker',s)?evaluate(s,target,'coarse'):null;s.foresail='gennaker';const gen=hasSail('gennaker',s)?evaluate(s,target,'coarse'):null;
 assert.ok([spin,gen].some(m=>m&&solo.usefulDrive<m.usefulDrive),`${boat?.name||'generic'} ${angle}: an available flying sail adds drive over main only`);
 assert.ok(solo.targetSpeed/target<.75,`${boat?.name||'generic'} ${angle}: main only is significantly short of full certificate speed`);
 assert.ok([spin,gen].filter(Boolean).every(m=>solo.polarTarget===m.polarTarget),'unaltered reference ORC polar');
 if(angle===180&&gen)assert.ok(gen.sails.find(x=>x.type==='gennaker').flyingSupport<.5,'A2 loses deep-downwind aerodynamic support');
}
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');assert.ok(html.includes('id="responseSpeed"')&&html.includes('min="-20" max="20"')&&html.includes('value="0"'));
console.log('PASS: rounded flying crowns, certified edges/girth, halyard head, original polar preserved, main-only deficit, deep-running gennaker recovery, visual response slider.');
