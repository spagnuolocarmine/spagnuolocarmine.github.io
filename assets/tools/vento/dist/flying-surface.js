import {windTrimResponse} from './trim-response.js';
// Inferred S2 flying shape, constrained by ORC edge lengths and measured girths.
// Quadratic edge arcs + tangent circular arcs conserve SLU/SLE, SFL and SHW.
// ORC dimensions alone do not identify the sailmaker's original 3D broadseaming.
import {V,RAD,clamp,lerp} from './constants.js';
import {sailDimensions,spinPoleRig} from './orc-sails.js';
import {mastPoint,rigResponse,forestayPoint} from './standing-rig.js';
import {rawFlyingSheetTravel} from './flying-leads.js';
import {flyingProfile} from './flying-profile.js';
import {boatScale} from './boats.js';
import {sailFlow} from './sail-flow.js';
const cache=new WeakMap();
const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const perpendicular=(v,axis)=>V.unit(V.sub(v,V.mul(axis,V.dot(v,axis))));

// Two tangent circular arcs put the maximum depth at the specified draft.
// All coordinates and lengths here are normalized by the chord.
export function circularSection(camber,draft=.5){
 const h=Math.max(0,camber),a=clamp(draft,.2,.8),b=1-a;
 if(h<1e-7)return{length:1,point:u=>[clamp(u),0]};
 const rl=(a*a+h*h)/(2*h),rr=(b*b+h*h)/(2*h),al=2*Math.atan2(h,a),ar=2*Math.atan2(h,b),sl=rl*al,sr=rr*ar,length=sl+sr;
 return{length,point:u=>{if(u<=0)return[0,0];if(u>=1)return[1,0];const s=u*length;if(s<=sl){const t=-al+s/rl;return[a+rl*Math.sin(t),h+rl*(Math.cos(t)-1)];}const t=(s-sl)/rr;return[a+rr*Math.sin(t),h+rr*(Math.cos(t)-1)];}};
}
export function camberForArcLength(ratio,draft=.5){if(ratio<=1+1e-9)return 0;let lo=0,hi=1;while(circularSection(hi,draft).length<ratio)hi*=2;for(let j=0;j<28;j++){const h=(lo+hi)/2;if(circularSection(h,draft).length<ratio)lo=h;else hi=h;}return(lo+hi)/2;}

