// Infer hardware once from the boat's original inventory; editing a sail never moves a chainplate.
import {beamRatio,boatProfile,GENERIC_BOAT} from './boats.js';
import {rigDimensions} from './orc-sails.js';
import {defaultSailDesigns} from './sail-measures.js';
const defaults=new WeakMap();
export function standingRigLayout(s){const boat=boatProfile(s);if(!defaults.has(boat))defaults.set(boat,defaultSailDesigns(boat));const original=defaults.get(boat),overlap=original.genoa.HLP/(boat.rig?.J||4.32*boat.length/10)*100,inboard=boat.id===GENERIC_BOAT.id||overlap>105,b=beamRatio(s);return{inboard,overlap,chainplateX:(inboard?1.06:1.68)*b,lowerSpreader:(inboard?.80:1.12)*b,upperSpreader:(inboard?.53:.75)*b,lowerSweep:inboard?.24:.55,upperSweep:inboard?.18:.50,shroudZ:rigDimensions(s).mastZ-.6};}
