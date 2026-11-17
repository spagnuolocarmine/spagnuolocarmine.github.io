// Shared normalized 10 m boat coordinates; displayed metres include the selected hull scale.
import {clamp,lerp,RAD} from './constants.js';
import {mastPoint,rigResponse,headsailLuffPoint} from './standing-rig.js';
import {boatScale,beamRatio,headsailScale,isCertificateBoat,boatProfile} from './boats.js';
import {rigDimensions,headsailInhaulAllowed} from './orc-sails.js';
import {sailDesign,measuredArea} from './sail-measures.js';
import {solveJibBalance} from './jib-balance.js';
const jibCache=new WeakMap();
export const DECK=Object.freeze({cockpitHalfWidth:1.35,coachroofAft:-1.65,shroudZ:.10,mainTrackZ:-2.75,mainTrackY:1.02,genoaTrackX:1.30,genoaTrackY:1.00,genoaTrackAft:-3.55,genoaTrackForward:1.35,mainSheetAttachment:.68});
export function deckLayout(s){const b=beamRatio(s);const rig=rigDimensions(s);return{...DECK,cockpitHalfWidth:DECK.cockpitHalfWidth*b,genoaTrackX:DECK.genoaTrackX*b,shroudZ:isCertificateBoat(s)?rig.mastZ-.6:DECK.shroudZ,genoaTrackForward:isCertificateBoat(s)?rig.mastZ+.65:DECK.genoaTrackForward};}
const exactLerp=(a,b,t)=>t<=0?a:t>=1?b:lerp(a,b,t);
export const mainTravelerPosition=s=>{const d=deckLayout(s);return[exactLerp(-d.cockpitHalfWidth,d.cockpitHalfWidth,clamp(s.controls.main.traveler/100)),d.mainTrackY,d.mainTrackZ];};
export const genoaCarPosition=(s,side=-Math.sign(s.windAngle)||-1)=>{const d=deckLayout(s);return[side*d.genoaTrackX,d.genoaTrackY,exactLerp(d.genoaTrackAft,d.genoaTrackForward,clamp(s.controls.genoa.car/100))];};
export const mainSheetLead=s=>{const p=mainTravelerPosition(s);return[p[0],p[1]+.105,p[2]];};
export const genoaSheetLead=(s,side)=>{const p=genoaCarPosition(s,side);return[p[0],p[1]+.105,p[2]];};
export function mainBoomAngle(s){const c=s.controls.main,side=-(Math.sign(s.windAngle)||1),car=mainSheetLead(s),root=mastPoint(.7/rigDimensions(s).ISP,s),arm=root[2]-.105-DECK.mainTrackZ,lead=(Math.atan2(side*(car[0]-root[0]),arm)-Math.atan2(-side*root[0],arm))/RAD;return clamp(88-c.sheet*.88+lead,-18,108);}
export function genoaLeadGeometry(s){const c=s.controls.genoa,response=rigResponse(s),design=sailDesign('genoa',s),k=boatScale(s),width=design.HLP/k*headsailScale(s),key=[response,c.car,c.barber,c.sheet,c.halyard,c.battens,...Object.values(design),k,beamRatio(s)],cached=jibCache.get(s);if(cached&&key.every((v,i)=>v===cached.key[i]))return posedJib(cached,s);
 const side=-(Math.sign(Math.sin(s.windAngle*RAD))||1),car=genoaCarPosition(s,side),lead=genoaSheetLead(s,side),b=beamRatio(s),winch=[side*1.30*b,1.06,-2.1],barber=clamp((c.barber??50)/50-1,headsailInhaulAllowed(s)?-1:0,1),target=(barber<0?.35:1.62)*b,ring=[side*lerp(Math.abs(lead[0]),target,Math.abs(barber)),lead[1],lead[2]],rig=rigDimensions(s),balance=solveJibBalance({state:s,tack:headsailLuffPoint(0,s),head:headsailLuffPoint(1,s),ring,width,area:isCertificateBoat(s)&&!design.exploratory?boatProfile(s).areas.genoa:measuredArea('genoa',design)*headsailScale(s),scale:k,nominalI:rig.I,nominalJ:rig.J}),value={car,lead,ring,winch,barber,effectiveSheet:c.sheet,...balance};const entry={key,value};jibCache.set(s,entry);return posedJib(entry,s);
}

function posedJib(entry,state){const angle=state.jibAngleRad;if(!Number.isFinite(angle))return entry.value;if(entry.poseAngle!==angle){entry.poseAngle=angle;entry.pose={...entry.value,...entry.value.poseAt(angle)};}return entry.pose;}
