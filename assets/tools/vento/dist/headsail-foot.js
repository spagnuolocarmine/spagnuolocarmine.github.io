// Spanwise foot tension of a headsail. This is loaded shape, not a sail
// measurement nor an AUTO manoeuvre. The sheet vector is resolved into its
// aft and downward components in jib-balance.js.
import {clamp} from './constants.js';
export function footHold(footClosing,sheet){
 const t=clamp((footClosing-.22)/.48),haul=clamp((sheet-22)/78);
 return(t*t*(3-2*t))*haul*haul;
}
export function tensionedFoot(profile,height,hold){
 const fade=1-clamp(hold)*(1-clamp(height))**7;
 profile.camber*=fade;
 if(profile.customProfile){profile.entry*=fade;profile.exit*=fade;profile.hook*=fade;profile.footRound*=fade;}
 return profile;
}
