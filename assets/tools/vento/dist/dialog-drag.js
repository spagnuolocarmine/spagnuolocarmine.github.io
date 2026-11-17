import {clamp} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';

// An inset viewport keeps floating title bars clear of the rail and header.
export function enableDialogDrag(dialog,handle,container=null,options={}){
 let drag=null,moved=false;
 const viewport=()=>options.viewport?.()||(container?container.getBoundingClientRect():{left:0,top:0,width:window.innerWidth||1000,height:window.innerHeight||800});
 const bounds=()=>dialog.getBoundingClientRect();
 const visible=()=>!dialog.classList.contains('hidden')&&(dialog.tagName!=='DIALOG'||dialog.hasAttribute('open'));
 const place=(x,y)=>{
  const v=viewport(),r=bounds(),padding=12;
  dialog.style.position=container?'absolute':'fixed';dialog.style.margin='0';dialog.style.right='auto';dialog.style.bottom='auto';
  dialog.style.left=(clamp(x,v.left+padding,Math.max(v.left+padding,v.left+v.width-r.width-padding))-(container?v.left:0))+'px';
  dialog.style.top=(clamp(y,v.top+padding,Math.max(v.top+padding,v.top+v.height-r.height-padding))-(container?v.top:0))+'px';
  moved=true;
 };
 const keepVisible=()=>{if(moved&&visible()){const r=bounds();place(r.left,r.top);}};
 const center=()=>{const v=viewport(),r=bounds();place(v.left+(v.width-r.width)/2,v.top+(v.height-r.height)/2);};
 handle.addEventListener('pointerdown',e=>{
  if(e.button!==undefined&&e.button!==0)return;if(drag&&drag.id!==e.pointerId)return;
  const r=bounds();drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top};
  handle.setPointerCapture?.(e.pointerId);handle.focus();handle.classList.add('dragging');e.preventDefault();
 });
 handle.addEventListener('pointermove',e=>{if(drag&&drag.id===e.pointerId)place(drag.left+e.clientX-drag.x,drag.top+e.clientY-drag.y);});
 const end=e=>{if(!drag||e.pointerId!==drag.id)return;if(handle.hasPointerCapture?.(e.pointerId))handle.releasePointerCapture(e.pointerId);drag=null;handle.classList.remove('dragging');};
 for(const event of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(event,end);
 handle.addEventListener('dblclick',center);
 handle.addEventListener('keydown',e=>{
  const step=e.shiftKey?40:12,delta={ArrowLeft:[-step,0],ArrowRight:[step,0],ArrowUp:[0,-step],ArrowDown:[0,step]}[e.key];
  if(delta){const r=bounds();place(r.left+delta[0],r.top+delta[1]);e.preventDefault();}
  else if(e.key==='Home'){center();e.preventDefault();}
 });
 window.addEventListener('resize',keepVisible);
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(keepVisible).observe(dialog);
 return{place,center,keepVisible};
}
