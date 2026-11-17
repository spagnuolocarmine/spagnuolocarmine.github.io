// Geometric blanketing behind the mainsail on broad reaches / runs.
// This is an empirical pressure deficit, not a resolved turbulent wake or slot model.
import {V,RAD,clamp,lerp} from './constants.js';
import {boatScale} from './boats.js';
import {sailPoint} from './sail-geometry.js';
export function mainsailWake(s,awa){
 const run=clamp((Math.abs(awa)-90)/35);if(!s.main||run===0)return null;
 const wind=[-Math.sin(awa*RAD),0,-Math.cos(awa*RAD)],across=[wind[2],0,-wind[0]],k=boatScale(s),bands=Array.from({length:17},(_,j)=>{
  const p=Array.from({length:13},(_,i)=>sailPoint('main',j/16,i/12,s)),x=p.map(q=>V.dot(q,across)),d=p.map(q=>V.dot(q,wind)),chord=V.sub(p.at(-1),p[0]),horizontal=V.unit([chord[0],0,chord[2]]),normal=[-horizontal[2],0,horizontal[0]];
  return{y:p[0][1],lo:Math.min(...x),hi:Math.max(...x),depth:d.reduce((a,b)=>a+b,0)/d.length,broadness:Math.abs(V.dot(normal,wind))};
 });
 return point=>{
  if(point[1]<=bands[0].y||point[1]>=bands.at(-1).y)return 0;
  let j=1;while(j<16&&bands[j].y<point[1])j++;
  const a=bands[j-1],b=bands[j],f=clamp((point[1]-a.y)/(b.y-a.y)),x=V.dot(point,across),distance=V.dot(point,wind)-lerp(a.depth,b.depth,f),spread=.18*Math.max(0,distance),lo=lerp(a.lo,b.lo,f)-spread,hi=lerp(a.hi,b.hi,f)+spread;
  if(distance<=0||hi-lo<.02)return 0;
  const edge=.22*k+.10*distance,coverage=clamp((x-lo)/edge)*clamp((hi-x)/edge),strength=.78*run*lerp(a.broadness,b.broadness,f);
  return strength*coverage*Math.exp(-distance/(12*k));
 };
}