// Q(t) = (1-t) A + t B + 2 t (1-t) b N, N perpendicular to B-A.
// Its analytic arc length is independent of the direction of the bow N.
function edgeArc(chord,length){
 const d=Math.max(1e-8,chord),L=Math.max(d,length),primitive=(x,b)=>{const z=2*b*x;return .5*(x*Math.hypot(d,z)+d*d/(2*b)*Math.asinh(z/d));},arc=(t,b)=>b<1e-8?d*t:.5*(primitive(1,b)-primitive(1-2*t,b));
 let lo=0,hi=L*2;for(let j=0;j<30;j++){const b=(lo+hi)/2;if(arc(1,b)<L)lo=b;else hi=b;}const bow=(lo+hi)/2,N=80,arcs=Array.from({length:N+1},(_,i)=>arc(i/N,bow));
 return{bow,length:L,tAt:v=>{if(v<=0)return 0;if(v>=1)return 1;const target=v*L;let a=0,b=N;while(b-a>1){const m=(a+b)>>1;if(arcs[m]<target)a=m;else b=m;}return(a+(target-arcs[a])/Math.max(1e-12,arcs[b]-arcs[a]))/N;}};
}
function hoist(s,tack,maxChord,halyard=.6){const maxHoist=.995-.05*(1-clamp(halyard));
 const stay=Array.from({length:33},(_,j)=>forestayPoint(j/32,s)),lead=v=>{const p=mastPoint(v,s);p[2]+=.07;if(p[1]<=stay.at(-1)[1]+.04&&p[1]>=stay[0][1]){let j=1;while(j<32&&stay[j][1]<p[1])j++;const a=stay[j-1],b=stay[j],f=clamp((p[1]-a[1])/Math.max(1e-9,b[1]-a[1]));p[2]=Math.max(p[2],lerp(a[2],b[2],f)+.12);}return p;};
 // A partially hoisted head hangs from the external halyard, ahead of the stay;
 // it must not slide down the mast and become trapped behind the forestay.
 let top=lead(maxHoist);if(V.length(V.sub(top,tack))>maxChord){let lo=.025,hi=maxHoist;for(let j=0;j<24;j++){const mid=(lo+hi)/2;if(V.length(V.sub(lead(mid),tack))>maxChord)hi=mid;else lo=mid;}top=lead((lo+hi)/2);}return top;
}
function clewPoint(tack,head,distance,horizontal,desiredY,maxLeech){
 const delta=V.sub(head,tack),A=V.dot(delta,horizontal),B=delta[1],R=Math.hypot(A,B),target=clamp((desiredY-tack[1])/distance,-.75,.90);let elevation=Math.asin(target),point=()=>V.add(tack,V.mul(V.add(V.mul(horizontal,Math.cos(elevation)),[0,Math.sin(elevation),0]),distance));
 if(V.length(V.sub(head,point()))>maxLeech){const k=(V.dot(delta,delta)+distance*distance-maxLeech*maxLeech)/(2*distance);
  if(k<=R){const phi=Math.atan2(A,B),a=Math.asin(clamp(k/R,-1,1))-phi,b=Math.PI-Math.asin(clamp(k/R,-1,1))-phi;const allowed=[a,b].filter(x=>x>=-Math.PI/2&&x<=Math.PI/2);elevation=allowed.length?allowed.reduce((x,y)=>Math.abs(y-elevation)<Math.abs(x-elevation)?y:x):a;}
  else{ // Extreme edited cuts: use the nearest realizable sphere intersection.
   const axis=V.unit(delta),along=clamp((distance*distance-maxLeech*maxLeech+V.dot(delta,delta))/(2*V.length(delta)),-distance,distance),radial=perpendicular(V.sub(point(),tack),axis);return V.add(tack,V.add(V.mul(axis,along),V.mul(radial,Math.sqrt(Math.max(0,distance*distance-along*along)))));
  }
 }
 return point();
}
function buildFlyingSurface(type,s,shape,travel){
 const k=boatScale(s),dim=sailDimensions(type,s),c=s.controls[type];
 const tack=travel.tack,side=-(Math.sign(Math.sin(s.windAngle*RAD))||1),angle=travel.angle*RAD,draft=type==='spinnaker'?.5:shape.draft,footCamber=clamp(shape.camber*(type==='spinnaker'?1.18:1.45),.001,Math.min(.43,.97*draft,.97*(1-draft))),footUnit=circularSection(footCamber,draft),footChord=dim.width/footUnit.length,head=hoist(s,tack,Math.min(dim.SLU/k*.995,dim.SLE/k+footChord-.02),(c.halyard??60)/100),lu=dim.SLU/k,le=dim.SLE/k,girth=dim.SHW/k,horizontal=type==='spinnaker'?[side*Math.cos(angle),0,-Math.sin(angle)]:[side*Math.sin(angle),0,-Math.cos(angle)],desiredY=type==='spinnaker'?spinPoleRig(s).root[1]+.30+(50-c.barberSheet)*.008+(50-shape.sheetValue)*.0015:tack[1]+dim.width*(.14+.10*(1-shape.sheetValue/100)),clew=clewPoint(tack,head,footChord,horizontal,desiredY,le*.995),base=V.unit(V.sub(clew,tack)),height=V.unit(V.sub(head,V.mul(V.add(tack,clew),.5)));
 let normal=V.unit(V.cross(base,height));if(normal[2]<0)normal=V.mul(normal,-1);
 const leftAxis=V.unit(V.sub(head,tack)),rightAxis=V.unit(V.sub(head,clew)),left=edgeArc(V.length(V.sub(head,tack)),lu),right=edgeArc(V.length(V.sub(head,clew)),le),leftOut=perpendicular(V.mul(base,-1),leftAxis),rightOut=perpendicular(base,rightAxis),shoulderFreedom=type==='gennaker'?.85*clamp((Math.abs(sailFlow(s).awa)-90)/65)*(1-shape.sheetValue/100)*(1-.55*c.tack/100)*clamp(shape.sheetValue/12):0,windwardBow=perpendicular([-side,0,.15],leftAxis),direction=(out,beta)=>V.add(V.mul(out,beta),V.mul(normal,Math.sqrt(Math.max(0,1-beta*beta)))),edgePoint=(start,edge,out,v,beta)=>{const t=edge.tAt(v);let bow=direction(out,beta);if(shoulderFreedom>0&&edge===left){const turn=shoulderFreedom*Math.atan2(V.dot(leftAxis,V.cross(bow,windwardBow)),V.dot(bow,windwardBow));bow=V.add(V.mul(bow,Math.cos(turn)),V.mul(V.cross(leftAxis,bow),Math.sin(turn)));}return V.add(V.add(V.mul(start,1-t),V.mul(head,t)),V.mul(bow,2*t*(1-t)*edge.bow));},midWidth=beta=>V.length(V.sub(edgePoint(clew,right,rightOut,.5,beta),edgePoint(tack,left,leftOut,.5,beta))),wanted=girth/circularSection(Math.max(.001,shape.camber),draft).length;
 let lo=0,hi=1,beta;if(wanted<=midWidth(0))beta=0;else if(wanted>=midWidth(1))beta=1;else{for(let j=0;j<20;j++){const mid=(lo+hi)/2;if(midWidth(mid)<wanted)lo=mid;else hi=mid;}beta=(lo+hi)/2;}
 const middleChord=midWidth(beta),middleCamber=camberForArcLength(girth/Math.max(1e-9,middleChord),draft),sections=new Map();
 function section(v){if(sections.has(v))return sections.get(v);const a=edgePoint(tack,left,leftOut,v,beta),b=edgePoint(clew,right,rightOut,v,beta),delta=V.sub(b,a),chord=V.length(delta),D=V.unit(delta),n=perpendicular(normal,D),turn=shape.twist*RAD*(v-.5),N=V.add(V.mul(n,Math.cos(turn)),V.mul(V.cross(D,n),Math.sin(turn))),camber=v<=.5?lerp(footCamber,middleCamber,smooth(v*2)):lerp(middleCamber,.035,smooth((v-.5)*2)),arc=circularSection(camber,draft),value={a,b,chord,D,N,arc};sections.set(v,value);return value;}
 const surface={tack,clew,head,footChord,middleChord,middleCamber,beta,edgeLengths:[left.length*k,right.length*k],footLength:footChord*footUnit.length*k,halfWidth:middleChord*circularSection(middleCamber,draft).length*k,point:(v,u)=>{if(v>=1)return[...head];const q=section(clamp(v));if(u<=0)return[...q.a];if(u>=1)return[...q.b];const[x,y]=q.arc.point(clamp(u));return V.add(q.a,V.add(V.mul(q.D,q.chord*x),V.mul(q.N,q.chord*y)));}};
 return surface;
}

