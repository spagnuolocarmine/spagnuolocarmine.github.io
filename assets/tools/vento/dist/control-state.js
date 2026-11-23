import {sheetLength} from './fixed-sheets.js';
// A disabled control is a fixed physical setting, not a missing rope or force.
export const controlId=(category,key)=>`${category}.${key}`;
// Direct twist is a static sail-design property, never an AUTO manoeuvre.
export const controlEnabled=(s,category,key)=>key!=='twist'&&!Object.hasOwn(s.fixedControls||{},controlId(category,key));
export const hasFixedControls=s=>Object.keys(s.fixedControls||{}).some(id=>!id.endsWith('.twist'));
export function setControlEnabled(s,category,key,enabled){
 if(key==='twist'||!Object.hasOwn(s.controls?.[category]||{},key))return;
 s.fixedControls??={};const id=controlId(category,key);
 if(enabled){if(key==='sheet'&&Number.isFinite(s.effectiveSheets?.[category]))s.controls[category].sheet=s.effectiveSheets[category];delete s.fixedControls[id];if(key==='sheet')delete s.fixedSheetLengths?.[category];}
 else {if(key==='sheet'){s.fixedSheetLengths??={};s.fixedSheetLengths[category]=sheetLength(category,s);}s.fixedControls[id]=s.controls[category][key];}
}
export function restoreFixedControls(s){
 for(const [id,value] of Object.entries(s.fixedControls||{})){
  const [category,key]=id.split('.');
  if(key==='twist')continue;
  if(Object.hasOwn(s.controls?.[category]||{},key)&&Number.isFinite(value))s.controls[category][key]=value;
 }
 return s;
}
