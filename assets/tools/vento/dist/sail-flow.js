// One apparent-wind frame for rig loads, sail geometry, pressure panels and rendering.
import {RAD} from './constants.js';
import {polarSpeed} from './polar.js';
export function sailFlow(s,boatSpeed=s.boatSpeed){const speed=Number.isFinite(boatSpeed)?Math.max(0,boatSpeed):polarSpeed(s.windSpeed,s.windAngle,s),a=s.windAngle*RAD,x=s.windSpeed*Math.sin(a),z=s.windSpeed*Math.cos(a)+speed,aws=Math.hypot(x,z);return{boatSpeed:speed,aws,awa:Math.atan2(x,z)/RAD,q:.5*1.225*(aws*.514444)**2,direction:aws>1e-9?[-x/aws,0,-z/aws]:[0,0,-1]};}
