// Exhaustive educational sensitivity sweep, not a second VPP or an ORC scorer.
// Compares pressure-derived drive at fixed boat speed, with one control varied.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {newState,CONTROL_DEFS,polarSpeed,clamp} from '../dist/physics.js';
import {aeroForces} from '../dist/aero.js';
import {windTrimResponse} from '../dist/trim-response.js';
import {shapeSummary} from '../dist/sail-geometry.js';
const output=process.env.AUDIT_OUTPUT||'dist/audit',quick=process.env.AUDIT_QUICK==='1',tacks=process.env.AUDIT_TACK?[Number(process.env.AUDIT_TACK)]:[1,-1],winds=quick?[4,12,25]:Array.from({length:35},(_,i)=>i+1),cases=[['genoa',40],['genoa',60],['genoa',90],['genoa',120],['genoa',155],['genoa',180],['gennaker',90],['gennaker',120],['gennaker',155],['spinnaker',120],['spinnaker',155],['spinnaker',180]],rows=[];
const controls=Object.values(CONTROL_DEFS).flatMap((defs,cat)=>defs.map(d=>d[0]));
const signature=crypto.createHash('sha256');for(const file of['wind-profile.js','sail-flow.js','sail-geometry.js','pressure-solver.js','section-response.js','trim-response.js','telltales.js','aero.js'])signature.update(fs.readFileSync(new URL('../dist/'+file,import.meta.url)));
const started=performance.now();let evaluations=0,contexts=0;
function seed(wind,angle,fore){const s=newState();s.windSpeed=wind;s.windAngle=angle;s.foresail=fore;s.genoaSize=105;const a=Math.abs(angle),w=windTrimResponse(wind,a);s.controls.main={...s.controls.main,halyard:w.halyard,cunningham:clamp(3*wind-8,15,90),outhaul:clamp(30+2.5*wind,30,95),traveler:50,sheet:clamp((84-Math.max(5,a*.65-14))/.8,0,100),battens:55,vang:65};s.controls.rig={backstay:clamp(4*wind-5,15,95),forestay:clamp(40+2*wind,45,95),shrouds:75};s.controls.genoa={...s.controls.genoa,halyard:w.halyard,battens:55,car:45,barber:50,sheet:clamp((90-a*.6)/.81,0,100)};s.controls.gennaker={halyard:w.halyard,tack:clamp(100-a*.4+wind*.5,25,90),sheet:clamp((118-a*.72)/.9,0,100)};s.controls.spinnaker={halyard:w.halyard,sheet:60,brace:clamp((a-105)/.85,0,100),poleLift:50,barberSheet:45,barberBrace:45};return s;}
for(const tack of tacks)for(const wind of winds)for(const [fore,angle]of cases){
 const s=seed(wind,angle*tack,fore),speed=polarSpeed(wind,s.windAngle,s);s.boatSpeed=speed;
 // Avoid mistaking a fully stalled sheet preset for an inert fine control.
 for(const category of ['main',fore]){let value=s.controls[category].sheet,best=-1;for(const x of new Set([value,...[15,40,65,90,100]])){const candidate=structuredClone(s);candidate.controls[category].sheet=x;const f=aeroForces(candidate,speed);evaluations++;if(f.usefulDrive>best){best=f.usefulDrive;value=x;}}s.controls[category].sheet=value;}
 const base=aeroForces(s,speed);evaluations++;
 for(const category of ['main',fore,'rig'])for(const [key]of CONTROL_DEFS[category]){
  const values=[];for(const setting of [0,50,100]){const trial=structuredClone(s);trial.controls[category][key]=setting;const m=aeroForces(trial,speed);evaluations++;values.push({setting,force:m.usefulDrive,drive:m.drive,lift:m.lift,drag:m.drag});}
  const forces=values.map(v=>v.force),lo=Math.min(...forces),hi=Math.max(...forces),ratio=hi>1e-10?(hi-lo)/hi:0,denominator=Math.max(1e-9,base.usefulDrive,hi),delta=speed*(Math.cbrt(hi/denominator)-Math.cbrt(lo/denominator));
  rows.push({control:category+'.'+key,foresail:fore,tws:wind,twa:angle*tack,boatSpeed:speed,force0:values[0].force,force50:values[1].force,force100:values[2].force,deltaDriveN:hi-lo,relativeDrivePercent:100*ratio,deltaSpeedDiagnosticKn:delta,status:hi<1e-7?'no_forward_drive':hi-lo<1e-7?'flat':'responsive'});
 }
 contexts++;if(contexts%12===0)console.log(JSON.stringify({contexts,evaluations,rows:rows.length,lastWind:wind,lastTack:tack}));
}
fs.mkdirSync(output,{recursive:true});const tag=tacks.length===1?(tacks[0]>0?'starboard':'port'):'both',meta={modelHash:signature.digest('hex'),windReference:process.env.AUDIT_WIND_REFERENCE||'masthead',winds,tacks,contexts,evaluations,settings:[0,50,100],angles:[40,60,90,120,155,180],method:'Pressure-derived drive at fixed polar-reference speed; deltaSpeedDiagnosticKn uses the same cubic resistance law at fixed apparent flow, not a settled speed prediction.',quick,seconds:(performance.now()-started)/1000},summary={...meta,rows:rows.length,flat:rows.filter(r=>r.status==='flat'),noForwardDrive:rows.filter(r=>r.status==='no_forward_drive'),minimumResponseKn:Math.min(...rows.filter(r=>r.status==='responsive').map(r=>r.deltaSpeedDiagnosticKn))};
fs.writeFileSync(path.join(output,'controls-'+tag+'.json'),JSON.stringify({summary,rows}));const keys=Object.keys(rows[0]);fs.writeFileSync(path.join(output,'controls-'+tag+'.csv'),keys.join(',')+'\n'+rows.map(r=>keys.map(k=>typeof r[k]==='number'?r[k].toPrecision(9):r[k]).join(',')).join('\n')+'\n');console.log(JSON.stringify({contexts,evaluations,rows:rows.length,flat:summary.flat.length,noDrive:summary.noForwardDrive.length,minimumResponseKn:summary.minimumResponseKn}));
