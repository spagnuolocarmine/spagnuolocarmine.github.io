import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../dist/vendor/three.module.min.js';
import {newState} from '../dist/physics.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {sailDimensions,spinPoleRig,rigDimensions} from '../dist/orc-sails.js';
import {mastPoint,forestayPoint} from '../dist/standing-rig.js';
import {rigPlan} from '../dist/rig-plan.js';
import {controlSpec,controlToValue,valueToControl} from '../dist/control-spec.js';
import {V} from '../dist/constants.js';
const catalog=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats,boats=[undefined,catalog.find(b=>b.name==='NEXT GEN'),catalog.reduce((a,b)=>a.length>b.length?a:b),catalog.reduce((a,b)=>a.length<b.length?a:b),...['spinnaker','gennaker'].flatMap(type=>{const valid=catalog.filter(b=>b.areas[type]>0),order=[...valid].sort((a,b)=>a.areas[type]/a.length**2-b.areas[type]/b.length**2);return[order[0],order.at(-1)];})];
const length=(fn,N=700)=>{let last=fn(0),sum=0;for(let i=1;i<=N;i++){const next=fn(i/N);sum+=V.length(V.sub(next,last));last=next;}return sum;};let cuts=0,contacts=0;
for(const boat of boats)for(const type of['spinnaker','gennaker'])for(const angle of[-150,120,150])for(const value of[0,50,100]){
 const s=newState(boat);s.foresail=type;s.windAngle=angle;s.boatSpeed=6;s.controls[type].sheet=value;s.controls.spinnaker.poleLift=value;const k=s.boat.length/10,d=sailDimensions(type,s);
 const metrics=[length(v=>sailPoint(type,v,0,s))*k,length(v=>sailPoint(type,v,1,s))*k,length(u=>sailPoint(type,0,u,s))*k,length(u=>sailPoint(type,.5,u,s))*k];
 for(const[i,key]of['SLU','SLE','SFL','SHW'].entries())assert.ok(Math.abs(metrics[i]/d[key]-1)<.002,`${s.boat.name}/${type}/${angle}/${value}/${key}: actual 3D measure ${metrics[i]} vs ${d[key]}`);
 const head=sailPoint(type,1,0,s);for(const u of[0,.25,.5,.75,1])assert.ok(V.length(V.sub(sailPoint(type,1,u,s),head))<1e-10,'one shared head, without shearing the cloth');cuts++;
 // Intersect the actual triangular cloth with the forestay below the shared head.
 {const pos=[],idx=[],nu=36,nv=44;for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++)pos.push(...sailPoint(type,j/nv,i/nu,s));for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+nu+1;idx.push(a,b,a+1,a+1,b,b+1);}const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geometry.setIndex(idx);const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld(true);const ray=new THREE.Raycaster();for(let j=1;j<=48;j++){const pa=forestayPoint((j-1)/48,s),pb=forestayPoint(j/48,s);if(pb[1]>head[1]-.3)continue;const a=new THREE.Vector3(...pa),b=new THREE.Vector3(...pb);ray.set(a,b.clone().sub(a).normalize());ray.near=.001;ray.far=a.distanceTo(b)-.001;const hits=ray.intersectObject(mesh);assert.equal(hits.length,0,`${s.boat.name}/${type}/${angle}/${value}: flying cloth must clear the forestay ${JSON.stringify(hits[0]?.point.toArray())}`);contacts++;}geometry.dispose();mesh.material.dispose();}
}
for(const boat of boats){const s=newState(boat);s.foresail='spinnaker';let last=-Infinity;for(let value=0;value<=100;value+=5){s.controls.spinnaker.poleLift=value;const pole=spinPoleRig(s);assert.ok(pole.tip[1]>last);last=pole.tip[1];assert.ok(Math.abs(V.length(V.sub(pole.tip,pole.root))-pole.length)<1e-9,'the rigid pole keeps SPL while the tip rises');assert.ok(pole.tip[2]>pole.root[2],'brace stops before sweeping the pole behind the mast');const attachment=mastPoint((pole.root[1]-1.2)/rigDimensions(s).ISP,s);assert.ok(V.length(V.sub(attachment,pole.root))<1e-9,'pole heel follows the loaded mast');assert.ok(pole.root.every(Number.isFinite));}
 const before=spinPoleRig(s).tip;s.controls.spinnaker.barberBrace=100;assert.deepEqual(spinPoleRig(s).tip,before,'barber is independent of the new pole-height control');const p=controlSpec('spinnaker','poleLift',s);for(const value of[0,50,100]){const shown=controlToValue('spinnaker','poleLift',value,s);assert.ok(shown>=p.min&&shown<=p.max);assert.ok(Math.abs(valueToControl('spinnaker','poleLift',shown,s)-value)<.03);}const lines=rigPlan(s).filter(l=>l.id==='spinnaker.poleLift');assert.equal(lines.length,2);assert.ok(lines.every(l=>l.active));
}
console.log(`PASS: ${cuts} directly measured 3D cuts preserve both edge arcs, foot and half-girth; ${contacts} forestay/cloth intersections; fixed-length elevated pole, independent barbers, two linked lift/downhaul lines and metre-based single slider.`);
