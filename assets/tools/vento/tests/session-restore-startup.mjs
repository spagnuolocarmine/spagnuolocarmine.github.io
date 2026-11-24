import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const app=readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
const start=app.indexOf('function restoreUI(ui={}){');
const end=app.indexOf('\nif(savedSession){audioPreference=',start);
assert.ok(start>=0&&end>start,'restoreUI is present');
const restoreCode=app.slice(start,end);

function restoreCase(controlId,detail,available){
 const els=new Map(),restored=[];
 const fakeElement=()=>({open:false,style:{},scrollTop:0,attributes:{},classList:{toggle(){}},setAttribute(name,value){this.attributes[name]=value;}});
 els.set('#panView',fakeElement());
 const scope={
  CONTROL_DEFS:{genoa:[['barber'],['sheet']],main:[['sheet'],['twist']]},
  controlTab:'main',designType:'main',pickerQuery:'',pickerChoice:'',selectedControlId:null,currentView:'orbit',
  getLanguage:()=> 'it',i18n:{setLanguage(){}},panelTab:()=>{},renderControls:()=>{},renderSailMeasures:()=>{},
  advancedEditor:{restoreUIState:()=>{}},setFold:()=>{},syncDisplaySelections:()=>{},syncPause:()=>{},
  syncWindInputs:()=>{},syncAudioPreference:()=>{},syncQuickViews:()=>{},windows:{restore:()=>{restored.push('windows')}},
  openDirectControl({id}){if(available){scope.selectedControlId=id;els.set('#controlShapeLegend',fakeElement());}},
  openSailDesign:()=>{},designDrag:{place:()=>{}},
  $:selector=>els.get(selector)||null,$$:()=>[],document:{getElementById:()=>null}
 };
 vm.createContext(scope);vm.runInContext(restoreCode,scope);
 const ui={selectedControlId:controlId,details:{controlShapeLegend:detail},panelTab:'sails',view:'orbit'};
 assert.doesNotThrow(()=>scope.restoreUI(ui),`saved control ${controlId} should never stop boot`);
 assert.equal(restored.length,2,'rest of session restoration completes');
 return {scope,els};
}
const unsupported=restoreCase('genoa.barber',true,false);
assert.equal(unsupported.scope.selectedControlId,null,'unsupported old barber is not restored');
assert.equal(unsupported.els.has('#controlShapeLegend'),false);
const allowed=restoreCase('genoa.sheet',true,true);
assert.equal(allowed.scope.selectedControlId,'genoa.sheet');
assert.equal(allowed.els.get('#controlShapeLegend').open,true,'valid details state restored');
const closed=restoreCase('main.sheet',false,true);
assert.equal(closed.els.get('#controlShapeLegend').open,false,'closed legend state restored');
restoreCase('genoa.nonexistent',true,false);
restoreCase('main.twist',true,false);

// A malformed/migrated user session must not abort the later dynamic import
// of SailingScene, which is responsible for rendering the boat.
const bootStart=app.indexOf('\nif(savedSession){audioPreference=',end);
const bootEnd=app.indexOf('\nfunction restoreAudioOnGesture',bootStart);
assert.ok(bootStart>=0&&bootEnd>bootStart);
assert.ok(app.indexOf("await import('./scene.js')",bootEnd)>bootEnd);
const warning=[];
const scope={savedSession:{ui:{},runtime:{elapsed:37}},audioPreference:false,elapsed:0,
 history:Array(61).fill(0),selectedControlId:'genoa.barber',
 $:()=>({classList:{add(){}}}),restoreUI:()=>{throw Error('Legacy UI problem')},
 console:{warn:(...args)=>warning.push(args)}};
vm.createContext(scope);
vm.runInContext(app.slice(bootStart,bootEnd),scope);
assert.equal(warning.length,1,'malformed UI logged but does not stop initialization');
assert.equal(scope.elapsed,37,'runtime restoration continues despite UI error');
assert.equal(scope.selectedControlId,null,'partially restored direct control is discarded');
console.log('PASS: unavailable barber, valid saved control, twist exclusion, malformed UI recovery and nonblocking scene startup.');
