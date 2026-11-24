// The renderer and pressure solver use this exact same steady, loaded sail geometry.
import {RAD,clamp,lerp,V} from './constants.js';
import {mainBoomAngle,genoaLeadGeometry} from './deck-layout.js';
import {mainWidth,genoaWidth,rigDimensions,flatSailPoint,hasHeadsailBattens} from './orc-sails.js';
import {mastPoint,forestayPoint,windSide,rigResponse,shroudAtHeight,headsailLuffPoint} from './standing-rig.js';
import {boatScale,boatProfile} from './boats.js';
import {windTrimResponse,smoothBound,headsailCamber,headsailDraft} from './trim-response.js';
import {sailDesign} from './sail-measures.js';
import {sheetArc,flyingSheetTravel} from './sheet-travel.js';
import {flyingSurface} from './flying-surface.js';
import {flyingProfile} from './flying-profile.js';
import {applySailProfile,profileOrdinate} from './sail-profiles.js';
import {mainLeechBalance} from './main-balance.js';
import {controlledTwist,sectionTwistAngle} from './sail-twist.js';
import {footHold,tensionedFoot} from './headsail-foot.js';
export {mastPoint,forestayPoint,windSide} from './standing-rig.js';
export const rigLoad=s=>clamp(s.windSpeed/14,0,1.8);
export function sailShape(type,s,h=.4){if(type==='spinnaker'||type==='gennaker'){const travel=flyingSheetTravel(type,s);return{angle:type==='spinnaker'?90-travel.angle:travel.angle,...flyingProfile(type,s)};}const c=s.controls[type],r=s.controls.rig,load=clamp(s.windSpeed/4,0,1),weather=windTrimResponse(s.windSpeed,s.windAngle);let p;
 if(type==='main')p={angle:mainSheetAngle(s),twist:mainLeechBalance(s,mainSheetAngle(s)).twist+2*Math.max(0,35-c.battens)/100*h,camber:smoothBound(.21-c.outhaul*.00105*(1-h)**.8-rigResponse(s).prebend*.25-c.cunningham*.00030*(1-h*.65)-c.halyard*.00018*(.35+.65*h)+(c.battens-55)*.00014*h,.035,.22),draft:smoothBound(weather.draft+.14*weather.demand-c.halyard*.0014-c.cunningham*.0004*(1-h)**3,.24,.61,.008),battened:true,stability:clamp(.4+c.battens*.006,0,1),roach:.22+c.battens*.005};
 if(type==='genoa'){const lead=genoaLeadGeometry(s);p={angle:lead.angle,twist:lead.twist,camber:headsailCamber(c,rigResponse(s).sag,lead.footClosing,hasHeadsailBattens(s)),draft:headsailDraft(c,weather),battened:hasHeadsailBattens(s),stability:hasHeadsailBattens(s)?clamp(.4+c.battens*.006):.8,clewHeight:lead.clewHeight};}
 p.twist=controlledTwist(type,s,p.twist,p.angle);p.camber*=.30+.70*load;if(type==='genoa')p.camber*=1-.34*clamp((c.sheet-100)/20);p.pressurized=load;if(type!=='main'){const sheet=type==='genoa'?genoaLeadGeometry(s).effectiveSheet:c.sheet,fill=clamp(sheet/12);p.camber*=.06+.94*fill;p.stability*=fill;p.released=1-fill;if(type!=='genoa')p.twist*=fill;}
 const shape=applySailProfile(type,p,h,s);
 if(type==='genoa'){const lead=genoaLeadGeometry(s);tensionedFoot(shape,h,footHold(lead.footClosing,c.sheet));}
 if(type==='main'&&!s.mainRangeProbe){
  // A sheet-range probe uses the unchanged rig clearance envelope; varying
  // outhaul must not silently redefine the mainsheet's mechanical travel.
  // The outhaul tensions the foot itself, not only the lower panels. At full
  // travel the foot is pulled into the boom line (also with custom moulds),
  // while the adjustment fades smoothly through the bottom third of the sail.
  const footHold=clamp(c.outhaul/100)**2*(1-clamp(h))**5,remaining=1-footHold;
  shape.camber*=remaining;
  if(shape.customProfile){shape.entry*=remaining;shape.exit*=remaining;shape.hook*=remaining;shape.footRound*=remaining;}
 }
 return shape;
}
function camberCurve(u,draft){if(u<=0||u>=1)return 0;return u<draft?Math.sin(u/draft*Math.PI/2):Math.sin((1-u)/(1-draft)*Math.PI/2);}
function profile(points,v){for(let i=1;i<points.length;i++)if(v<=points[i][0]){const t=(v-points[i-1][0])/(points[i][0]-points[i-1][0]);return lerp(points[i-1][1],points[i][1],t);}return points.at(-1)[1];}
export function spinnakerWidth(v){return 8.1*(flatSailPoint('spinnaker',v,1,1)[0]-flatSailPoint('spinnaker',v,0,1)[0]);}
const mainRangeCache=new Map();
export function mainSheetAngle(s){if(s.mainRangeProbe)return mainBoomAngle(s);const response=rigResponse(s),c=s.controls.main,key=s.mainRangeToken||JSON.stringify([boatProfile(s).id,s.boatSpeed,s.windSpeed,s.windAngle,s.controls.rig,s.genoaSize,s.main,s.reef,s.sailProfiles,s.rigLoads,Object.fromEntries(Object.entries(c).filter(([k])=>k!=='sheet')),s.sailDesigns,s.sailAreas,s.foresail]);let range=mainRangeCache.get(key);if(!range){const probe={...s,mainRangeProbe:true,controls:{...s.controls,main:{...c,sheet:0}}},open=mainContactAngle(0,probe),closed=mainBoomAngle({...probe,controls:{...probe.controls,main:{...c,sheet:100}}});range={open,closed};mainRangeCache.set(key,range);if(mainRangeCache.size>240)mainRangeCache.delete(mainRangeCache.keys().next().value);}return sheetArc(range.open,range.closed,c.sheet);}
const angleCache=new WeakMap();
export function mainContactAngle(v,s,p=sailShape('main',s,v)){const desired=p.angle+sectionTwistAngle(p.twist,v);if(desired<30)return desired;const signature=s.geometryToken||[...Object.values(s.controls.main),...Object.values(s.controls.rig),s.windSpeed,s.windAngle,s.boatSpeed,s.foresail,s.genoaSize,s.main,s.reef,JSON.stringify(s.sailProfiles),JSON.stringify(s.rigLoads),boatProfile(s).id,JSON.stringify(s.sailDesigns),JSON.stringify(s.sailAreas)].join(',');let cached=angleCache.get(s);if(!cached||cached.signature!==signature){
 const count=32,raw=[],rig=rigDimensions(s),P=rig.P;for(let j=0;j<=count;j++){const h=j/count,shape=sailShape('main',s,h),request=shape.angle+sectionTwistAngle(shape.twist,h),root=mastPoint((.7+P*h)/rig.ISP,s),side=windSide(s),wire=shroudAtHeight(s,side,1.9+P*h),w=mainWidth(h,s);root[2]-=.105;const wx=side*(wire[0]-root[0]),clearance=.060;
 const blocked=angle=>{const a=angle*RAD;let previous=[0,root[2]];for(let i=1;i<=28;i++){const u=i/28,d=w*shape.camber*camberCurve(u,shape.draft)*(1-.15*h),x=Math.sin(a)*w*u+Math.cos(a)*d,z=root[2]-Math.cos(a)*w*u+Math.sin(a)*d;if(x>=wx-clearance&&previous[0]<=wx+clearance){const f=clamp((wx-previous[0])/Math.max(1e-8,x-previous[0])),crossZ=lerp(previous[1],z,f);if(crossZ>wire[2]-clearance)return true;}previous=[x,z];}return false;};
 let limit=request;if(wx>.02&&request>0&&blocked(request)){let lo=0,hi=request;for(let i=0;i<13;i++){const mid=(lo+hi)/2;if(blocked(mid))hi=mid;else lo=mid;}limit=Math.max(0,lo-1.1);}raw.push(limit);}
 const slope=Math.max(35,p.twist*1.4),values=raw.map((x,i)=>Math.min(...raw.map((y,j)=>y+slope*Math.abs(i-j)/count)));cached={signature,values,count};angleCache.set(s,cached);}
 const x=clamp(v)*cached.count,i=Math.floor(x),f=x-i;return Math.min(desired,lerp(cached.values[i],cached.values[Math.min(i+1,cached.count)],f));
}
export function sailPoint(type,v,u,s){const p=sailShape(type,s,v),side=windSide(s),rig=rigDimensions(s),a=(type==='main'?mainContactAngle(v,s,p):p.angle+sectionTwistAngle(p.twist,v))*RAD;let x,y,z;
 if(type==='main'){
  const root=mastPoint((.7+rig.P*v)/rig.ISP,s),nominalWidth=mainWidth(v,s),compression=1-1/(1+2.467*p.camber*p.camber),w=nominalWidth*(1-compression*(1-v)**2);root[2]-=.105;const d=w*profileOrdinate(p,u)*(1-.15*v);
  const elevation=mainLeechBalance(s,p.angle).elevation*RAD*(1-v),horizontal=w*u*Math.cos(elevation);x=root[0]+side*(Math.sin(a)*horizontal+Math.cos(a)*d);y=root[1]+Math.sin(elevation)*w*u+Math.sin(Math.PI*u)*(.035+.020*clamp(s.controls.main.outhaul/100)**2*(1-v)**5);z=root[2]-Math.cos(a)*horizontal+Math.sin(a)*d;
 }else if(type==='genoa'){
  const lead=genoaLeadGeometry(s),root=headsailLuffPoint(v,s),w=genoaWidth(v,s),depth=w*profileOrdinate(p,u),radial=V.add(V.mul(lead.aft,Math.cos(a)),V.mul(lead.lateral,Math.sin(a))),normal=V.add(V.mul(lead.aft,-Math.sin(a)),V.mul(lead.lateral,Math.cos(a))),point=V.add(root,V.add(V.mul(lead.axis,lead.along*u*(1-v)),V.add(V.mul(radial,w*u),V.mul(normal,depth))));[x,y,z]=point;
 }else return flyingSurface(type,s,p).point(v,u);
 if(p.customProfile)y-=((type==='main'?mainWidth(v,s):genoaWidth(v,s))*(p.footRound||0)/100)*Math.sin(Math.PI*u)*(1-v)**10;return[x,y,z];
}
// A real boom continues a short distance beyond the E measurement / outhaul
// clew position. Its length belongs to the original rig, not to the sail cut.
export const BOOM_E_OVERHANG=1.045;
export function mainBoomPoint(t,s){const root=sailPoint('main',0,0,s),clew=sailPoint('main',0,1,s),direction=V.unit(V.sub(clew,root));return V.add(root,V.mul(direction,rigDimensions(s).E*BOOM_E_OVERHANG*t));}
export function shapeSummary(type,s){const p=sailShape(type,s),mast=mastPoint(1,s),mid=forestayPoint(.5,s),top=forestayPoint(1,s),bottom=forestayPoint(0,s),a=sailPoint(type,.4,0,s),b=sailPoint(type,.4,1,s),chord=V.sub(b,a),L=V.length(chord),sample=u=>{const q=V.sub(sailPoint(type,.4,u,s),a);return{depth:V.length(V.cross(q,chord))/Math.max(1e-9,L),draft:V.dot(q,chord)/Math.max(1e-9,L*L)};};let bestU=0,best=-1;for(let i=0;i<=24;i++){const d=sample(i/24).depth;if(d>best){best=d;bestU=i/24;}}let lo=Math.max(0,bestU-1/24),hi=Math.min(1,bestU+1/24);for(let i=0;i<20;i++){const x=lo+(hi-lo)/3,y=hi-(hi-lo)/3;if(sample(x).depth>sample(y).depth)hi=y;else lo=x;}const peak=sample((lo+hi)/2),side=windSide(s),azimuth=h=>{const c=V.sub(sailPoint(type,h,1,s),sailPoint(type,h,0,s));return Math.atan2(side*c[0],-c[2])/RAD;};let twist=azimuth(.9)-azimuth(.1);while(twist>180)twist-=360;while(twist< -180)twist+=360;return{prebend:rigResponse(s).prebend*boatScale(s),requestedAngle:p.angle,mainLimit:mainContactAngle(0,s),camber:100*peak.depth/Math.max(1e-9,L),draft:100*peak.draft,twist:Math.abs(twist),section:.4,twistFrom:.1,twistTo:.9,mastDeflection:Math.abs(mast[0])*boatScale(s),forestaySag:boatScale(s)*V.length(V.sub(mid,V.mul(V.add(top,bottom),.5)))};}
