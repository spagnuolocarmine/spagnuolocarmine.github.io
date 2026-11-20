// Surface-following telltales driven by local apparent flow and panel separation.
import {V,clamp,lerp} from './constants.js';
import {sailPoint} from './sail-geometry.js';
import {samplePressure,sampleSailFlow} from './pressure-solver.js';
import {sailFlow} from './sail-flow.js';
function surfaceFrame(type,h,u,s){const at=clamp(u,.0001,.9999),lo=Math.max(.0001,at-.001),hi=Math.min(.9999,at+.001),bottom=Math.max(.0001,h-.001),top=Math.min(.9999,h+.001),du=V.mul(V.sub(sailPoint(type,h,hi,s),sailPoint(type,h,lo,s)),1/Math.max(1e-7,hi-lo)),dv=V.mul(V.sub(sailPoint(type,top,at,s),sailPoint(type,bottom,at,s)),1/Math.max(1e-7,top-bottom)),n=V.unit(V.cross(du,dv)),p=V.add(sailPoint(type,h,at,s),V.mul(du,type==='main'?Math.max(0,u-at):0));return{p,du,dv,n};}

function uvVelocity(direction,{du,dv}){const a=V.dot(du,du),b=V.dot(du,dv),c=V.dot(dv,dv),x=V.dot(direction,du),y=V.dot(direction,dv),det=Math.max(1e-9,a*c-b*b);return[(x*c-y*b)/det,(y*a-x*b)/det];}
export const TELLTALE_HEIGHTS=Object.freeze([.25,.47,.69,.85]);
// This diagnostic is shared by AUTO and the visible ribbons; AUTO cannot override it.
export const MAIN_SURFACE_STATIONS=Object.freeze([{h:.875,u:.25},{h:.75,u:.5},{h:.5,u:.75}]);
export function telltaleLocations(type){if(type==='main')return TELLTALE_HEIGHTS.map(h=>({h,u:1,side:0,leech:true})).concat(MAIN_SURFACE_STATIONS.flatMap(p=>[-1,1].map(side=>({...p,side,leech:false,small:true}))));if(type==='spinnaker')return[.25,.5,.75].flatMap(h=>[.10,.90].flatMap(u=>[-1,1].map(side=>({h,u,side})))).concat([-1,1].map(side=>({h:.52,u:.5,side})));if(type==='gennaker')return TELLTALE_HEIGHTS.flatMap(h=>[-1,1].map(side=>({h,u:.10,side}))).concat([-1,1].map(side=>({h:.65,u:.94,side})));return TELLTALE_HEIGHTS.flatMap(h=>[-1,1].map(side=>({h,u:.10,side})));}
export function telltaleStatus(type,s,field,h,side,flow=sailFlow(s),location=null){
 flow=sampleSailFlow(field,h,flow);const startU=location?.u??(type==='main'?1:type==='genoa'||type==='gennaker'?.10:.15),leech=type==='main'&&location?.leech!==false&&startU>=.985,start=surfaceFrame(type,h,startU,s),source=V.mul(flow.direction,-1),windwardSide=V.dot(start.n,source)>=0?1:-1,windward=leech?false:side===windwardSide,aero=field?samplePressure(field,h,leech?.95:startU):{luff:0,separation:0,cp:0,alpha:0,stallOnset:16},bad=clamp(leech?Math.max(aero.separation,aero.luff):windward?aero.luff:Math.max(aero.separation,aero.luff*.18)),threshold=type==='main'?.18:.22,margin=aero.alpha-(aero.stallOnset??16),intermittency=leech&&h>=.8&&flow.aws>2&&bad>.02&&bad<threshold+.03?clamp((margin+1.5)/5)*clamp((.26-bad)/.08):0,mode=flow.aws<.6?'calma':bad>threshold?(windward||leech&&aero.luff>aero.separation?'fileggiamento':'separazione'):intermittency>.1?'intermittente':'aderente',localSpeed=flow.aws*Math.sqrt(Math.max(.08,1+(windward?-.3:.3)*Math.abs(aero.cp)));
 return{startU,start,leech,windward,aero,bad,threshold,intermittency,mode,localSpeed,flow};
}

