import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {newState} from '../dist/physics.js';
const url=new URL('../dist/trim-worker.js',import.meta.url).href;
const code=`const {parentPort}=require('node:worker_threads');globalThis.self={postMessage:m=>parentPort.postMessage(m)};import(${JSON.stringify(url)}).then(()=>parentPort.on('message',m=>self.onmessage({data:m})));`;
const w=new Worker(code,{eval:true});let progress=0;
const result=await new Promise((resolve,reject)=>{w.on('error',reject);w.on('message',m=>{if(m.type==='progress')progress++;if(m.type==='error')reject(new Error(m.message));if(m.type==='result')resolve(m);});w.postMessage({id:7,state:newState(),applyAuto:true});});
assert.equal(result.id,7);assert.equal(result.type,'result');assert.ok(result.reference.score>0);assert.equal(result.solution.state.foresail,'genoa');assert.equal(result.solution.state.genoaSize,newState().genoaSize);assert.ok(Number.isFinite(result.solution.achievable)&&result.solution.achievable>0);assert.ok(progress>0);await w.terminate();console.log('PASS: browser worker module executed in a worker-thread adapter; progress and solved result delivered.');
