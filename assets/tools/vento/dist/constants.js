export const RAD=Math.PI/180;
export const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
export const lerp=(a,b,t)=>a+(b-a)*t;
const scale=10/10.3;
export const BOAT={length:10,beam:3.536*scale,draft:1.893*scale,displacement:4460*scale**3,mainArea:39.14*scale**2,jib105Area:32.26*scale**2,gennakerArea:123.58*scale**2,spinnakerArea:126.35*(10/12.786)**2,scale};
export const V={add:(a,b)=>a.map((v,i)=>v+b[i]),sub:(a,b)=>a.map((v,i)=>v-b[i]),mul:(a,k)=>a.map(v=>v*k),dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],length:a=>Math.hypot(...a),unit:a=>{const l=Math.hypot(...a);return a.map(v=>v/Math.max(l,1e-12));}};
