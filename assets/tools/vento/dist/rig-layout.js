// Inferred chainplate/spreader layout. Certificates supply no chainplate offsets.
import {beamRatio} from './boats.js';
import {headsailInfo,rigDimensions} from './orc-sails.js';
export function standingRigLayout(s){const overlap=headsailInfo(s).percent,inboard=overlap>105.000001,b=beamRatio(s);return{inboard,overlap,chainplateX:(inboard?1.06:1.68)*b,lowerSpreader:(inboard?.80:1.12)*b,upperSpreader:(inboard?.53:.75)*b,lowerSweep:inboard?.24:.55,upperSweep:inboard?.18:.50,shroudZ:rigDimensions(s).mastZ-.6};}
