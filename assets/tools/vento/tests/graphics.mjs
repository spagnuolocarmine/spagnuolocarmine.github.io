import assert from 'node:assert/strict';
import {SailingScene} from '../dist/scene.js';
import {newState,evaluate} from '../dist/physics.js';
import {aeroForces} from '../dist/aero.js';
import {referenceKey,controlTargetKey} from '../dist/trim-optimizer.js';
import {sailPoint} from '../dist/sail-geometry.js';
import {graphicsSettings,GRAPHICS_PROFILES} from '../dist/graphics-settings.js';
import {snapshotState,restoreSessionState} from '../dist/session-store.js';
const ctx=new Proxy({},{get:(_,k)=>k==='measureText'?()=>({width:100}):()=>{}});
globalThis.document={addEventListener(){},removeEventListener(){},getElementById(){return null;},createElement(){return{width:256,height:256,getContext:()=>ctx};}};
globalThis.devicePixelRatio=2;globalThis.ResizeObserver=class{observe(){}disconnect(){}};
const canvas={style:{},addEventListener(){},removeEventListener(){},getRootNode:()=>document,clientWidth:1000,clientHeight:700,parentElement:{getBoundingClientRect:()=>({width:1000,height:700})},getBoundingClientRect:()=>({left:0,top:0,width:1000,height:700})};
const s=newState();s.boatSpeed=6;let m=evaluate(s,6);const scene=new SailingScene(canvas,()=>s,()=>m),renderer=scene.renderer,camera=scene.camera,mesh=scene.sailData.main.mesh,pickables=[...scene.pickables],base=aeroForces(s,6),reference=referenceKey(s),target=controlTargetKey(s);
for(const quality of ['detailed','economy','balanced','detailed']){
 s.graphicsQuality=quality;s.graphicsShadows=quality!=='economy';m=evaluate(s,6);scene.render(.05,m);const g=GRAPHICS_PROFILES[quality],d=scene.sailData.main;
 assert.equal(scene.renderer,renderer);assert.equal(scene.camera,camera);assert.equal(d.mesh,mesh);assert.deepEqual(scene.pickables,pickables,'quality changes keep picking identities and navigation');assert.equal(d.nu,g.sailU);assert.equal(d.nv,g.sailV);assert.equal(scene.sea.geometry.parameters.widthSegments,g.sea);assert.equal(scene.renderer.shadowMap.enabled,s.graphicsShadows);assert.equal(scene.sun.shadow.mapSize.x,g.shadowSize);assert.equal(scene.sailData.main.telltales.length,10);
 assert.ok(scene.sailData.main.telltales.every(t=>t.line.visible&&t.line.geometry.attributes.position.count===g.telltalePoints*2));
 for(const [i,j]of [[0,0],[4,8],[g.sailU-1,g.sailV-1]]){const actual=[0,1,2].map(k=>d.mesh.geometry.attributes.position.array[(j*(g.sailU+1)+i)*3+k]),expected=sailPoint('main',j/g.sailV,i/g.sailU,scene.visualState);assert.ok(Math.hypot(...actual.map((v,k)=>v-expected[k]))<2e-6,'mesh samples the same physical surface');}
 const force=aeroForces(s,6);assert.equal(force.usefulDrive,base.usefulDrive);assert.deepEqual(force.sails.map(f=>f.cells.map(c=>c.cp)),base.sails.map(f=>f.cells.map(c=>c.cp)),'visual budget leaves every pressure cell unchanged');assert.equal(referenceKey(s),reference);assert.equal(controlTargetKey(s),target);
}
const rope=[...scene.rigPlanLines.values()].find(o=>o.userData.controlId==='main.sheet'),geometry=rope.geometry;scene.updateRig();assert.equal(rope.geometry,geometry,'unchanged ropes retain their GPU buffers');
const restored=restoreSessionState(snapshotState({...s,graphicsQuality:'economy',graphicsResolution:75,graphicsFrameLimit:30,graphicsShadows:false,graphicsStats:true}));assert.equal(restored.graphicsQuality,'economy');assert.equal(restored.graphicsResolution,undefined);assert.equal(restored.graphicsFrameLimit,undefined);assert.equal(restored.graphicsShadows,false);assert.equal(restored.graphicsStats,true);
const invalid=restoreSessionState({graphicsQuality:'invalid',graphicsResolution:999,graphicsFrameLimit:12});assert.equal(invalid.graphicsQuality,'balanced');assert.equal(invalid.graphicsResolution,undefined);assert.equal(invalid.graphicsFrameLimit,undefined);assert.equal(graphicsSettings({}).quality,'balanced');
assert.equal(graphicsSettings({graphicsResolution:60,graphicsFrameLimit:30}).resolution,undefined);assert.equal(graphicsSettings({graphicsFrameLimit:30}).frameLimit,undefined);
console.log('PASS: three live graphics budgets, same camera/context/control identities, physical surface samples, all telltales, unchanged pressures/AUTO keys, rope-buffer reuse, persisted/validated settings and ignored legacy resolution/FPS settings.');
