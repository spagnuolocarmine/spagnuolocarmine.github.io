import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {GENERIC_BOAT} from '../dist/boats.js';
import {hasCertifiedPolar} from '../dist/polar-availability.js';
const code=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const start=code.indexOf('function syncPolarAvailability(){');
const end=code.indexOf('function refreshDataPolarChart(){');
assert.ok(start>0&&end>start);
const selectors=['.target-instrument','.header-efficiency','.polar-target-metric','.polar-efficiency-metric','#dataPolarChart','#telemetryCertificateNote'];
const els=new Map();
function element(){return{classes:new Set(),classList:{toggle(name,visible){if(visible)this.classes.add(name);else this.classes.delete(name);}},attrs:{},setAttribute(name,value){this.attrs[name]=value},getAttribute(name){return this.attrs[name]}};}
for(const s of [...selectors,'.header-telemetry','#telemetryTitle','#telemetryFold','[data-close-window="telemetry"]','#responseSpeedHelp']){
 const obj=element();obj.classList.classes=obj.classes;els.set(s,obj);
}
const context={state:{boat:GENERIC_BOAT},hasCertifiedPolar,$:s=>els.get(s),getLanguage:()=> 'it',t:(it,en)=>it};
vm.createContext(context);
vm.runInContext(code.slice(start,end),context);
vm.runInContext('syncPolarAvailability()',context);
for(const s of selectors)assert.equal(els.get(s).classes.has('hidden'),true,`sloop: ${s} hidden`);
assert.equal(els.get('#telemetryTitle').textContent,'Dati');
assert.equal(els.get('#responseSpeedHelp').textContent.includes('polare'),false);
assert.equal(els.get('.header-telemetry').classes.has('no-certificate-polar'),true);
context.state={boat:{...GENERIC_BOAT,id:'I12345',polar:{WindSpeeds:[6,12],WindAngles:[52,90]}}};
vm.runInContext('syncPolarAvailability()',context);
for(const s of selectors)assert.equal(els.get(s).classes.has('hidden'),false,`ORC: ${s} visible`);
assert.equal(els.get('#telemetryTitle').textContent,'Dati & polare');
assert.equal(els.get('.header-telemetry').classes.has('no-certificate-polar'),false);
context.state={boat:GENERIC_BOAT};
vm.runInContext('syncPolarAvailability()',context);
for(const s of selectors)assert.equal(els.get(s).classes.has('hidden'),true,`back to sloop: ${s} hidden`);
console.log('PASS: UI transition laboratory → ORC → laboratory hides and restores targets, percentages, gauge, chart, footer and accessible labels.');
