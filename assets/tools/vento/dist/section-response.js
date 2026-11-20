// Reduced viscous recovery model. Geometry controls the separation threshold:
// deeper / aft-loaded sections need a stronger pressure recovery, particularly
// where the chord Reynolds number is lower. This is empirical, not boundary-layer CFD.
import {clamp} from './constants.js';
export function sectionRecovery(type,shape,reynolds){const flying=type==='spinnaker'||type==='gennaker',depth=shape.camber||.1,draft=shape.draft||.4,reynoldsLoss=clamp(Math.log10(1800000/Math.max(30000,reynolds)),0,1.5)*(flying?.5:1.5),adverse=(flying?10:32)*Math.max(0,depth-(flying?.27:.08))+(flying?5:16)*Math.max(0,draft-.42)+.08*Math.max(0,shape.hook||0),onset=(flying?35:16)-adverse-reynoldsLoss;return{onset:Math.max(flying?27:10,onset),end:flying?75:46,formFactor:1+6*depth*depth+3*Math.max(0,draft-.45)**2,adverse,reynoldsLoss};}
export function separationAtChord(sectionSeparation,u){if(sectionSeparation>=.85)return sectionSeparation;const edge=clamp(1-1.5*sectionSeparation,.15,.95),x=clamp((u-(edge-.10))/.22);return sectionSeparation*(.4+.6*x*x*(3-2*x));}
