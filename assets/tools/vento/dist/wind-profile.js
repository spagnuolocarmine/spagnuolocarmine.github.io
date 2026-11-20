// A neutral marine power law, referenced to the nominal rig head, not to 10 m.
// The reference is hardware-based and cannot move when a trim control is changed.
import {boatProfile,boatScale} from './boats.js';
import {clamp} from './constants.js';
export function windReferenceHeight(s){const b=boatProfile(s),k=boatScale(s),r=b.rig,p=r?.P||12.55*Math.sqrt((b.areas.main||36.8932038835)/36.8932038835),i=r?.I||13.55*k,hoist=r?.ISP||Math.max(i,p+.95*k);return Math.max(2.5,hoist+1*k);}
export function windExponent(s){return clamp(s?.windShear??.11,0,.25);}
export function trueWindAtHeight(s,height,headSpeed=s.windSpeed){const top=windReferenceHeight(s),z=clamp(height,1.5,top);return Math.max(0,headSpeed)*Math.pow(z/top,windExponent(s));}
// ORC tables remain untouched and are interpolated at their 10 m wind reference.
export function polarWindSpeed(s,headSpeed=s.windSpeed){const top=windReferenceHeight(s);return Math.max(0,headSpeed)*Math.pow(10/top,windExponent(s));}
