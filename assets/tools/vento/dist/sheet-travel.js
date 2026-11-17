// Sheet sliders describe all useful geometric travel within the rig's clearance.
import {clamp,lerp} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
import {rawFlyingSheetTravel} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/flying-leads.js';
import {constrainFlyingSheetTravel} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/flying-surface.js';
export {flyingSheetLead,flyingTack} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/flying-leads.js';
export const sheetFraction=value=>clamp(value/100);
export const sheetArc=(free,closed,value)=>lerp(free,closed,sheetFraction(value));
export function flyingSheetTravel(type,s){return constrainFlyingSheetTravel(type,s,rawFlyingSheetTravel(type,s));}
