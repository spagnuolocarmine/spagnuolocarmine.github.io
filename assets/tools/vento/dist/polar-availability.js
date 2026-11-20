import {GENERIC_BOAT,boatProfile} from './boats.js';
// A polar is displayed only when the boat has a real ORC polar record.
// The generic laboratory sloop does not have measured or certified polar data.
export function hasCertifiedPolar(state){
 const boat=boatProfile(state);
 const polar=boat.polar;
 return boat.id!==GENERIC_BOAT.id&&!!polar&&Array.isArray(polar.WindSpeeds)&&polar.WindSpeeds.length>0;
}
