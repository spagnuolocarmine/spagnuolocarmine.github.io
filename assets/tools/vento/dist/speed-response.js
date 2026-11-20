import {clamp,lerp} from './constants.js';
// User-facing control of simulation *time*, not force or certified polar speed.
// -20 => 0.05x; 0 => 1x; +20 => 20x. Reciprocal slowdown/speedup with a central 1x.
export function responseMultiplier(value=0){
 const n=clamp(Number.isFinite(value)?value:0,-20,20);
 return n>=0?1+.95*n:1/(1-.95*n);
}
// Damped first-order approach of the boat to the physically solved steady speed.
// A short wind / trim transient makes changes visible without an instantaneous jump.
export function speedResponseTime(metric,speed,transientRemaining=0){
 const base=clamp(metric.settlingTime||3.0,.6,6);
 if(transientRemaining<=0||Math.abs((metric.targetSpeed||0)-speed)<1e-6)return base;
 return lerp(base,clamp(base*.38,.55,2.2),clamp(transientRemaining/3,0,1));
}
export function advanceBoatSpeed(speed,metric,dt,transientRemaining=0){
 const time=speedResponseTime(metric,speed,transientRemaining);
 return lerp(speed,Math.max(0,metric.targetSpeed||0),1-Math.exp(-Math.max(0,dt)/time));
}