const travelCache=new Map();
const stateTravelCache=new WeakMap();
// The forestay is a physical obstacle, including when the clews are outboard.
function staysForward(surface,s){
 const stay=Array.from({length:33},(_,j)=>forestayPoint(j/32,s)),top=stay.at(-1)[1];
 const atY=y=>{let j=1;while(j<32&&stay[j][1]<y)j++;const a=stay[j-1],b=stay[j],f=clamp((y-a[1])/Math.max(1e-9,b[1]-a[1]));return a.map((v,i)=>lerp(v,b[i],f));};
 const signed=(v,u)=>{const p=surface.point(v,u),q=atY(p[1]);return{p,q,x:p[0]-q[0]};};
 for(const v of [...Array.from({length:25},(_,j)=>j/25),.96,.975,.985,.995]){let before=signed(v,0);for(let i=1;i<=12;i++){const u=i/12,after=signed(v,u);if(before.x*after.x<=0){let lo=(i-1)/12,hi=u,hit=before;for(let z=0;z<13;z++){const mid=(lo+hi)/2;hit=signed(v,mid);if(before.x*hit.x<=0)hi=mid;else lo=mid;}if(hit.p[1]>=stay[0][1]&&hit.p[1]<top-.25&&hit.p[2]<hit.q[2]+.045)return false;}before=after;}}
 return true;
}
export function constrainFlyingSheetTravel(type,s,raw){
 if(sailDimensions(type,s).approximate)return{...raw,contactLimited:false,approximate:true};
 const r=rigResponse(s),dim=sailDimensions(type,s),c=s.controls[type],signature=[r,dim,c.halyard,c.tack,c.brace,c.poleLift,c.barberSheet,c.barberBrace];let perState=stateTravelCache.get(s);if(!perState){perState={};stateTravelCache.set(s,perState);}let limit=perState[type]?.signature.every((x,i)=>x===signature[i])?perState[type].limit:null;
 if(!limit){const quant=x=>Math.round(x*1000),key=JSON.stringify([type,s.boat.id,s.windAngle,s.windSpeed,Math.round((s.boatSpeed||0)*20),Object.entries(c).filter(([k])=>k!=='sheet'),dim.SLU,dim.SLE,dim.SFL,dim.SHW,...[r.tipDeflection,r.prebend,r.rake,r.sag].map(quant)]);limit=travelCache.get(key);
  if(!limit){const profiles=[0,12,50,100].map(sheet=>flyingProfile(type,s,sheet)),clear=angle=>profiles.every(profile=>staysForward(buildFlyingSurface(type,s,profile,{...raw,angle}),s)),fallback=type==='spinnaker'?-90:180;let free=raw.free,closed=raw.closed,freeLimited=false,closedLimited=false;
   if(!clear(free)){let previous=free,found=false;for(let j=1;j<=12;j++){const a=lerp(raw.free,fallback,j/12);if(clear(a)){let bad=previous,good=a;for(let z=0;z<12;z++){const mid=(bad+good)/2;if(clear(mid))good=mid;else bad=mid;}free=good;found=true;break;}previous=a;}if(!found)free=fallback;freeLimited=true;}
   if(!clear(closed)){let good=free,bad=closed;for(let j=0;j<14;j++){const mid=(good+bad)/2;if(clear(mid))good=mid;else bad=mid;}closed=good;closedLimited=true;}
   limit={free,closed,freeLimited,closedLimited,contactLimited:freeLimited||closedLimited};travelCache.set(key,limit);if(travelCache.size>420)travelCache.delete(travelCache.keys().next().value);
  }
  perState[type]={signature,limit};
 }
 const free=limit.freeLimited?limit.free:raw.free,closed=limit.closedLimited?limit.closed:raw.closed;return{...raw,...limit,free,closed,angle:lerp(free,closed,clamp(c.sheet/100))};
}
function exploratoryFlyingSurface(type,s,shape,travel){
 const dim=sailDimensions(type,s),tack=travel.tack,side=-(Math.sign(Math.sin(s.windAngle*RAD))||1),angle=travel.angle*RAD,horizontal=type==='spinnaker'?[side*Math.cos(angle),0,-Math.sin(angle)]:[side*Math.sin(angle),0,-Math.cos(angle)],up=[0,1,0],normal=V.unit(V.cross(horizontal,up)),point=(v,u)=>{const a=dim.point(v,0),b=dim.point(v,1),width=Math.max(0,b[0]-a[0]),mid=dim.point(v,.5),arc=circularSection(Math.max(.001,shape.camber),shape.draft),[x,y]=arc.point(clamp(u)),turn=shape.twist*RAD*v,axis=V.add(V.mul(horizontal,Math.cos(turn)),V.mul(normal,Math.sin(turn))),base=V.add(tack,V.add(V.mul(horizontal,a[0]),V.mul(up,mid[1]*(.95+.05*clamp((s.controls[type].halyard??60)/100)))));return V.add(base,V.add(V.mul(axis,width*x/arc.length),V.mul(normal,width*y/arc.length)));},clew=point(0,1),head=point(1,0);
 return{approximate:true,tack:point(0,0),clew,head,footChord:V.length(V.sub(clew,point(0,0))),point};
}
export function flyingSurface(type,s,shape){
 const dim=sailDimensions(type,s),response=rigResponse(s),c=s.controls[type],signature=[response,...Object.values(c),dim.SLU,dim.SLE,dim.SFL,dim.SHW,shape.camber,shape.draft,shape.twist];let entry=cache.get(s);if(!entry){entry={};cache.set(s,entry);}if(entry[type]&&signature.every((x,i)=>x===entry[type].signature[i]))return entry[type].surface;
 const travel=constrainFlyingSheetTravel(type,s,rawFlyingSheetTravel(type,s)),surface=dim.approximate?exploratoryFlyingSurface(type,s,shape,travel):buildFlyingSurface(type,s,shape,travel);entry[type]={signature,surface};return surface;
}
// Empirical pressure recovery for an S2 runner: unequal clew heights and a pole
// far from perpendicular to apparent wind unbalance the supported flying shape.
// These assumed support factors act on Cp, not on the displayed speed.
export function runnerPoleSupport(s){const pole=spinPoleRig(s),delta=V.sub(pole.tip,pole.root),axis=V.unit([delta[0],0,delta[2]]),along=V.dot(axis,sailFlow(s).direction);return .12+.88*Math.max(0,1-along*along)**2;}
export function flyingPressureSupport(type,s,shape){if(type!=='spinnaker'&&type!=='gennaker')return 1;const demand=windTrimResponse(s.windSpeed,s.windAngle).demand,halyard=clamp((s.controls[type].halyard??60)/100),support=1/(1+(Math.max(0,demand-halyard)*.9)**2);if(type==='gennaker')return support;const f=flyingSurface(type,s,shape),tilt=Math.atan2(f.tack[1]-f.clew[1],f.footChord);return support*runnerPoleSupport(s)/(1+(tilt/.30)**2);}
