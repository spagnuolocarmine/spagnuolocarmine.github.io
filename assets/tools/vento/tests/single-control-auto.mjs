import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {newState} from '../dist/physics.js';
import {controlTargetKey} from '../dist/trim-optimizer.js';
const url=new URL('../dist/trim-worker.js',import.meta.url).href;
const code=`const {parentPort}=require('node:worker_threads');globalThis.self={postMessage:m=>parentPort.postMessage(m)};import(${JSON.stringify(url)}).then(()=>parentPort.on('message',m=>self.onmessage({data:m})));`;
const worker=new Worker(code,{eval:true});
const request=data=>new Promise((resolve,reject)=>{const onMessage=m=>{if(m.id!==data.id||m.type==='progress')return;worker.off('message',onMessage);if(m.type==='error')reject(Error(m.message));else resolve(m);};worker.on('message',onMessage);worker.once('error',reject);worker.postMessage(data);});
try{
 const state=newState();state.foresail='none';const before=structuredClone(state),a=await request({id:1,state,controlId:'main.outhaul'});assert.equal(a.controlId,'main.outhaul');assert.ok(a.target.controls.main.outhaul>=0&&a.target.controls.main.outhaul<=100);assert.deepEqual(state,before);
 const other=structuredClone(state);other.controls.main.sheet=5;other.controls.main.cunningham=0;other.controls.rig.backstay=0;assert.equal(controlTargetKey(other),controlTargetKey(state));const b=await request({id:2,state:other,controlId:'main.halyard',reference:a.reference});assert.deepEqual(a.target.controls,b.target.controls,'the full ideal target is independent of live trim');assert.equal(b.target.key,a.target.key);
 console.log('PASS: real worker computes complete ideal targets from canonical starting trim; individual-control requests are independent of other live settings and preserve source inputs.');
}finally{await worker.terminate();}
