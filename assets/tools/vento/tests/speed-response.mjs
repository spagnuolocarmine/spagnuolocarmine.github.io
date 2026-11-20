import assert from 'node:assert/strict';
import {advanceBoatSpeed,speedResponseTime,responseMultiplier} from '../dist/speed-response.js';
const poor={targetSpeed:3,settlingTime:20},advance=(metric,wind)=>{let speed=7;for(let i=0;i<60;i++)speed=advanceBoatSpeed(speed,metric,.05,wind?3-i*.05:0);return speed;};
assert.ok(speedResponseTime(poor,7,3)<=2.2);
assert.ok(advance(poor,true)<advance(poor,false)-.5,'wind-induced braking is visible more quickly');
assert.equal(speedResponseTime(poor,7,0),6);
assert.ok(speedResponseTime({targetSpeed:9,settlingTime:5},7,3)<5,'wind changes also speed up acceleration');
for(const [slider,expected] of [[-20,1/20],[-10,1/10.5],[-5,1/5.75],[0,1],[5,5.75],[10,10.5],[20,20]])assert.ok(Math.abs(responseMultiplier(slider)-expected)<1e-10);
for(const initial of [0,3,7,12])for(const target of [0,3,7,12]){let v=initial;for(let frame=0;frame<1200;frame++){const next=advanceBoatSpeed(v,{targetSpeed:target,settlingTime:4},.05,Math.max(0,3-frame*.05));assert.ok(Number.isFinite(next)&&next>=Math.min(initial,target)-1e-9&&next<=Math.max(initial,target)+1e-9,'no speed override or overshoot');v=next;}assert.ok(Math.abs(v-target)<.01);}
for(const direction of [2,8]){const m={targetSpeed:direction,settlingTime:4};let slow=5,normal=5,fast=5;for(let i=0;i<40;i++){slow=advanceBoatSpeed(slow,m,.05*responseMultiplier(-20));normal=advanceBoatSpeed(normal,m,.05);fast=advanceBoatSpeed(fast,m,.05*responseMultiplier(20));}assert.ok(Math.abs(fast-direction)<Math.abs(normal-direction)&&Math.abs(normal-direction)<Math.abs(slow-direction));}
assert.equal(advanceBoatSpeed(7,{targetSpeed:7,settlingTime:20},.05,3),7);
console.log('PASS: physical 1.2–6 s response, short faster wind transient, stable 0.05x/1x/20x time scaling, finite bounded gradual acceleration/braking.');
