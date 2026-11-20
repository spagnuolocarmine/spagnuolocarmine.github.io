import {clamp,lerp} from './constants.js';
// A shorter educational deceleration after a wind change exposes a poor trim
// promptly. Target speed still comes exclusively from pressure-derived drive.
// Acceleration and steady-state equilibrium keep the original mass-based model.
export function speedResponseTime(metric,speed,windResponseRemaining=0){const base=metric.settlingTime||6;if(metric.targetSpeed>=speed||windResponseRemaining<=0)return base;const blend=clamp(windResponseRemaining/3,0,1),prompt=Math.max(.8,Math.min(base*.35,5));return lerp(base,prompt,blend);}
export function advanceBoatSpeed(speed,metric,dt,windResponseRemaining=0){return lerp(speed,metric.targetSpeed,1-Math.exp(-Math.max(0,dt)/speedResponseTime(metric,speed,windResponseRemaining)));}
