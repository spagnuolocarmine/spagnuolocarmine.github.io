import assert from 'node:assert/strict';
import * as THREE from '../dist/vendor/three.module.min.js';
import {newState,evaluate} from '../dist/physics.js';
import {buildWindPaths} from '../dist/wind-particles.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {loadedForceState} from '../dist/force-data.js';
for(const [angle,type]of [[45,'genoa'],[-52,'genoa'],[140,'gennaker'],[175,'spinnaker']]){const s=newState();s.windAngle=angle;s.foresail=type;s.boatSpeed=6;const m=evaluate(s,6),loaded=loadedForceState(s,m),paths=buildWindPaths(s,m,12),meshes={};for(const f of m.sails){const N=28,M=38,positions=[],indices=[];for(let j=0;j<=M;j++)for(let i=0;i<=N;i++)positions.push(...sailPoint(f.type,j/M,i/N,loaded));for(let j=0;j<M;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i,b=a+N+1;indices.push(a,b,a+1,a+1,b,b+1);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);const mesh=new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));mesh.updateMatrixWorld();meshes[f.type]=mesh;}
 let hits=0;const samples=[];for(const p of paths.filter(p=>!p.ambient))for(let j=1;j<p.points.length;j++){const a=new THREE.Vector3(...p.points[j-1]),b=new THREE.Vector3(...p.points[j]),ray=new THREE.Raycaster(a,b.clone().sub(a).normalize(),.001,a.distanceTo(b)-.001);if(ray.intersectObjects(Object.values(meshes)).length){hits++;samples.push({sail:p.type,side:p.side,h:p.h,segment:j});}}assert.equal(hits,0,`${angle}/${type}: paths must not cross either sail (${JSON.stringify(samples)})`);for(const mesh of Object.values(meshes)){mesh.geometry.dispose();mesh.material.dispose();}}

console.log('PASS: incoming, attached and wake segments avoid both real sail meshes on both tacks and all three headsails.');
