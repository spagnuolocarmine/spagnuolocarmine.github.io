import {clamp,lerp} from './constants.js';
// The current sail pressure and drag determine metric.targetSpeed. When a sail
// is resized this target changes with the real solved surface and approaches
// the original certificate polar gradually. A wind-change transient temporarily
// speeds up BOTH acceleration and deceleration (not just slowing down).
export function speedResponseTime(metric,speed,windResponseRemaining=0){
 const base=Math.max(.6,metric.settlingTime||6);
 if(windResponseRemaining<=0)return base;
 const blend=clamp(windResponseRemaining/14,0,1);
 const difference=Math.abs((metric.targetSpeed||0)-speed);
 // No need to accelerate an already-balanced boat; preserve numerical stability.
 if(difference<.00001)return base;
 const prompt=clamp(base*.24,1.1,4.0);
 return lerp(base,prompt,blend);
}
export function advanceBoatSpeed(speed,metric,dt,windResponseRemaining=0){
 const time=speedResponseTime(metric,speed,windResponseRemaining);
 return lerp(speed,Math.max(0,metric.targetSpeed||0),1-Math.exp(-Math.max(0,dt)/time));
}
