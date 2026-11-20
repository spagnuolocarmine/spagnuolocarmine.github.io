import {sheetLength} from './fixed-sheets.js';
// A disabled control is a fixed physical setting, not a missing rope or force.
export const controlId=(category,key)=>`${category}.${key}`;
export const controlEnabled=(s,category,key)=>!Object.hasOwn(s.fixedControls||{},controlId(category,key));
export const hasFixedControls=s=>Object.keys(s.fixedControls||{}).length>0;
export function setControlEnabled(s,category,key,enabled){
 if(!Object.hasOwn(s.controls?.[category]||{},key))return;
 s.fixedControls??={};const id=controlId(category,key);
 if(enabled){if(key==='sheet'&&Number.isFinite(s.effectiveSheets?.[category]))s.controls[category].sheet=s.effectiveSheets[category];delete s.fixedControls[id];if(key==='sheet')delete s.fixedSheetLengths?.[category];}
 else {if(key==='sheet'){s.fixedSheetLengths??={};s.fixedSheetLengths[category]=sheetLength(category,s);}s.fixedControls[id]=s.controls[category][key];}
}
export function restoreFixedControls(s){
 for(const [id,value] of Object.entries(s.fixedControls||{})){
  const [category,key]=id.split('.');
  if(Object.hasOwn(s.controls?.[category]||{},key)&&Number.isFinite(value))s.controls[category][key]=value;
 }
 return s;
}
