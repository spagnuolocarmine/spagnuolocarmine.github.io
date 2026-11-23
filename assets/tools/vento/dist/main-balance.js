import {RAD,clamp} from './constants.js';
import {sailFlow} from './sail-flow.js';
export function mainLeechBalance(s,angle=0){const c=s.controls.main,flow=sailFlow(s),load=clamp(flow.q/65,0,1.6),sheetAuthority=clamp(c.sheet/100)*(.25+.75*Math.cos(angle*RAD)**2),vangAuthority=clamp(c.vang/100),closing=1-(1-sheetAuthority)*(1-vangAuthority);
 // A slack vang allows the aerodynamic load to lift the boom, especially
 // when the sheet has been eased. Hauling it lowers the boom and supports
 // the upper leech. Empirical amplitudes; not calibrated rig stiffness.
 const freeLift=11+11*load,elevation=1+(freeLift-1)*(1-closing)**1.25;
 return{elevation,closing,twist:2+34*(1-closing),sheetAuthority,vangAuthority};}
