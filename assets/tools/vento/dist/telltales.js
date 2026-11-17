// Surface-following telltales driven by local apparent flow and panel separation.
import {V,clamp,lerp} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
import {sailPoint} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/sail-geometry.js';
import {samplePressure} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/pressure-solver.js';
import {sailFlow} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/sail-flow.js';
function surfaceFrame(type,h,u,s){const p=sailPoint(type,h,u,s),du=V.mul(V.sub(sailPoint(type,h,Math.min(.9999,u+.001),s),sailPoint(type,h,Math.max(.0001,u-.001),s)),1/.002),dv=V.mul(V.sub(sailPoint(type,Math.min(.9999,h+.001),u,s),sailPoint(type,Math.max(.0001,h-.001),u,s)),1/.002),n=V.unit(V.cross(du,dv));return{p,du,dv,n};}
function uvVelocity(direction,{du,dv}){const a=V.dot(du,du),b=V.dot(du,dv),c=V.dot(dv,dv),x=V.dot(direction,du),y=V.dot(direction,dv),det=Math.max(1e-9,a*c-b*b);return[(x*c-y*b)/det,(y*a-x*b)/det];}
export const TELLTALE_HEIGHTS=Object.freeze([.25,.47,.69,.85]);
// This diagnostic is shared by AUTO and the visible ribbons; AUTO cannot override it.
export function telltaleStatus(type,s,field,h,side,flow=sailFlow(s)){
 const startU=side>0?.255:.305,start=surfaceFrame(type,h,startU,s),source=V.mul(flow.direction,-1),windwardSide=V.dot(start.n,source)>=0?1:-1,windward=side===windwardSide,aero=field?samplePressure(field,h,startU):{luff:0,separation:0,cp:0},bad=clamp(windward?aero.luff:Math.max(aero.separation,aero.luff*.18)),mode=flow.aws<.6?'calma':bad>.22?(windward?'fileggiamento':'separazione'):'aderente',localSpeed=flow.aws*Math.sqrt(Math.max(.08,1+(windward?-.3:.3)*Math.abs(aero.cp)));
 return{startU,start,windward,aero,bad,mode,localSpeed};
}
export function measureTelltaleFlow(s,fields){
 const flow=sailFlow(s),sails=fields.map(field=>{
  const values=TELLTALE_HEIGHTS.flatMap(h=>[-1,1].map(side=>telltaleStatus(field.type,s,field,h,side,flow))),attached=values.filter(x=>x.mode==='aderente').length,total=values.length;
  return{type:field.type,total,attached,allAttached:attached===total,worst:Math.max(0,...values.map(x=>x.bad)),loss:values.reduce((sum,x)=>sum+Math.max(0,x.bad-.18)**2+.01*x.bad,0)/total};
 }),total=sails.reduce((n,f)=>n+f.total,0),attached=sails.reduce((n,f)=>n+f.attached,0);
 return{total,attached,allAttached:total>0&&attached===total,fraction:total?attached/total:0,worst:Math.max(0,...sails.map(f=>f.worst)),loss:total?sails.reduce((n,f)=>n+f.loss*f.total,0)/total:0,sails};
}
export function telltaleRibbon(type,s,field,h,side,time,{points=12,width=.022,length=.58}={}){
 const flow=sailFlow(s),{startU,windward,bad,mode,localSpeed:speed}=telltaleStatus(type,s,field,h,side,flow),phase=time*(1.5+speed*.42)+h*11+side,positions=[],centers=[],normals=[];let u=startU,v=h;
 for(let i=0;i<points;i++){
  const f=i/(points-1),frame=surfaceFrame(type,v,u,s),tangent=V.sub(flow.direction,V.mul(frame.n,V.dot(flow.direction,frame.n))),gravity=V.sub([0,-1,0],V.mul(frame.n,V.dot([0,-1,0],frame.n))),flutter=V.mul(V.unit(frame.dv),bad*(windward?.45+.15*Math.sin(phase+f*5):.40*Math.sin(phase+f*5)));let direction=V.unit(V.add(V.mul(tangent,1-bad*(windward?.8:1.35)),flutter));if(flow.aws<1.5)direction=V.unit(V.add(V.mul(direction,clamp(flow.aws/1.5)),V.mul(gravity,1-clamp(flow.aws/1.5))));
  const lift=.052+width*.15+f*f*(.007+.17*bad)*(.5+.5*Math.sin(phase-f*7))**2,center=V.add(frame.p,V.mul(frame.n,side*lift)),across=V.unit(V.cross(frame.n,direction)),uvAcross=uvVelocity(across,frame);centers.push(center);normals.push(V.mul(frame.n,side));
  for(const edge of[-1,1]){const eu=clamp(u+uvAcross[0]*width*edge,.015,.985),ev=clamp(v+uvAcross[1]*width*edge,.015,.985),edgeFrame=surfaceFrame(type,ev,eu,s),p=V.add(edgeFrame.p,V.mul(edgeFrame.n,side*lift));positions.push(...p);}
  const uv=uvVelocity(direction,frame),step=length/(points-1);u=clamp(u+uv[0]*step,.025,.975);v=clamp(v+uv[1]*step,.025,.975);
 }
 return{positions,centers,normals,windward,mode,bad,localSpeed:speed,minimumOffset:.052};
}
