// Discrete-vortex boundary-element solution on horizontal sail sections.
// No-penetration is solved numerically; pressure, forces and coefficients share the same cells.
// This is potential flow with empirical separation / finite-span corrections, not RANS/LES CFD.
import {V,RAD,clamp,lerp} from './constants.js';
import {boatScale} from './boats.js';
import {profileQuality,rigPressureSupport,battenPressureSupport} from './trim-response.js';
import {sailPoint,sailShape} from './sail-geometry.js';
import {flyingPressureSupport} from './flying-surface.js';
const RHO=1.225;
export function solveLinear(A,b){const n=b.length,a=A.map((row,i)=>Float64Array.from([...row,b[i]]));for(let k=0;k<n;k++){let p=k;for(let j=k+1;j<n;j++)if(Math.abs(a[j][k])>Math.abs(a[p][k]))p=j;if(Math.abs(a[p][k])<1e-10)throw new Error('Singular panel system');[a[k],a[p]]=[a[p],a[k]];for(let j=k+1;j<n;j++){const f=a[j][k]/a[k][k];for(let i=k;i<=n;i++)a[j][i]-=f*a[k][i];}}const x=new Float64Array(n);for(let k=n-1;k>=0;k--){let s=a[k][n];for(let j=k+1;j<n;j++)s-=a[k][j]*x[j];x[k]=s/a[k][k];}return x;}
export function solveSection(points,flow){const n=points.length-1,cp=[],vortices=[],collocation=[],normals=[],ds=[];
 for(let i=0;i<n;i++){const d=[points[i+1][0]-points[i][0],points[i+1][1]-points[i][1]],l=Math.hypot(...d);ds.push(l);normals.push([-d[1]/l,d[0]/l]);vortices.push([points[i][0]+d[0]*.25,points[i][1]+d[1]*.25]);collocation.push([points[i][0]+d[0]*.75,points[i][1]+d[1]*.75]);}
 const A=collocation.map((p,i)=>vortices.map(q=>{const dx=p[0]-q[0],dy=p[1]-q[1],k=1/(2*Math.PI*(dx*dx+dy*dy));return(-dy*normals[i][0]+dx*normals[i][1])*k;}));
 const b=normals.map(n=>-(flow[0]*n[0]+flow[1]*n[1])),gamma=solveLinear(A,b),v2=flow[0]**2+flow[1]**2;
 for(let i=0;i<n;i++){const tangent=[normals[i][1],-normals[i][0]],vt=flow[0]*tangent[0]+flow[1]*tangent[1];cp.push(v2>1e-10?-2*vt*gamma[i]/(v2*ds[i]):0);}
 let residual=0;for(let i=0;i<n;i++){let r=-b[i];for(let j=0;j<n;j++)r+=A[i][j]*gamma[j];residual=Math.max(residual,Math.abs(r));}
 return{cp,gamma,normals,ds,residual};
}
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
export function solveSail(type,s,awa,aws,referenceArea,{chordPanels=12,spanPanels=16,wake=null}={}){
 const spanPoints=[sailPoint(type,0,0,s),sailPoint(type,0,1,s),sailPoint(type,1,0,s)],span=Math.max(.5,(Math.max(...spanPoints.map(p=>p[1]))-Math.min(...spanPoints.map(p=>p[1])))*boatScale(s)),c=s.controls[type],release=type==='main'?1:smooth(0,12,c.sheet)*(type==='spinnaker'?(.15+.85*smooth(0,10,c.brace)):1);
 const rigSupport=rigPressureSupport(type,s),flyingSupport=flyingPressureSupport(type,s,sailShape(type,s));const n=chordPanels,m=spanPanels,q=.5*RHO*(aws*.514444)**2,side=Math.sign(awa)||1,wind=[-Math.sin(awa*RAD),0,-Math.cos(awa*RAD)],liftAxis=[side*wind[2],0,-side*wind[0]],cells=[],pressures=[],geometry=[];let geometricArea=0,maxResidual=0,attach=0,alphaMean=0;
 for(let j=0;j<m;j++){
  const h=(j+.5)/m,shape=sailShape(type,s,h),recovery=profileQuality(type,shape,s,h)*battenPressureSupport(type,shape,s,h),ps=Array.from({length:n+1},(_,i)=>sailPoint(type,h,i/n,s)),start=ps[0],chord=V.unit([ps[n][0]-start[0],0,ps[n][2]-start[2]]),normal=[-chord[2],0,chord[0]]; // normal lies on the other side of cross(chord, vertical)
  const projected=ps.map(p=>{const r=V.sub(p,start);return[V.dot(r,chord),V.dot(r,normal)];});
  const flow=[V.dot(wind,chord),V.dot(wind,normal)];let alpha=Math.atan2(flow[1],flow[0])/RAD;if(alpha>90)alpha=180-alpha;if(alpha< -90)alpha=-180-alpha;
  // Folding incidence into ±90° must not label leech-to-luff backflow as an
  // attached foil. The symmetric runner can exchange its two flying edges.
  const absA=Math.abs(alpha),down=type==='spinnaker'||type==='gennaker',reverse=type==='spinnaker'?0:smooth(0,.25,-flow[0]),separated=Math.max(reverse,smooth(down?35:16,down?75:46,absA)),luff=Math.max(reverse,smooth(1,18,alpha*(Math.sign(awa)||1)));
  const sol=solveSection(projected,flow);maxResidual=Math.max(maxResidual,sol.residual);attach+=1-separated;alphaMean+=-alpha*(Math.sign(awa)||1);
  const ar=span*span/referenceArea,finiteSpan=ar/(ar+2);const unscaledLift=sol.cp.reduce((sum,c,i)=>sum+c*sol.normals[i][1]*sol.ds[i],0)/Math.max(.1,V.length(V.sub(ps[n],start)));
  const saturation= Math.abs(unscaledLift)>1e-5?1.65*Math.tanh(Math.abs(unscaledLift)*finiteSpan/1.65)/Math.abs(unscaledLift):finiteSpan;
  for(let i=0;i<n;i++){
   const p00=sailPoint(type,j/m,i/n,s),p10=sailPoint(type,j/m,(i+1)/n,s),p01=sailPoint(type,(j+1)/m,i/n,s),p11=sailPoint(type,(j+1)/m,(i+1)/n,s);
   const av=V.add(V.cross(V.sub(p10,p00),V.sub(p01,p00)),V.cross(V.sub(p11,p10),V.sub(p01,p10))),area=V.length(av)*.5,norm=V.unit(av);geometricArea+=area;
   // Align the 2D pressure normal with the actual 3D cell normal.
   const norm2=[sol.normals[i][0]*chord[0]+sol.normals[i][1]*normal[0],0,sol.normals[i][0]*chord[2]+sol.normals[i][1]*normal[2]],sign=V.dot(norm2,norm)>=0?1:-1;
   // An A2 loses flying-shape support when stalled; unlike an S2 runner it
   // cannot retain the same parachute-mode pressure. The 0.65 recovery is an
   // explicit educational assumption, not a measured cloth/collapse solution.
   const vn=V.dot(wind,norm),cpSeparated=(type==='gennaker'?.65:1.8)*vn*Math.abs(vn);let cp=lerp(sol.cp[i]*saturation*sign,cpSeparated,separated);cp=clamp(cp,-4.5,4.5)*release*recovery*rigSupport*flyingSupport;
   const shadow=wake?wake(V.mul(V.add(V.add(p00,p10),V.add(p01,p11)),.25)):0;
   cp*=1-shadow;
   cells.push({h,u:(i+.5)/n,normal:norm,geometricArea:area,cp,shadow,separation:Math.max(separated,1-release),luff:Math.max(luff,1-release,shadow*.55),alpha:absA});pressures.push(cp);geometry.push([p00,p10,p11,p01]);
  }
 }
 const areaScale=referenceArea/Math.max(.001,geometricArea),force=[0,0,0];let maxPressure=0;
 for(const cell of cells){cell.area=cell.geometricArea*areaScale;cell.pa=cell.cp*q;maxPressure=Math.max(maxPressure,Math.abs(cell.pa));const f=V.mul(cell.normal,cell.pa*cell.area);for(let k=0;k<3;k++)force[k]+=f[k];}
 const pressureLift=V.dot(force,liftAxis),pressureDrag=V.dot(force,wind),attachment=attach/m*release,cl=q>1e-8?pressureLift/(q*referenceArea):0;
 // Inviscid leading-edge suction cancels attached-flow pressure drag. Skin + induced drag are modeled explicitly.
 const suction=-pressureDrag*attachment;const ar=span**2/referenceArea,skinCd=.012,inducedCd=cl*cl/(Math.PI*.78*ar),skinDrag=q*referenceArea*skinCd*(type==='genoa'?1:release),inducedDrag=q*referenceArea*inducedCd;
 const drag=Math.max(0,pressureDrag+suction)+skinDrag+inducedDrag,lift=pressureLift;
 for(let k=0;k<3;k++)force[k]+=wind[k]*(drag-pressureDrag);
 const projectedArea=cells.reduce((sum,c)=>sum+Math.abs(V.dot(c.normal,wind))*c.area*(1-c.shadow),0);
 return{type,rigSupport,flyingSupport,area:referenceArea,geometricArea,projectedArea,cells,chordPanels:n,spanPanels:m,force,cl,cd:q>1e-8?drag/(q*referenceArea):0,lift,drag,pressureLift,pressureDrag,suction,skinDrag,inducedDrag,attachment,alpha:alphaMean/m,maxPressure,residual:maxResidual,panelCount:n*m};
}
export function samplePressure(sail,h,u){const n=sail.chordPanels,m=sail.spanPanels,x=clamp(u*n-.5,0,n-1),y=clamp(h*m-.5,0,m-1),i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j;
 const get=(jj,ii)=>sail.cells[Math.min(jj,m-1)*n+Math.min(ii,n-1)],a=get(j,i),b=get(j,i+1),c=get(j+1,i),d=get(j+1,i+1),pa=lerp(lerp(a.pa,b.pa,fx),lerp(c.pa,d.pa,fx),fy);
 const interpolate=key=>lerp(lerp(a[key],b[key],fx),lerp(c[key],d[key],fx),fy);return{pa:Math.abs(pa),signedPa:pa,cp:lerp(lerp(a.cp,b.cp,fx),lerp(c.cp,d.cp,fx),fy),separation:interpolate('separation'),luff:interpolate('luff'),alpha:interpolate('alpha'),attachment:1-interpolate('separation')};
}
