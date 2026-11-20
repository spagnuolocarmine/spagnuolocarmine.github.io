import assert from 'node:assert/strict';
import {SailingScene} from '../dist/scene.js';
import {newState,evaluate} from '../dist/physics.js';
const context=new Proxy({},{get:(_,key)=>key==='measureText'?()=>({width:100}):()=>{}});
globalThis.document={addEventListener(){},removeEventListener(){},getElementById(){return null;},createElement(){return{width:256,height:256,getContext:()=>context};}};
globalThis.devicePixelRatio=1;
globalThis.ResizeObserver=class{observe(){}disconnect(){}};
const canvas={style:{},addEventListener(){},removeEventListener(){},getRootNode:()=>document,clientWidth:1000,clientHeight:700,parentElement:{getBoundingClientRect:()=>({width:1000,height:700})},getBoundingClientRect:()=>({left:0,top:0,width:1000,height:700})};
let state=newState();state.boatSpeed=6;let metric=evaluate(state,6);
const scene=new SailingScene(canvas,()=>state,()=>metric);
let frames=0;
for(const [angle,foresail,windVisible,analysis,main]of [[45,'genoa',true,false,true],[-52,'genoa',true,true,true],[155,'spinnaker',true,false,true],[135,'gennaker',true,true,true],[45,'none',true,false,true],[45,'genoa',false,false,true],[45,'none',true,false,false]]){
 Object.assign(state,{windAngle:angle,foresail,windVisible,analysis,main});metric=evaluate(state,6);
 for(let i=0;i<2;i++){
  assert.doesNotThrow(()=>scene.render(1/60,metric),`${angle}/${foresail}: full frame reaches renderer`);frames++;
  assert.equal(scene.renderer.calls,frames);
  for(const field of metric.sails){assert.equal(scene.sailData[field.type].mesh.visible,true);}
  for(const flow of scene.flowTrails.filter(f=>f.line.visible))assert.ok([...flow.line.geometry.attributes.position.array].every(Number.isFinite),'finite local-flow wake geometry');
 }
}
assert.ok(scene.boat.children.length>0,'boat geometry is present');
assert.equal(scene.sailData.main.telltales.length,10);
console.log(`PASS: real scene construction and ${frames} full render frames; both tacks, three headsails, mainsail alone, no sails, wind on/off and pressure map. Only the GPU endpoint is stubbed; this does not validate WebGL pixels.`);
