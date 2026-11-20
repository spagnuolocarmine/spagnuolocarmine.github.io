import assert from 'node:assert/strict';
import {newState,evaluate} from '../dist/physics.js';
import {buildWindPaths,sampleWindPath} from '../dist/wind-particles.js';
import {windLayout} from '../dist/wind-settings.js';
import {telltaleRibbon} from '../dist/telltales.js';
import {sailPoint} from '../dist/sail-geometry.js';
let count=0;
for(const [angle,sail]of [[45,'genoa'],[-52,'genoa'],[140,'gennaker'],[175,'spinnaker']]){
 const s=newState();s.windAngle=angle;s.foresail=sail;s.boatSpeed=6;const m=evaluate(s,6),paths=buildWindPaths(s,m,12);
 assert.equal(paths.length,12);assert.ok(paths.filter(p=>!p.ambient).length>=8);assert.ok(paths.some(p=>p.type==='main'));assert.ok(paths.some(p=>p.type===sail));for(const path of paths){assert.ok(path.length>10&&path.points.every(p=>p.every(Number.isFinite)));const flow=[-Math.sin(m.awa*Math.PI/180),0,-Math.cos(m.awa*Math.PI/180)],head=path.points[0],next=path.points[1];assert.ok(flow.reduce((n,v,i)=>n+v*(next[i]-head[i]),0)>0,'particles enter from the correct wind direction');for(let j=0;j<30;j++){const p=sampleWindPath(path,path.length*j/30);assert.ok(p.point.every(Number.isFinite));assert.ok(p.turbulence>=0&&p.turbulence<=1);count++;}}
 const changed=structuredClone(s);changed.controls.main.sheet=0;const other=buildWindPaths(changed,evaluate(changed,6),12);assert.notDeepEqual(paths.find(p=>p.type==='main').points,other.find(p=>p.type==='main').points,'airflow follows the changed sail surface');
 for(const density of [.5,4]){const layout=windLayout(density);assert.equal(buildWindPaths(s,m,layout.streams).length,layout.streams);assert.equal(layout.particles,layout.streams*layout.perStream);}
}
const s=newState();s.boatSpeed=6;const field=evaluate(s,6).sails.find(f=>f.type==='main'),r=telltaleRibbon('main',s,field,.47,1,1),leech=sailPoint('main',.47,1,s);assert.ok(Math.hypot(...r.centers.at(-1).map((v,i)=>v-leech[i]))>.15,'mainsail telltales extend beyond the leech');assert.ok(r.centers.length===12&&r.positions.length===72);
console.log(`PASS: ${count} streamline samples across all sails, both tacks, correct incoming direction, trim-responsive paths, adjustable density and short free leech telltales.`);
