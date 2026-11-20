// AUTO must lead the headsail sheet down/aft, never forward of the clew's plumb line.
// Manual car travel remains available over the complete physical rail.
import {clamp} from './constants.js';
import {genoaLeadGeometry,deckLayout} from './deck-layout.js';
import {controlEnabled} from './control-state.js';
import {resolveFixedSheets} from './fixed-sheets.js';
const clearance=.001;
export function autoJibCarClearance(s){const g=genoaLeadGeometry(s.fixedSheetLengths?.genoa?resolveFixedSheets(s).state:s);return g.clew[2]-g.car[2];}
export function constrainAutoJibCar(s,requested=s.controls.genoa.car){
 if(s.foresail!=='genoa')return true;
 if(!controlEnabled(s,'genoa','car'))return autoJibCarClearance(s)>=clearance;
 const c=s.controls.genoa;c.car=clamp(requested,0,100);
 if(autoJibCarClearance(s)>=clearance)return true;
 // Project straight beneath the current clew; a few short corrections account
 // for its coupled motion, avoiding a complete rail search on every frame.
 const d=deckLayout(s),travel=d.genoaTrackForward-d.genoaTrackAft;
 for(let j=0;j<8;j++){
  const g=genoaLeadGeometry(s),limit=100*(g.clew[2]-clearance-.0001-d.genoaTrackAft)/travel;
  c.car=clamp(Math.min(c.car-.0001,limit),0,100);
  if(autoJibCarClearance(s)>=clearance)return true;
  if(c.car===0)return false;
 }
 let lo=0,hi=c.car;c.car=0;
 if(autoJibCarClearance(s)<clearance)return false;
 for(let j=0;j<16;j++){const mid=(lo+hi)/2;c.car=mid;if(autoJibCarClearance(s)>=clearance)lo=mid;else hi=mid;}
 c.car=lo;return true;
}
