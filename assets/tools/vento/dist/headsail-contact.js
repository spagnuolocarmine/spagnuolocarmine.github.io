// Check the loaded curved cloth, not a flat envelope spanning the whole rig.
// The force law supplies the same camber, draft and twist used by sailPoint.
import {V,RAD} from './constants.js';
import {boatProfile,boatScale,headsailScale} from './boats.js';
import {sailDesign,measuredProfile} from './sail-measures.js';
import {headsailLuffPoint,rigResponse,shroudPath,spreaderEndpoints,headsailSide} from './standing-rig.js';
import {profileOrdinate,profileChord} from './sail-profiles.js';
import {standingRigLayout} from './rig-layout.js';
const cache=new Map();
const curve=(u,d)=>u<=0||u>=1?0:Math.sin((u<d?u/d:(1-u)/(1-d))*Math.PI/2);
const curveSlope=(u,d)=>u<=0||u>=1?0:(u<d?Math.PI/(2*d)*Math.cos(u/d*Math.PI/2):-Math.PI/(2*(1-d))*Math.cos((1-u)/(1-d)*Math.PI/2));
export function minimumHeadsailAngle(s,frame,{minimum=0,clearanceDegrees=1.6,profileAt=()=>({camber:0,draft:.4,twist:0}),profileKey=[]}={}){
 const design=sailDesign('genoa',s),r=rigResponse(s),layout=standingRigLayout(s),k=boatScale(s),key=JSON.stringify([boatProfile(s).id,s.windAngle,s.wingOnWing,s.genoaSize,k,design,layout,frame.along,Math.round(minimum*2000),clearanceDegrees,profileKey,...[r.tipDeflection,r.prebend,r.rake,r.sag].map(x=>Math.round(x*2000))]);
 if(cache.has(key)){const value=cache.get(key);return value===null?minimum:Math.max(minimum,value);}
 const side=headsailSide(s),profile=measuredProfile('genoa',design),scale=headsailScale(s)/k,head=headsailLuffPoint(1,s),tack=headsailLuffPoint(0,s);
 const wires=shroudPath(s,side,48),spreaderSegments=[.42,.71].map(h=>spreaderEndpoints(s,side,h));
 const heights=[...Array.from({length:45},(_,i)=>.004*(i+1)),...Array.from({length:Math.floor(52*.98)},(_,i)=>(i+1)/52)];
 const stations=new Map(),station=v=>{if(!stations.has(v))stations.set(v,{root:headsailLuffPoint(v,s),width:profile.widthAtHeight(v)*scale*profileChord('genoa',v,s),along:frame.along*(1-v)});return stations.get(v);};
 function blocked(angle){
  // Test the *actual curved cloth* against the standing rig at the same
  // height and fore-aft coordinate. No half-space rejection: it can falsely
  // block a sail which is still tens of centimetres clear of a shroud.
  const wire=wires;
  const wireAt=y=>{
   let lo=0,hi=wire.length-1;
   if(y<=wire[0][1])return wire[0];if(y>=wire.at(-1)[1])return wire.at(-1);
   while(hi-lo>1){const j=(lo+hi)>>1;if(wire[j][1]<y)lo=j;else hi=j;}
   const a=wire[lo],b=wire[hi],f=(y-a[1])/Math.max(1e-9,b[1]-a[1]);return a.map((x,i)=>x+f*(b[i]-x));
  };
  for(const v of heights){
   const root=headsailLuffPoint(v,s),profile=profileAt(angle,v);
   const st=station(v),a=angle+profile.twist*RAD*v,radial=V.add(V.mul(frame.aft,Math.cos(a)),V.mul(frame.lateral,Math.sin(a))),normal=V.add(V.mul(frame.aft,-Math.sin(a)),V.mul(frame.lateral,Math.cos(a))),d=V.add(V.mul(frame.axis,st.along),V.mul(radial,st.width)),normalVec=V.mul(normal,st.width*profile.camber);
   let q=wireAt(root[1]);let u=(q[2]-root[2])/(Math.abs(d[2])<1e-9?-1e-9:d[2]);
   for(let k=0;k<5;k++){
    if(u<-.15||u>1.15)break;
    const cu=profile.customProfile?profileOrdinate(profile,u)/Math.max(.001,profile.camber):curve(u,profile.draft);
    const y=root[1]+d[1]*u+normalVec[1]*cu,z=root[2]+d[2]*u+normalVec[2]*cu;
    q=wireAt(y);
    const du=Math.max(.00005,Math.min(.99995,u+.0001)),dl=Math.max(.00005,Math.min(.99995,u-.0001));
    const slope=profile.customProfile?(profileOrdinate(profile,du)-profileOrdinate(profile,dl))/Math.max(.000001,du-dl)/Math.max(.001,profile.camber):curveSlope(u,profile.draft);
    const derivative=d[2]+normalVec[2]*slope;
    if(Math.abs(derivative)<1e-7)break;
    u+=(q[2]-z)/derivative;
   }
   if(u<0||u>1)continue;
   const cu=profile.customProfile?profileOrdinate(profile,u)/Math.max(.001,profile.camber):curve(u,profile.draft),p=[root[0]+d[0]*u+normalVec[0]*cu,root[1]+d[1]*u+normalVec[1]*cu,root[2]+d[2]*u+normalVec[2]*cu];
   q=wireAt(p[1]);
   if(Math.hypot(p[0]-q[0],p[2]-q[2])<.028)return true;
  }
  // Unlike a shroud, a spreader is an entire horizontal segment, not just
  // its outer tip. Solve the curved section at each point of that segment;
  // a sign change in its lateral separation is a genuine spar crossing.
  const span=head[1]-tack[1];
  function atSpreader(q){
   let v=Math.max(.001,Math.min(.999,(q[1]-tack[1])/span)),u=-1,p=null;
   for(let i=0;i<6;i++){
    const st=station(v),shape=profileAt(angle,v),az=angle+shape.twist*RAD*v;
    const radial=V.add(V.mul(frame.aft,Math.cos(az)),V.mul(frame.lateral,Math.sin(az)));
    const normal=V.add(V.mul(frame.aft,-Math.sin(az)),V.mul(frame.lateral,Math.cos(az)));
    const d=V.add(V.mul(frame.axis,st.along),V.mul(radial,st.width)),depth=V.mul(normal,st.width*shape.camber);
    u=(q[2]-st.root[2])/(Math.abs(d[2])<1e-8?-1e-8:d[2]);
    for(let k=0;k<4;k++){
     if(u<-.15||u>1.15)break;
     const cu=shape.customProfile?profileOrdinate(shape,u)/Math.max(.001,shape.camber):curve(u,shape.draft);
     const du=Math.min(.9999,u+.0001),dl=Math.max(.0001,u-.0001),slope=shape.customProfile?(profileOrdinate(shape,du)-profileOrdinate(shape,dl))/Math.max(.00001,du-dl)/Math.max(.001,shape.camber):curveSlope(u,shape.draft);
     const z=st.root[2]+d[2]*u+depth[2]*cu,derivative=d[2]+depth[2]*slope;
     if(Math.abs(derivative)<1e-8)break;
     u+=(q[2]-z)/derivative;
    }
    if(u<0||u>1){p=null;break;}
    const cu=shape.customProfile?profileOrdinate(shape,u)/Math.max(.001,shape.camber):curve(u,shape.draft);
    p=st.root.map((x,j)=>x+d[j]*u+depth[j]*cu);
    const dy=p[1]-q[1];if(Math.abs(dy)<.0015)break;
    v=Math.max(.001,Math.min(.999,v-dy/Math.max(.1,span)));
   }
   return p&&Math.abs(p[1]-q[1])<.018&&Math.abs(p[2]-q[2])<.018?side*(p[0]-q[0]):null;
  }
  for(const [a,b] of spreaderSegments){
   let prior=null;
   for(let i=0;i<=24;i++){
    const f=i/24,q=a.map((x,j)=>x+(b[j]-x)*f),dx=atSpreader(q);
    if(dx!==null&&(Math.abs(dx)<.025||(prior!==null&&dx*prior<0)))return true;
    prior=dx;
   }
  }
  return false;
 }

 let limit=minimum,contact=false;
 const high=Math.max(minimum,90*RAD),step=1*RAD;
 // Usually the loaded foot is the first part to meet the lowers.
 // Probe that endpoint first; the expensive entire-angle sweep is needed
 // only when a crossing exists somewhere inside otherwise-clear travel.
 if(blocked(minimum)){
  let inside=minimum,outside=high;
  for(let j=0;j<15;j++){const mid=(inside+outside)/2;if(blocked(mid))inside=mid;else outside=mid;}
  limit=Math.min(Math.PI,outside+clearanceDegrees*RAD);contact=true;
 }
 let previous=high;
 for(let a=high-step;!contact&&a>=minimum-step*.5;a-=step){
  const trial=Math.max(minimum,a);
  if(blocked(trial)){
   contact=true;let inside=trial,outside=previous;
   for(let j=0;j<13;j++){const mid=(inside+outside)/2;if(blocked(mid))inside=mid;else outside=mid;}
   limit=Math.min(Math.PI,outside+clearanceDegrees*RAD);break;
  }
  previous=trial;
  if(trial===minimum)break;
 }
 cache.set(key,contact?limit:null);if(cache.size>320)cache.delete(cache.keys().next().value);return limit;
}
