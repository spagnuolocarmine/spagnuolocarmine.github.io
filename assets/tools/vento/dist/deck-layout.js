// Shared normalized 10 m boat coordinates; displayed metres include the selected hull scale.
import {clamp,lerp,RAD,V} from './constants.js';
import {mastPoint,rigResponse,headsailLuffPoint,headsailSide} from './standing-rig.js';
import {boatScale,beamRatio,headsailScale,isCertificateBoat,boatProfile} from './boats.js';
import {rigDimensions,headsailInhaulAllowed,headsailInfo} from './orc-sails.js';
import {sailDesign,measuredArea,smoothProfile} from './sail-measures.js';
import {profileChord} from './sail-profiles.js';
import {solveJibBalance} from './jib-balance.js';
import {standingRigLayout} from './rig-layout.js';
const jibCache=new WeakMap();
export const DECK=Object.freeze({cockpitHalfWidth:1.35,coachroofAft:-1.65,shroudZ:.10,mainTrackZ:-2.75,mainTrackY:1.02,genoaTrackX:1.30,genoaTrackY:.877,genoaTrackAft:-3.55,genoaTrackForward:1.35,mainSheetAttachment:.68});
// Headsail_Track_Travel_Dimension_Guide.pdf, pages 1–3 and 5.
// The neutral lead is the deck-plane extension of the line through the clew
// and 45–55% of the luff. It is NOT a multiple of the foot length.
// Physical recommendations: jib 75–85% 0.6–1 m, jib 95–105% 0.9–1.5 m,
// reefable genoa 130–150% 1.8–3 m; 0.3–0.5 m trim at each end,
// 0.085–0.160 m car and 0.03–0.06 m/end-stop (full-size metres).
// As the simulator has no dedicated furling geometry or recorded track survey,
// the partially furled genoa position is an approximation, not a measured fit.
function nominalHeadsailGeometry(s, width){
 const rig=rigDimensions(s),k=boatScale(s),design=sailDesign('genoa',s);
 const tack=[0,1,rig.mastZ+rig.J],axis=V.unit([0,rig.I,-rig.J]),
  head=V.add(tack,V.mul(axis,design.HLU/k)),
  aftDir=V.unit(V.sub([0,0,-1],V.mul(axis,V.dot([0,0,-1],axis)))),
  length=V.length(V.sub(head,tack)),fore=Math.hypot(rig.I,rig.J),
  along=clamp((.65+width*Math.cos(15*RAD)*rig.J/fore)/(rig.I/fore),.08,length*.42),
  clew=V.add(tack,V.add(V.mul(axis,along),V.mul(aftDir,width)));
 return{tack,head,clew};
}
function bisectorLeadZ(geom, fraction, deckY=DECK.genoaTrackY){
 const {tack,head,clew}=geom,mid=V.add(tack,V.mul(V.sub(head,tack),fraction));
 const vertical=mid[1]-clew[1];
 // A luff that cannot provide a projected lead is reported by fallback,
 // rather than generating an unbounded track.
 if(vertical<.04)return clew[2];
 const out=(clew[1]-deckY)/vertical;
 return clew[2]+(clew[2]-mid[2])*out;
}
export function genoaRailDimensions(s){
 if(!s)return{clewZ:-1,footLength:4,aft:-2.2,forward:-.8,neutral:-1.5,trackLength:1.4,leadAngle:9};
 const rig=rigDimensions(s),k=boatScale(s),design=sailDesign('genoa',s),
  width=design.HLP/k*headsailScale(s)*profileChord('genoa',0,s),
  overlap=headsailInfo(s).percent,
  geom=nominalHeadsailGeometry(s,width),
  footLength=V.length(V.sub(geom.clew,geom.tack)),
  // An aft lead eases the leech; moving forward progressively loads it.
  neutral=bisectorLeadZ(geom,.50),
  small=Math.min(bisectorLeadZ(geom,.45),bisectorLeadZ(geom,.55)),
  large=Math.max(bisectorLeadZ(geom,.45),bisectorLeadZ(geom,.55)),
  reefable=overlap>110,
  // A reefable genoa may be reduced towards ~90% LP/J (guide, page 3).
  // This is a travel allowance, not a change to the selected sail geometry.
  furledWidth=reefable?width*Math.min(1,95/overlap):width,
  furled=reefable?nominalHeadsailGeometry(s,furledWidth):geom,
  pForward=Math.max(large,bisectorLeadZ(furled,.55)),
  pAft=Math.min(small,neutral),
  margin=(overlap<=85?.30:overlap<=110?.38:.42)/k,
  car=(overlap<=85?.085:overlap<=110?.115:.150)/k,
  stop=(overlap<=85?.03:overlap<=110?.04:.05)/k,
  rawLength=pForward-pAft+2*margin+car+2*stop;
 // The published ranges are for representative inventory classes, not an
 // absolute rule for extreme custom cuts. Interpolate between categories.
 const minM=overlap<=85?.6:overlap<=105?.9:overlap<=130?(.9+(overlap-105)*.9/25):1.8;
 const maxM=overlap<=85?1:overlap<=105?1.5:overlap<=130?(1.5+(overlap-105)*1.5/25):3+Math.max(0,overlap-150)*.012;
 const trackLength=clamp(rawLength,minM/k,maxM/k),
  // Keep the active clew's 50% lead in the aft part of the rail and allocate
  // the extra forward travel for reefing / reducing a large genoa.
  aftNominal=neutral-margin-car*.5-stop,
  // A rail must remain on the modeled 10 m deck even for unusual LP/J >180%.
  aft=clamp(aftNominal,-4.70,4.70-trackLength),
  forward=aft+trackLength,
  angle=overlap<=85?8:overlap<=105?8.5:overlap<=110?9.5:overlap<=130?10.5:11.2,
  tackToLead=Math.max(.1,geom.tack[2]-neutral),
  // Clip the guide's preferred transverse sheet angle to the ACTUAL modeled
  // deck width along the entire straight rail. Avoid floating outside the hull
  // on unusually wide-overlap / narrow-beam certificate boats.
  hullSections=[[0,1.50],[.22,1.69],[.43,1.72],[.64,1.49],[.82,.98],[.94,.40],[1,.025]],
  deckHalfWidth=Math.min(...Array.from({length:17},(_,i)=>
   smoothProfile(hullSections,clamp((aft+trackLength*i/16+5)/10))*beamRatio(s))),
  desiredX=clamp(Math.tan(angle*RAD)*tackToLead,.35/k,1.50*beamRatio(s)),
  // Keep the rail on the SIDE DECK, never buried in / hovering over the
  // coachroof. Its width tapers from 0.96 m at z=-1.65 to 0.51 m at z=2.
  // The aft cockpit is recessed: only the outer side-deck lanes remain.
  sideDeckEdge=Math.max(0,...Array.from({length:33},(_,i)=>{
   const z=aft+trackLength*i/32;
   if(z<-1.9)return 1.03;
   if(z>=-1.65&&z<=2)return .96-(z+1.65)*(.45/3.65);
   return 0;
  })),
  // Half the carriage width is 0.073 m; 0.10 m leaves a small clearance.
  trackX=Math.min(Math.max(desiredX,sideDeckEdge+.10),.92*deckHalfWidth),
  achievedAngle=Math.atan2(trackX,tackToLead)/RAD;
 return{clewZ:geom.clew[2],footLength,neutral,aft,forward,trackLength,
  forwardNeutral:pForward,aftNeutral:pAft,margin,carLength:car,endStop:stop,
  leadAngle:achievedAngle,recommendedAngle:angle,trackX,overlap,reefable};
}
export function deckLayout(s){
 const b=beamRatio(s),rig=rigDimensions(s),rail=genoaRailDimensions(s);
 return{...DECK,cockpitHalfWidth:DECK.cockpitHalfWidth*b,
  genoaTrackX:rail.trackX,
  shroudZ:isCertificateBoat(s)?rig.mastZ-.6:DECK.shroudZ,
  genoaTrackAft:rail.aft,genoaTrackForward:rail.forward,
  genoaFootLength:rail.footLength,genoaNominalClewZ:rail.clewZ,genoaNeutralLeadZ:rail.neutral,genoaLeadAngle:rail.leadAngle};
}
const exactLerp=(a,b,t)=>t<=0?a:t>=1?b:lerp(a,b,t);
export const mainTravelerPosition=s=>{const d=deckLayout(s);return[exactLerp(-d.cockpitHalfWidth,d.cockpitHalfWidth,clamp(s.controls.main.traveler/100)),d.mainTrackY,d.mainTrackZ];};
// Manual travel uses the full user-requested rail. AUTO may choose a narrower
// safe window when the lead would run ahead of the loaded clew.
export const genoaUsableCarForward=s=>deckLayout(s).genoaTrackForward;
export const genoaCarPosition=(s,side=headsailSide(s))=>{const d=deckLayout(s);return[side*d.genoaTrackX,d.genoaTrackY,exactLerp(d.genoaTrackAft,genoaUsableCarForward(s),clamp(s.controls.genoa.car/100))];};
export const mainSheetLead=s=>{const p=mainTravelerPosition(s);return[p[0],p[1]+.105,p[2]];};
export const genoaSheetLead=(s,side)=>{const p=genoaCarPosition(s,side);return[p[0],p[1]+.105,p[2]];};
export function mainBoomAngle(s){const c=s.controls.main,side=-(Math.sign(s.windAngle)||1),car=mainSheetLead(s),root=mastPoint(.7/rigDimensions(s).ISP,s),arm=root[2]-.105-DECK.mainTrackZ,lead=(Math.atan2(side*(car[0]-root[0]),arm)-Math.atan2(-side*root[0],arm))/RAD;return clamp(88-c.sheet*.88+lead,-18,108);}
export function genoaLeadGeometry(s){const c=s.controls.genoa,response=rigResponse(s),design=sailDesign('genoa',s),k=boatScale(s),width=design.HLP/k*headsailScale(s)*profileChord('genoa',0,s),key=[response,c.car,c.barber,c.sheet,c.halyard,c.battens,c.twist,...Object.values(design),k,beamRatio(s),s.wingOnWing,s.foresail,s.sailProfiles?.genoa?.revision,s.sailProfiles?.genoa?.enabled],cached=jibCache.get(s);if(cached&&key.every((v,i)=>v===cached.key[i]))return posedJib(cached,s);
 const side=headsailSide(s),car=genoaCarPosition(s,side),lead=genoaSheetLead(s,side),b=beamRatio(s),winch=[side*1.30*b,1.06,-2.1],barber=headsailInhaulAllowed(s)?clamp((c.barber??0)/100):0,target=.35*b,ring=[side*lerp(Math.abs(lead[0]),target,barber),lead[1],lead[2]],rig=rigDimensions(s),balance=solveJibBalance({state:s,tack:headsailLuffPoint(0,s),head:headsailLuffPoint(1,s),ring,width,area:isCertificateBoat(s)&&!design.exploratory?boatProfile(s).areas.genoa:measuredArea('genoa',design)*headsailScale(s),scale:k,nominalI:rig.I,nominalJ:rig.J}),value={car,lead,ring,winch,barber,effectiveSheet:c.sheet,...balance};const entry={key,value};jibCache.set(s,entry);return posedJib(entry,s);
}

function posedJib(entry,state){const angle=state.jibAngleRad;if(!Number.isFinite(angle))return entry.value;if(entry.poseAngle!==angle){entry.poseAngle=angle;entry.pose={...entry.value,...entry.value.poseAt(angle)};}return entry.pose;}
