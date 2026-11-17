// A disabled control is a fixed physical setting, not a missing rope or force.
export const controlId=(category,key)=>`${category}.${key}`;
export const controlEnabled=(s,category,key)=>!Object.hasOwn(s.fixedControls||{},controlId(category,key));
export const hasFixedControls=s=>Object.keys(s.fixedControls||{}).length>0;
export function setControlEnabled(s,category,key,enabled){
 if(!Object.hasOwn(s.controls?.[category]||{},key))return;
 s.fixedControls??={};const id=controlId(category,key);
 if(enabled)delete s.fixedControls[id];
 else s.fixedControls[id]=s.controls[category][key];
}
export function restoreFixedControls(s){
 for(const [id,value] of Object.entries(s.fixedControls||{})){
  const [category,key]=id.split('.');
  if(Object.hasOwn(s.controls?.[category]||{},key)&&Number.isFinite(value))s.controls[category][key]=value;
 }
 return s;
}
