import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState,optimize,equilibrium,getReference,installReference} from '../dist/physics.js';
import {hasSail} from '../dist/boats.js';
import {computeReference,optimizeForReference,referenceKey} from '../dist/trim-optimizer.js';
import {aeroForces} from '../dist/aero.js';
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url))).boats;
const samples=[boats.find(b=>b.name==='NEXT GEN'),boats.find(b=>b.areas.spinnaker>0&&!b.areas.gennaker),boats.find(b=>!b.areas.spinnaker&&!b.areas.gennaker)];let keys=new Set();
for(const b of samples){const s=newState(b);s.windAngle=135;const reference=computeReference(s);s.foresail=reference.state.foresail;const plan=s.foresail;optimize(s);assert.equal(s.foresail,plan);const m=equilibrium(s);assert.ok(hasSail(s.foresail,s));assert.ok(Math.abs(m.polarEfficiency-100)<.5,`${b.name}: actual polar equilibrium ${m.polarEfficiency}`);assert.equal(s.boat.id,b.id);assert.equal(m.area,m.sails.reduce((n,x)=>n+x.area,0));keys.add(referenceKey(s));console.log(JSON.stringify({boat:b.name,sail:s.foresail,percent:m.polarEfficiency}));}
assert.equal(keys.size,samples.length,'reference caches are isolated by boat');
const custom=newState(samples[0]);custom.windAngle=135;custom.sailDesigns.main.MHW*=1.03;const chord=custom.sailDesigns.main.MHW,reference=computeReference(custom);installReference(reference);const solution=optimizeForReference(custom,reference);assert.equal(solution.state.sailDesigns.main.MHW,chord,'AUTO must preserve edited sail shape');const force=aeroForces(solution.state,reference.polarTarget);assert.ok(Math.abs(solution.achievable-100*Math.pow(force.usefulDrive/reference.score,1/3))<1e-6);if(solution.targetReached)assert.ok(Math.abs(equilibrium(solution.state).polarEfficiency-100)<.4);console.log('PASS: independent vessel polars, unavailable sail exclusion, genoa-only inventory and AUTO preserving modified chords with pressure-derived performance.');
