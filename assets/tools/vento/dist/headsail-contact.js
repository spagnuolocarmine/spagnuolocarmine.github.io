// Check the loaded curved cloth, not a flat envelope spanning the whole rig.
// The force law supplies the same camber, draft and twist used by sailPoint.
import {V,RAD} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
import {boatProfile,boatScale,headsailScale} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/boats.js';
import {sailDesign,measuredProfile} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/sail-measures.js';
import {headsailLuffPoint,rigResponse,shroudPath,spreaderEndpoints,windSide} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/standing-rig.js';
import {standingRigLayout} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/rig-layout.js';
const cache=new Map();
const curve=(u,d)=>u<=0||u>=1?0:Math.sin((u<d?u/d:(1-u)/(1-d))*Math.PI/2);
const curveSlope=(u,d)=>u<=0||u>=1?0:(u<d?Math.PI/(2*d)*Math.cos(u/d*Math.PI/2):-Math.PI/(2*(1-d))*Math.cos((1-u)/(1-d)*Math.PI/2));
export function minimumHeadsailAngle(s,frame,{minimum=0,profileAt=()=>({camber:0,draft:.4,twist:0}),profileKey=[]}={}){
 const design=sailDesign('genoa',s),r=rigResponse(s),layout=standingRigLayout(s),k=boatScale(s),key=JSON.stringify([boatProfile(s).id,s.windAngle,s.genoaSize,k,design,layout,frame.along,Math.round(minimum*2000),profileKey,...[r.tipDeflection,r.prebend,r.rake,r.sag].map(x=>Math.round(x*2000))]);
 if(cache.has(key)){const value=cache.get(key);return value===null?minimum:Math.max(minimum,value);}
 const side=windSide(s),profile=measuredProfile('genoa',design),scale=headsailScale(s)/k,head=headsailLuffPoint(1,s),tack=headsailLuffPoint(0,s),obstacles=shroudPath(s,side,40).filter(p=>p[1]>tack[1]+.12&&p[1]<head[1]-.20);
 for(const h of [.42,.71]){const[a,b]=spreaderEndpoints(s,side,h);for(let j=0;j<=24;j++){const t=j/24;obstacles.push(a.map((x,i)=>x+(b[i]-x)*t));}}
 const stations=new Map(),station=v=>{if(!stations.has(v))stations.set(v,{root:headsailLuffPoint(v,s),width:profile.widthAtHeight(v)*scale,along:frame.along*(1-v)});return stations.get(v);};
 function blocked(angle){
  const shape=profileAt(angle),sections=new Map();
  function section(v){if(sections.has(v))return sections.get(v);const p=station(v),a=angle+shape.twist*RAD*v**1.25,radial=V.add(V.mul(frame.aft,Math.cos(a)),V.mul(frame.lateral,Math.sin(a))),normal=V.add(V.mul(frame.aft,-Math.sin(a)),V.mul(frame.lateral,Math.cos(a))),d=V.add(V.mul(frame.axis,p.along),V.mul(radial,p.width)),n=V.mul(normal,p.width*shape.camber),value={...p,d,n};sections.set(v,value);return value;}
  function atZ(v,z){const p=section(v);if(Math.abs(p.d[2])<1e-9)return null;let u=(z-p.root[2])/p.d[2];for(let j=0;j<5;j++){const derivative=p.d[2]+p.n[2]*curveSlope(u,shape.draft);if(Math.abs(derivative)<1e-9)break;const delta=(p.root[2]+p.d[2]*u+p.n[2]*curve(u,shape.draft)-z)/derivative;u-=delta;if(Math.abs(delta)<1e-7)break;}const c=curve(u,shape.draft);return{u,v,width:p.width,point:p.root.map((x,i)=>x+p.d[i]*u+p.n[i]*c)};}
  for(const q of obstacles){if(q[1]<tack[1]||q[1]>head[1])continue;let lo=0,hi=1,hit;for(let j=0;j<16;j++){const v=(lo+hi)/2;hit=atZ(v,q[2]);if(!hit)break;if(hit.point[1]<q[1])lo=v;else hi=v;}
   // A solution beyond a cut edge or below the tilted foot is not a contact.
   if(hit&&hit.u>=0&&hit.u<=1&&Math.abs(hit.point[1]-q[1])<.008&&Math.abs(hit.point[2]-q[2])<.008&&side*(hit.point[0]-q[0])<Math.min(.025,hit.width*.06+.004))return true;
  }return false;
 }
 let limit=minimum,contact=blocked(minimum);
 if(contact){let lo=minimum,hi=Math.max(minimum,85*RAD);if(blocked(hi))hi=Math.max(minimum,89*RAD);for(let j=0;j<15;j++){const mid=(lo+hi)/2;if(blocked(mid))lo=mid;else hi=mid;}limit=Math.min(Math.PI,hi+.25*RAD);}
 cache.set(key,contact?limit:null);if(cache.size>320)cache.delete(cache.keys().next().value);return limit;
}
