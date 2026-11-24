import assert from 'node:assert/strict';
import fs from 'node:fs';
import {SailingScene} from '../dist/scene.js';
import {newState,evaluate} from '../dist/physics.js';
import {boatScale} from '../dist/boats.js';
import {headsailInfo,hasHeadsailBattens} from '../dist/orc-sails.js';
import {newSailProfile} from '../dist/sail-profiles.js';
import {deckLayout} from '../dist/deck-layout.js';
const ctx=new Proxy({},{get:(_,k)=>k==='measureText'?()=>({width:100}):()=>{}});
globalThis.document={addEventListener(){},removeEventListener(){},getElementById(){return null;},createElement(){return{width:256,height:256,getContext:()=>ctx};}};
globalThis.ResizeObserver=class{observe(){}};globalThis.devicePixelRatio=1;
const canvas={style:{},addEventListener(){},removeEventListener(){},getRootNode:()=>document,clientWidth:950,clientHeight:720,parentElement:{getBoundingClientRect:()=>({width:950,height:720})},getBoundingClientRect:()=>({left:0,top:0,width:950,height:720})};
const s=newState();s.boatSpeed=6;let metric=evaluate(s,6);const scene=new SailingScene(canvas,()=>s,()=>metric);
scene.render(.1,metric);
const html=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
for(const id of ['orbit','side','top','stern','main-up','fore-up'])assert.match(html,new RegExp(`data-view="${id}"`));
for(const id of ['orbit','side','top','stern']){
 assert.equal(scene.setView(id),true);
 assert.ok(scene.camera.position.toArray().every(Number.isFinite));
}
assert.equal(scene.setView('stern'),true);
assert.ok(Math.abs(scene.camera.position.x)<1e-9&&scene.camera.position.z<0,'Stern view stays on aft centerline');
for(const view of ['main-up','fore-up']){
 assert.equal(scene.setView(view),true);
 const type=view==='main-up'?'main':s.foresail;
 const points=[];scene.boat.updateWorldMatrix(true,true);
 for(const h of [0,.25,.5,.75,1])for(const u of [0,.5,1])points.push(scene.boat.localToWorld(scene.sailPoint(type,h,u)));
 const yBottom=Math.min(...points.map(p=>p.y));
 assert.ok(scene.camera.position.y<yBottom,`${view}: camera must be below sail foot (${scene.camera.position.y} vs ${yBottom})`);
 assert.ok(scene.controls.target.y>scene.camera.position.y,`${view}: camera looks upwards`);
 assert.ok(scene.camera.position.distanceTo(scene.controls.target)>3*boatScale(s));
}
assert.ok(scene.sailData.main.stripes.length>=6,'more visible contour stations');
assert.ok(scene.sailData.main.seams[0].line.material.opacity>=.6,'pronounced seams');
assert.ok(scene.sailData.main.battens[0].line.material.opacity>=.9,'pronounced battens');
const d=deckLayout(s),rail=scene.genoaTracks[0];
assert.ok(Math.abs(d.genoaTrackY-.012-.865)<1e-6,'rail bottom on side-deck');
assert.ok(scene.genoaCars[0].position.y>d.genoaTrackY,'carriage sits above rail');
assert.equal(scene.materials.glass,undefined,'no independent glazed side or central coachroof elements');
for(const n of [80,100,105,110,125,145,185]){
 s.genoaSize=n;
 s.sailProfiles.genoa={...newSailProfile('genoa'),enabled:true,battened:true};
 const pct=headsailInfo(s).percent;
 assert.equal(hasHeadsailBattens(s),pct<=105.000001,`batten visibility governed by actual LP/J ${pct}`);
 metric=evaluate(s,6);scene.render(.1,metric);
 assert.equal(scene.sailData.genoa.battens.every(b=>b.line.visible),pct<=105.000001,`3D battens at ${pct}%`);
 assert.equal(scene.setView('fore-up'),true);
 assert.ok(scene.camera.position.toArray().every(Number.isFinite));
}
s.foresail='none';metric=evaluate(s,6);scene.render(.1,metric);assert.equal(scene.setView('fore-up'),false,'no empty-sail zoom');
s.main=false;metric=evaluate(s,6);scene.render(.1,metric);assert.equal(scene.setView('main-up'),false,'no empty-main zoom');
console.log('PASS: six 3D presets, camera below sail, zoom across LP/J, strong contour lines/battens, >105% batten suppression, hidden sail guards, coachroof and flush side-deck rail.');
