import assert from 'node:assert/strict';
import {solveSection,solveSail,samplePressure} from '../dist/pressure-solver.js';
import {newState,apparentWind,sailArea,evaluate} from '../dist/physics.js';
import {V,RAD} from '../dist/constants.js';
for(const angle of [-10,-5,0,5,10])for(const n of [8,12,24]){
 const a=angle*RAD,result=solveSection(Array.from({length:n+1},(_,i)=>[i/n,0]),[Math.cos(a),-Math.sin(a)]),cl=2*result.gamma.reduce((a,b)=>a+b,0);
 assert.ok(Math.abs(cl-2*Math.PI*Math.sin(a))<1e-9,'flat plate circulation agrees with thin airfoil result');assert.ok(result.residual<1e-9);
}
const s=newState(),aw=apparentWind(12,52,6.4),area=sailArea('main',s),coarse=solveSail('main',s,aw.angle,aw.speed,area,{chordPanels:12,spanPanels:16}),fine=solveSail('main',s,aw.angle,aw.speed,area,{chordPanels:24,spanPanels:32});
assert.ok(Math.abs(coarse.lift-fine.lift)/fine.lift<.03,'integrated lift converges within 3% on this benchmark');assert.ok(Math.abs(coarse.drag-fine.drag)/fine.drag<.03,'integrated drag converges within 3% on this benchmark');
for(const type of ['main','genoa','spinnaker','gennaker']){
 s.foresail=type==='main'?'genoa':type;s.windAngle=type==='spinnaker'?150:type==='gennaker'?110:52;const m=evaluate(s,6);const a=m.sails.find(x=>x.type===type);
 const integrated=a.cells.reduce((f,p)=>V.add(f,V.mul(p.normal,p.pa*p.area)),[0,0,0]),sign=Math.sign(m.awa)||1,w=[-Math.sin(m.awa*RAD),0,-Math.cos(m.awa*RAD)],l=[sign*w[2],0,-sign*w[0]];
 assert.ok(Math.abs(V.dot(integrated,l)-a.lift)<1e-8,'lift integrates the same pressure cells used by colors');assert.ok(Math.abs(V.dot(integrated,w)-a.pressureDrag)<1e-8);
 assert.ok(Math.abs(Math.max(0,a.pressureDrag+a.suction)+a.skinDrag+a.inducedDrag-a.drag)<1e-8,'drag components are explicit');
 const q=.5*1.225*(m.aws*.514444)**2;assert.ok(Math.abs(a.cl-a.lift/(q*a.area))<1e-10);assert.ok(Math.abs(a.cd-a.drag/(q*a.area))<1e-10);
 for(const cell of a.cells){const sample=samplePressure(a,cell.h,cell.u);assert.ok(Math.abs(sample.signedPa-cell.pa)<1e-9,'render interpolation reproduces solver pressure at cell centers');}
 assert.ok(Math.abs(V.dot(a.force,w)-a.drag)<1e-8,'reported drag equals projection of total force');assert.ok(a.residual<1e-8);assert.ok(Math.abs(a.cells.reduce((v,c)=>v+c.area,0)-a.area)<1e-8);
}
const z=newState();z.windSpeed=0;const zero=evaluate(z,0);assert.equal(zero.lift,0);assert.equal(zero.drag,0);assert.equal(zero.maxPressure,0);
const m=evaluate(newState(),6);assert.ok(Math.abs(m.polarEfficiency-6/m.polarTarget*100)<1e-10,'polar efficiency is actual speed divided by ORC target');
console.log('OK: flat-plate benchmark, grid refinement, pressure/force conservation, exact color samples, coefficient definitions, zero wind and polar ratio. These are numerical checks, not CFD validation.');
