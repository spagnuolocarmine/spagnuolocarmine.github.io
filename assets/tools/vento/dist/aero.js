import {BOAT,V,clamp,RAD} from './constants.js';
import {boatProfile,hasSail,headsailScale,isCertificateBoat} from './boats.js';
import {sailDesign,measuredArea} from './sail-measures.js';
import {selectedArea,reefAreaRatio} from './orc-sails.js';
import {rigResponse} from './standing-rig.js';
import {solveSail} from './pressure-solver.js';
import {measureTelltaleFlow} from './telltales.js';
import {sailWake} from './sail-wake.js';
import {coupledInflow} from './aero-inflow.js';
import {resolveFixedSheets} from './fixed-sheets.js';
import {stampGeometryState} from './geometry-state.js';
import {trimPreference} from './trim-response.js';
export function sailArea(type,s){if(type==='main'&&s.reef){const raw=isCertificateBoat(s)&&!sailDesign(type,s)?.exploratory?boatProfile(s).areas.main:measuredArea(type,sailDesign(type,s));return raw*reefAreaRatio(s);}if(isCertificateBoat(s)&&!sailDesign(type,s)?.exploratory)return boatProfile(s).areas[type]||0;return type==='main'?measuredArea(type,sailDesign(type,s)):type==='genoa'?measuredArea(type,sailDesign(type,s))*headsailScale(s):selectedArea(type,s);}
export function apparentWind(tws,twa,speed){const a=twa*RAD,x=tws*Math.sin(a),z=tws*Math.cos(a)+speed;return{speed:Math.hypot(x,z),angle:Math.atan2(x,z)/RAD};}
function rigLoads(fields){const total=fields.reduce((v,f)=>V.add(v,f.force),[0,0,0]),fore=fields.find(f=>f.type==='genoa'),force=fore?.force||[0,0,0];return{side:Math.abs(total[0]),forestay:V.length(force),foreDirection:V.length(force)>.01?V.unit(force):[0,0,-1]};}
// At startup, limited water flow cannot support the entire aerodynamic side load.
// Saturate foil lift before using induced-drag equations: their full-load 1/V²
// extrapolation otherwise creates a false low-speed equilibrium and a 50-Pa jump.
export function aeroForces(input,speed=0,quality='normal'){
 let s={...input,boatSpeed:speed,fastGeometry:quality==='coarse'};delete s.rigLoads;const fixed=resolveFixedSheets(s);s=stampGeometryState({...fixed.state});
 const aw=apparentWind(s.windSpeed,s.windAngle,speed),active=[...(s.main?['main']:[]),s.foresail].filter(type=>hasSail(type,s)),q=.5*1.225*(aw.speed*.514444)**2,options=quality==='coarse'?{chordPanels:6,spanPanels:8}:quality==='fine'?{chordPanels:16,spanPanels:24}:{};
 const resolve=(state,fields,settings)=>{const wakes=active.map(type=>[type,sailWake(type,state,aw.angle)]);return active.map(type=>{const other=wakes.filter(([key,w])=>key!==type&&w).map(([,w])=>w),wake=other.length?point=>1-other.reduce((v,f)=>v*(1-f(point)),1):null;return solveSail(type,state,aw.angle,aw.speed,sailArea(type,state),{...settings,wake,inflow:coupledInflow(state,type,fields)});});};
 // The structural predictor is quasi-static in both AUTO and live evaluation.
 // Keep the current cloth pose for the final pressure solve only; mixing the
 // posed coarse predictor with an unposed optimiser created different steady loads.
 const predictor={...s};delete predictor.jibAngleRad;delete predictor.jibAngularVelocity;delete predictor.jibSide;
 const predicted=rigResponse(predictor),preliminary=resolve(predictor,[],{chordPanels:4,spanPanels:5}),measured=rigLoads(preliminary);s={...s,rigLoads:{...measured,side:.5*(predicted.sideLoad+measured.side),forestay:.5*(predicted.forestayLoad+measured.forestay)}};const loaded=resolveFixedSheets({...s,controls:input.controls});s=stampGeometryState({...loaded.state});
 const sails=resolve(s,preliminary,options),area=sails.reduce((v,x)=>v+x.area,0),force=sails.reduce((v,x)=>V.add(v,x.force),[0,0,0]),moment=sails.reduce((v,x)=>V.add(v,x.moment),[0,0,0]),drive=Math.max(0,force[2]),side=Math.abs(force[0]),lift=sails.reduce((v,x)=>v+x.lift,0),drag=sails.reduce((v,x)=>v+x.drag,0),boat=boatProfile(s),k=boat.length/10,gm=Math.max(.45,.38*boat.beam+.12*boat.draft),heelingMoment=Math.abs(moment[2]),rightingScale=boat.displacement*9.81*gm,heel=Math.asin(clamp(heelingMoment/Math.max(1,rightingScale),0,.94))/RAD,waterQ=.5*1025*(speed*.514444)**2,keelSpan=Math.max(.7,boat.draft*.82),keelArea=Math.max(.6,k*k*1.5),rudderArea=Math.max(.35,k*k*.8),rudderSpan=Math.max(.6,k*1.1),rudderLoad=Math.abs(moment[1]+.25*k*force[0])/Math.max(1,boat.length*.37),keelSupported=Math.min(side,waterQ*keelArea*1.15),rudderSupported=Math.min(rudderLoad,waterQ*rudderArea*1.1),keelDrag=waterQ>1e-8?keelSupported*keelSupported/(waterQ*Math.PI*.8*keelSpan**2):0,rudderDrag=waterQ>1e-8?rudderSupported*rudderSupported/(waterQ*Math.PI*.75*rudderSpan**2):0,leeway=waterQ>50?Math.atan(side/(waterQ*keelArea*4.1))/RAD:0,rudderAngle=waterQ>50?Math.atan(rudderLoad/(waterQ*rudderArea*4.4))/RAD:0,heelFactor=1/(1+1.4*Math.sin(heel*RAD)**2),usefulDrive=Math.max(0,drive-keelDrag-rudderDrag)*heelFactor,attachment=sails.reduce((v,x)=>v+x.attachment*x.area,0)/Math.max(.001,area);
 let roughness=0;const cp=[];for(const f of sails)for(let j=0;j<f.spanPanels;j++)for(let i=0;i<f.chordPanels;i++){const c=f.cells[j*f.chordPanels+i];cp.push(Math.abs(c.cp));if(i>1)roughness+=Math.abs(c.cp-f.cells[j*f.chordPanels+i-1].cp)*c.area;}roughness/=Math.max(1,area);cp.sort((a,b)=>a-b);
 return{fixedSheetStatus:loaded.sheetLocks,trimPreference:trimPreference(s),effectiveSheets:loaded.effectiveSheets,telltales:measureTelltaleFlow(s,sails),rigLoads:s.rigLoads,resolvedRigLoads:rigLoads(sails),moment,heelingMoment,rightingScale,heelFactor,leeway,rudderAngle,keelDrag,rudderDrag,keelSupported,rudderSupported,exposedFlyingArea:sails.filter(f=>['spinnaker','gennaker'].includes(f.type)).reduce((n,f)=>n+f.projectedArea,0),speed,aws:aw.speed,awa:aw.angle,area,physicalArea:sails.reduce((n,f)=>n+f.physicalArea,0),cl:q*area>1e-8?lift/(q*area):0,cd:q*area>1e-8?drag/(q*area):0,lift,drag,drive,side,force,heel,attachment,attachedStall:0,roughness,cp95:cp[Math.floor(cp.length*.95)]||0,rigStability:1,usefulDrive,maxPressure:Math.max(0,...sails.map(x=>x.maxPressure)),residual:Math.max(0,...sails.map(x=>x.residual)),panelCount:sails.reduce((v,x)=>v+x.panelCount,0),sails};
}
