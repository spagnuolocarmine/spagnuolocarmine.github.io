// CPU-only frame profile; use the renderer fixture, never report these as GPU FPS.
// node --no-warnings --experimental-loader ./tests/render-loader.mjs scripts/profile-render.mjs [quality]
import fs from 'node:fs';
import {SailingScene} from '../dist/scene.js';
import {newState,evaluate} from '../dist/physics.js';
const ctx=new Proxy({},{get:(_,k)=>k==='measureText'?()=>({width:100}):()=>{}});
globalThis.document={addEventListener(){},removeEventListener(){},getElementById(){return null;},createElement(){return{width:256,height:256,getContext:()=>ctx};}};
globalThis.devicePixelRatio=2;globalThis.ResizeObserver=class{observe(){}disconnect(){}};
const canvas={style:{},addEventListener(){},removeEventListener(){},getRootNode:()=>document,clientWidth:1200,clientHeight:800,parentElement:{getBoundingClientRect:()=>({width:1200,height:800})},getBoundingClientRect:()=>({left:0,top:0,width:1200,height:800})},quality=process.argv[2]||'balanced',output=[];
for(const [name,sail,angle,analysis,wind]of [['upwind','genoa',45,false,true],['pressure','genoa',45,true,true],['downwind','spinnaker',155,false,true],['no-wind-effects','genoa',45,false,false]]){
 const state=newState();Object.assign(state,{foresail:sail,windAngle:angle,boatSpeed:6,analysis,windVisible:wind,graphicsQuality:quality});let metric=evaluate(state,6);const scene=new SailingScene(canvas,()=>state,()=>metric),phases={};
 for(const method of ['syncVisualState','updateRig','updateSails','updateWind','updateTurbulence']){const original=scene[method];scene[method]=function(...args){const start=performance.now();try{return original.apply(this,args);}finally{const p=phases[method]??={ms:0,calls:0};p.ms+=performance.now()-start;p.calls++;}};}
 const times=[],frameCount=120;
 for(let i=-30;i<frameCount;i++){if(i%10===0){state.boatSpeed=6+Math.sin(i*.04)*.08;state.controls.main.halyard=55+10*Math.sin(i*.03);metric=evaluate(state,state.boatSpeed);scene.windPathTime=-Infinity;}const start=performance.now();scene.render(1/60,metric);if(i>=0)times.push(performance.now()-start);}
 times.sort((a,b)=>a-b);let triangles=0,visibleObjects=0,shadowCasters=0;scene.scene.traverse(o=>{for(let p=o;p;p=p.parent)if(!p.visible)return;if(o.isMesh||o.isLine||o.isPoints)visibleObjects++;if(o.isMesh&&o.castShadow)shadowCasters++;if(o.isMesh&&o.geometry)triangles+=(o.geometry.index?.count??o.geometry.attributes.position?.count??0)/3;});
 const row={name,quality,cpuMeanMs:times.reduce((a,b)=>a+b)/times.length,cpuMedianMs:times[Math.floor(times.length/2)],cpuP95Ms:times[Math.floor(times.length*.95)],visibleObjects,triangles,shadowCasters,pixelRatio:scene.renderer.pixelRatio,windParticles:scene.windSeeds.length,mainTelltales:scene.sailData.main.telltales.length,phases};output.push(row);console.log(JSON.stringify(row));
}
if(process.env.PROFILE_OUTPUT)fs.writeFileSync(process.env.PROFILE_OUTPUT,JSON.stringify({method:'CPU-only full scene frames with GPU endpoint stubbed; physics evaluations excluded from frame timings. 120 frames per case after 30 warmup frames; changes every 10 frames.',quality,cases:output},null,2));
