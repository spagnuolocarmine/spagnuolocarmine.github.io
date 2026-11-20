import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState} from '../dist/physics.js';
import {aeroForces} from '../dist/aero.js';
import {advanceJibDynamics} from '../dist/jib-dynamics.js';
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
for(const boat of [undefined,boats.find(b=>b.name==='FINTO TONTO'),boats.find(b=>b.name==='NEXT GEN')])for(const [wind,angle]of [[8,45],[20,60],[30,-52]]){
 const s=newState(boat);Object.assign(s,{windSpeed:wind,windAngle:angle,boatSpeed:6});const steady=aeroForces(s,6);s.rigLoads=steady.rigLoads;advanceJibDynamics(s,0);const live=aeroForces(s,6);assert.ok(Math.abs(live.usefulDrive-steady.usefulDrive)<1e-6,`${s.boat.name}, ${wind}/${angle}: same pressure-derived steady/live force`);assert.deepEqual(live.rigLoads,steady.rigLoads);
 // A real transient angle must still alter forces; consistency is not an override.
 s.jibAngleRad+=.25;const transient=aeroForces(s,6);assert.ok(Math.abs(transient.drive-live.drive)>1);}
console.log('PASS: nine generic/ORC wind/tack cases share steady/live structural predictor and pressure forces; actual transient jib motion still changes thrust.');
