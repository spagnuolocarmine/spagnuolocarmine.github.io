import {clamp,lerp,RAD} from './constants.js';
import {sailFlow} from './sail-flow.js';
import {spinPolePoint,rigDimensions} from './orc-sails.js';
export function flyingSheetLead(type,s){const side=-(Math.sign(Math.sin(s.windAngle*RAD))||1);return type==='gennaker'?[side*1.52,.98,-2.5]:[side*1.60,.98,-2.15];}
export function flyingTack(type,s){const r=rigDimensions(s);return type==='gennaker'?[0,1.03+(100-s.controls.gennaker.tack)*.0045,r.mastZ+r.TPS]:spinPolePoint(s);}
export function rawFlyingSheetTravel(type,s){const side=-(Math.sign(Math.sin(s.windAngle*RAD))||1),tack=flyingTack(type,s),lead=flyingSheetLead(type,s),flow=sailFlow(s),awa=Math.abs(flow.awa),free=type==='gennaker'?awa:90-awa,closed=type==='gennaker'?Math.atan2(side*(lead[0]-tack[0]),tack[2]-lead[2])/RAD:Math.atan2(tack[2]-lead[2],side*(lead[0]-tack[0]))/RAD;return{free,closed,angle:lerp(free,closed,clamp(s.controls[type].sheet/100)),tack,lead};}
