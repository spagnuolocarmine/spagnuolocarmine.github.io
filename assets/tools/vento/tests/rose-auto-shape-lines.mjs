import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {newState,CONTROL_DEFS,evaluate} from '../dist/physics.js';
import {snapshotState,restoreSessionState} from '../dist/session-store.js';
import {graphicsSettings} from '../dist/graphics-settings.js';
import {SailingScene} from '../dist/scene.js';
import {preserveStaticSailTwist} from '../dist/sail-twist.js';
import {restoreFixedControls,controlEnabled} from '../dist/control-state.js';

const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const graphicsUI=readFileSync(new URL('../dist/graphics-controls.js',import.meta.url),'utf8');
assert.match(html,/id="quickViewRose"[^]*?data-view="orbit"/);
for(const view of ['top','side','stern','main-up','fore-up','orbit'])assert.match(html,new RegExp(`data-view="${view}"`));
assert.doesNotMatch(html,/class="view-selector"/);
assert.doesNotMatch(app,/renderGenoaCarLimitGraphic/);
assert.match(html,/id="autoContinuous"/);
assert.match(html,/id="autoOnDemand"/);
assert.match(app,/requestOptimization\(true,true\)/,'one shot AUTO starts a true apply request');
assert.match(graphicsUI,/shapeLinesVisible/);
for(const control of ['shapeLineOpacity','shapeLineColor','shapeSeamsVisible','shapeBattensVisible'])assert.match(graphicsUI,new RegExp(control));

const s=newState();
s.shapeLineOpacity=25;s.shapeLineColor='#80aacc';s.shapeSeamsVisible=false;s.shapeBattensVisible=false;s.shapeLinesVisible=false;
const restored=restoreSessionState(snapshotState(s));
for(const key of ['shapeLineOpacity','shapeLineColor','shapeSeamsVisible','shapeBattensVisible','shapeLinesVisible'])assert.equal(restored[key],s[key]);
const g=graphicsSettings(restored);
assert.equal(g.shapeLinesVisible,false);assert.equal(g.shapeLineOpacity,.25);assert.equal(g.shapeLineColor,'#80aacc');
assert.equal(g.shapeSeamsVisible,false);assert.equal(g.shapeBattensVisible,false);
assert.equal(restoreSessionState({shapeLineOpacity:900,shapeLineColor:'invalid'}).shapeLineOpacity,100);
assert.equal(restoreSessionState({shapeLineOpacity:900,shapeLineColor:'invalid'}).shapeLineColor,'#416879');

// Real Three.js sail geometry with only the GPU renderer substituted by the fixture.
const ctx=new Proxy({},{get:(_,key)=>key==='measureText'?()=>({width:100}):()=>{}});
globalThis.document={addEventListener(){},removeEventListener(){},getElementById(){return null;},createElement(){return{width:256,height:256,getContext:()=>ctx}}};
globalThis.devicePixelRatio=1;globalThis.ResizeObserver=class{observe(){}disconnect(){}};
const canvas={style:{},addEventListener(){},removeEventListener(){},getRootNode:()=>document,clientWidth:900,clientHeight:600,parentElement:{getBoundingClientRect:()=>({width:900,height:600})},getBoundingClientRect:()=>({left:0,top:0,width:900,height:600})};
const state=newState();state.boatSpeed=5;let metric=evaluate(state,5);
const scene=new SailingScene(canvas,()=>state,()=>metric);
scene.render(.04,metric);
assert.ok(scene.sailData.main.stripes.some(x=>x.line.visible));
state.shapeLinesVisible=false;state.shapeSeamsVisible=false;state.shapeBattensVisible=false;scene.render(.04,metric);
const main=scene.sailData.main;
assert.ok(main.stripes.every(x=>!x.line.visible&&!x.backLine.visible),'two-sided shape lines can be hidden');
assert.ok(main.seams.every(x=>!x.line.visible),'seams can be hidden');
assert.ok(main.battens.every(x=>!x.line.visible),'battens can be hidden without changing physical geometry');
state.shapeLinesVisible=true;state.shapeLineColor='#abcdef';state.shapeLineOpacity=35;scene.render(.04,metric);
assert.ok(main.stripes.every(x=>x.line.visible&&x.backLine.visible));
assert.ok(main.stripes.every(x=>Math.abs(x.line.material.opacity-.35)<1e-6));
assert.equal(main.stripes[0].line.material.color.getHexString(),'abcdef');

// Exercise real one-shot completion: off stays off and static twist/locked controls stay fixed.
const start=app.indexOf('function finishOptimization(message,id,applyAuto){');
const end=app.indexOf('\nfunction requestOptimization(',start);
assert.ok(start>=0&&end>start);
const stateAuto=newState();stateAuto.auto=false;stateAuto.controls.main.twist=23;stateAuto.fixedControls['main.sheet']=66;
const solution=structuredClone(stateAuto);solution.controls.main.twist=49;solution.controls.main.sheet=4;solution.controls.genoa.car=18;
const scope={state:stateAuto,workerJob:29,onDemandJob:29,workerBusy:true,autoReport:null,controlTab:'main',shapeComparison:null,autoCarTarget:null,
 $:()=>({setAttribute(){}}),referenceKey:()=> 'test-key',installReference:()=>{},CONTROL_DEFS,shapeSummary:()=>({}),controlEnabled,
 preserveStaticSailTwist,restoreFixedControls,scene:null,toast:()=>{},hasCertifiedPolar:()=>false,fmt:()=> '75',updatePlan:()=>{},renderControls:()=>{},syncAuto:()=>{},updateImmediate:()=>{},persistence:{schedule(){}},performance:{now:()=>1},structuredClone};
vm.createContext(scope);vm.runInContext(app.slice(start,end),scope);
scope.finishOptimization({reference:{key:'test-key'},solution:{state:solution,flowReached:true}},29,true);
assert.equal(stateAuto.auto,false,'on-demand does not turn continuous AUTO on');
assert.equal(stateAuto.controls.main.twist,23,'on-demand preserves user-only static twist');
assert.equal(stateAuto.controls.main.sheet,66,'on-demand preserves fixed manoeuvres');
assert.equal(stateAuto.controls.genoa.car,18,'on-demand actually applies optimized manoeuvres');
assert.equal(scope.onDemandJob,null,'on-demand job is cleared after application');
console.log('PASS: six-point floating view compass, removed car diagram, persistent shape-line appearance controls, real Three.js line visibility/color/opacity, one-shot AUTO application with static twist and fixed controls preserved.');
