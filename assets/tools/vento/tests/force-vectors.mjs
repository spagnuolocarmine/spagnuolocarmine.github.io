import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.min.js';
import {newState,evaluate} from '../dist/physics.js';
import {buildForceDiagram,forceApplicationPoint} from '../dist/force-data.js';
import {ForceView} from '../dist/force-view.js';
import {V} from '../dist/constants.js';
for(const type of ['genoa','spinnaker','gennaker','none'])for(const angle of [45,140,175]){
 const s=newState();s.foresail=type;s.windAngle=angle;const m=evaluate(s,6),diagram=buildForceDiagram(s,m);assert.ok(diagram.items.every(item=>item.origin.every(Number.isFinite)&&(!item.vector||item.vector.every(Number.isFinite))));
 for(const field of m.sails){const item=diagram.items.find(x=>x.id==='air-'+field.type);assert.deepEqual(item.vector,field.force);const torque=V.cross(item.origin,field.force),residual=V.sub(field.moment,torque);assert.ok(V.length(V.cross(residual,field.force))<1e-5,'application point reproduces the component of moment represented by a resultant force');}
 assert.ok(diagram.centres.some(x=>x.id==='cg')&&diagram.centres.some(x=>x.id==='cb'));assert.ok(diagram.items.filter(x=>x.kind==='moment').every(x=>x.unit==='N·m'));assert.ok(Math.abs(diagram.forceBalance[0])<1e-8&&Math.abs(diagram.forceBalance[1])<1e-8,'quasi-static lateral and vertical reactions balance');
}
const labels=[];globalThis.document={createElement:()=>({style:{setProperty(){}},dataset:{},remove(){},offsetWidth:190})};
const s=newState();s.forces=true;s.forceGroups.sails=s.forceGroups.hull=true;const boat=new THREE.Group(),scene=new THREE.Scene();scene.add(boat);const camera=new THREE.PerspectiveCamera(39,1.6,.03,400);camera.position.set(-22,13,20);camera.lookAt(0,6,0);camera.updateMatrixWorld();const owner={boat,scene,camera,width:1000,height:700,canvas:{parentElement:{appendChild(e){labels.push(e);}}}},view=new ForceView(owner);let m=evaluate(s,6);view.update(s,m);assert.ok(view.objects.get('air-main').visible);const main=view.objects.get('air-main');s.controls.main.sheet=20;m=evaluate(s,6);view.update(s,m);assert.equal(view.objects.get('air-main'),main,'live force updates reuse their graphics');s.main=false;m=evaluate(s,6);view.update(s,m);assert.equal(view.objects.get('air-main').visible,false,'lowered sails leave no stale force arrow');s.forces=false;view.update(s,m);assert.equal(view.group.visible,false);assert.ok([...view.labels.values()].every(x=>x.hidden));view.clear();
console.log('PASS: force/moment resultants, decompositions, quasi-static reactions, centres and finite vectors across plans; real Three.js arrows update/reuse/hide correctly without a WebGL context.');