export function measureTelltaleFlow(s,fields){
 const flow=sailFlow(s),running=Math.abs(flow.awa)>125,sails=fields.map(field=>{
  const values=telltaleLocations(field.type).map(location=>telltaleStatus(field.type,s,field,location.h,location.side,flow,location)),attached=values.filter(x=>x.mode==='aderente').length,intermittent=values.filter(x=>x.mode==='intermittente').length,total=values.length,dragMode=running&&field.type!=='gennaker',shadow=field.cells.reduce((n,c)=>n+c.shadow,0)/Math.max(1,field.cells.length),released=field.release<.4,loss=dragMode?(released?1:0)+shadow*.4:values.reduce((sum,x)=>sum+Math.max(0,x.bad-(field.type==='spinnaker'&&x.windward?.38:.18))**2+.01*x.bad,0)/total,appropriate=dragMode?!released&&shadow<.65:values.every(x=>x.mode==='aderente'||(x.leech&&x.intermittency>.1&&x.bad<=x.threshold+.02)||(field.type==='spinnaker'&&x.windward&&x.bad<.38));
  return{type:field.type,total,attached,intermittent,allAttached:attached===total,appropriate,regime:dragMode?'resistenza':'portanza',worst:Math.max(0,...values.map(x=>x.bad)),loss};
 }),total=sails.reduce((n,f)=>n+f.total,0),attached=sails.reduce((n,f)=>n+f.attached,0),intermittent=sails.reduce((n,f)=>n+f.intermittent,0);
 return{total,attached,intermittent,allAttached:total>0&&attached===total,appropriate:total>0&&sails.every(f=>f.appropriate),regime:running?'portante':'alare',fraction:total?attached/total:0,worst:Math.max(0,...sails.map(f=>f.worst)),loss:total?sails.reduce((n,f)=>n+f.loss*f.total,0)/total:0,sails};
}
export function telltaleRibbon(type,s,field,h,side,time,{points=12,width=.022,length=null,location=null}={}){
 const status=telltaleStatus(type,s,field,h,side,sailFlow(s),location),{startU,windward,leech,mode,localSpeed:speed,flow}=status,pulse=status.intermittency*(.5+.5*Math.sin(time*1.45+h*7))**12,bad=clamp(status.bad+.18*pulse),effectiveLength=length??(leech?.42:type==='main'?.14:.58),phase=time*(1.5+speed*.42)+h*11+side,positions=[],centers=[],normals=[],normalSide=leech?(V.dot(status.start.n,flow.direction)>=0?1:-1):side;let u=startU,v=h;
 for(let i=0;i<points;i++){
  const f=i/(points-1),frame=surfaceFrame(type,v,u,s),tangent=V.sub(flow.direction,V.mul(frame.n,V.dot(flow.direction,frame.n))),gravity=V.sub([0,-1,0],V.mul(frame.n,V.dot([0,-1,0],frame.n))),flutter=V.mul(V.unit(frame.dv),bad*(windward?.45+.15*Math.sin(phase+f*5):.40*Math.sin(phase+f*5)));let direction=V.unit(V.add(V.mul(tangent,1-bad*(windward?.8:1.35)),flutter));if(leech)direction=V.unit(V.add(V.add(V.mul(V.unit(frame.du),.70-.45*bad),V.mul(V.unit(tangent),.30-.50*bad)),flutter));if(flow.aws<1.5)direction=V.unit(V.add(V.mul(direction,clamp(flow.aws/1.5)),V.mul(gravity,1-clamp(flow.aws/1.5))));
  const lift=(leech?.008:.052+width*.15)+f*f*(.007+(leech?.10:.17)*bad)*(.5+.5*Math.sin(phase-f*7))**2,center=V.add(frame.p,V.mul(frame.n,normalSide*lift)),across=V.unit(V.cross(frame.n,direction)),uvAcross=uvVelocity(across,frame);centers.push(center);normals.push(V.mul(frame.n,normalSide));
  for(const edge of[-1,1]){const eu=leech?Math.max(1,u+uvAcross[0]*width*edge*(.35+.65*Math.sqrt(f))):clamp(u+uvAcross[0]*width*edge,.015,.985),ev=clamp(v+uvAcross[1]*width*edge,.015,.985),edgeFrame=surfaceFrame(type,ev,eu,s),p=V.add(edgeFrame.p,V.mul(edgeFrame.n,normalSide*lift));positions.push(...p);}
  const uv=uvVelocity(direction,frame),step=effectiveLength/(points-1);u=leech?Math.max(1,u+uv[0]*step):clamp(u+uv[0]*step,.025,.975);v=clamp(v+uv[1]*step,.025,.975);
 }
 const instantMode=mode==='intermittente'?(pulse>.25?'intermittente':'aderente'):mode;return{positions,centers,normals,windward,leech,mode:instantMode,meanMode:mode,bad:status.bad,instantBad:bad,intermittency:status.intermittency,localSpeed:speed,minimumOffset:leech?.008:.052};
}
