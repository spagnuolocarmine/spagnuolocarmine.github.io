// Spanwise chord rotation: 0 degrees at the foot, requested twist at the head.
// LA BARCA VELOCE, ch. 1, defines twist by the relative section/chord angles;
// this is an educational trim parameter, not an ORC certificate measurement.
import {RAD,clamp} from './constants.js';
export const DEFAULT_TWIST=10;
export const MAX_TWIST=50;
export function controlledTwist(type,state,natural,angle=0){
 const desired=clamp(Number(state?.controls?.[type]?.twist??DEFAULT_TWIST),0,MAX_TWIST);
 if(desired===0||desired===MAX_TWIST)return desired;
 let trimDelta=0;
 if(type==='main'){
  // Compare the current leech load with the *same* geometry at factory sheet/vang.
  // Consequently the default controls really display 10 degrees at every heading.
  const baseSheet=.88*(.25+.75*Math.cos(angle*RAD)**2);
  const defaultNatural=2+22*(1-baseSheet)*(.38);
  trimDelta=natural-defaultNatural+.12*(64-state.controls.main.battens)+.07*(88-state.controls.main.sheet);
 }else if(type==='genoa'){
  const c=state.controls.genoa;
  // Lead further aft and sheet eased open the head; forward lead closes it.
  // The actual sheet-load/pressure solver still supplies camber and incidence.
  trimDelta=.15*(c.car-55)+.10*(87-Math.min(100,c.sheet))+.035*(c.barber-50);
 }
 // Smooth end stops keep a user-requested 0° or 50° exact, while the other
 // trimming lines influence the loaded section angles away from the end stops.
 return clamp(desired+trimDelta*Math.sin(Math.PI*desired/MAX_TWIST),0,MAX_TWIST);
}
export const sectionTwistAngle=(twist,height)=>twist*clamp(height);
