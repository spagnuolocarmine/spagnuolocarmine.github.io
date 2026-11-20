// Input wind is at nominal rig-head height; the same marine shear feeds pressure cells and telltales.
import {RAD,clamp} from './constants.js';
import {polarSpeed} from './polar.js';
import {windReferenceHeight,trueWindAtHeight} from './wind-profile.js';
export function sailFlow(s,boatSpeed=s.boatSpeed){return sailFlowAtHeight(s,windReferenceHeight(s),boatSpeed);}
export function sailFlowAtHeight(s,height=10,boatSpeed=s.boatSpeed){const speed=Number.isFinite(boatSpeed)?Math.max(0,boatSpeed):polarSpeed(s.windSpeed,s.windAngle,s),a=s.windAngle*RAD,tws=trueWindAtHeight(s,height),x=tws*Math.sin(a),z=tws*Math.cos(a)+speed,aws=Math.hypot(x,z);return{boatSpeed:speed,tws,height,aws,awa:Math.atan2(x,z)/RAD,q:.5*1.225*(aws*.514444)**2,direction:aws>1e-9?[-x/aws,0,-z/aws]:[0,0,-1]};}
export function flowFromVelocity(velocity,height=10){const u=Math.hypot(...velocity),aws=u/.514444;return{height,aws,awa:Math.atan2(-velocity[0],-velocity[2])/RAD,q:.5*1.225*u*u,direction:u>1e-8?velocity.map(v=>v/u):[0,0,-1]};}
