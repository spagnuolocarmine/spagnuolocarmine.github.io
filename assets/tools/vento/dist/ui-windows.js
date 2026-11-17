import {enableDialogDrag} from './dialog-drag.js';

// Opening one window leaves the others available; the rail stays above all windows.
export function createWindowWorkspace(){
 const $=s=>document.querySelector(s),panels=new Map(),positioned=new WeakSet(),drags=new WeakMap();
 const info=$('#infoDialog'),direct=$('#directControl');
 const viewport=()=>{const mobile=window.innerWidth<=760,left=mobile?56:76,top=mobile?62:72;return{left,top,width:Math.max(0,window.innerWidth-left),height:Math.max(0,Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight)-top)};};
 let z=30,owner=null;
 const raise=el=>{
  if(z>=900){const sorted=[...panels.values()].map(p=>p.el).concat(info,direct).sort((a,b)=>(+a.style.zIndex||0)-(+b.style.zIndex||0));sorted.forEach((node,i)=>node.style.zIndex=String(30+i));z=40;}
  el.style.zIndex=String(++z);
 };
 const anchor=el=>{
  const drag=drags.get(el),v=viewport();
  if(!positioned.has(el)){
   const count=[...panels.values()].filter(p=>!p.el.classList.contains('hidden')&&p.el!==el).length;
   drag.place(v.left+16+Math.min(count,3)*18,v.top+20+Math.min(count,3)*18);positioned.add(el);
  }else drag.keepVisible();
  raise(el);
 };
 const register=(el,handle)=>{
  drags.set(el,enableDialogDrag(el,handle,null,{viewport}));
  el.addEventListener('pointerdown',()=>raise(el));el.addEventListener('focusin',()=>raise(el));
 };
 const setOpen=(id,open,focus=true)=>{
  const panel=panels.get(id);if(!panel)return;
  const {el,button,handle}=panel;
  el.classList.toggle('hidden',!open);el.inert=!open;el.setAttribute('aria-hidden',String(!open));
  if(id==='trimPanel')el.classList.toggle('minimized',!open);
  button.classList.toggle('active',open);button.setAttribute('aria-expanded',String(open));
  if(open){anchor(el);if(focus)handle.focus({preventScroll:true});}
  else if(focus)button.focus({preventScroll:true});
 };
 for(const id of ['windPanel','trimPanel','telemetry','viewPanel']){
  const el=$('#'+id),button=$(`[data-window="${id}"]`),handle=$('#'+id+'Move');
  panels.set(id,{el,button,handle});register(el,handle);setOpen(id,false,false);
  button.addEventListener('click',()=>setOpen(id,el.classList.contains('hidden')));
  el.querySelector('[data-close-window]').addEventListener('click',()=>setOpen(id,false));
 }
 register(info,$('#dialogMove'));register(direct,$('#directControlMove'));
 const ownerButtons={boat:$('#boatPicker'),guide:$('#guideButton'),about:$('#aboutButton'),credits:$('#creditsButton')};
 const ownerButton=key=>ownerButtons[key==='certificate'?'boat':key];
 const setInfoOwner=next=>{
  owner=next;info.dataset.panelOwner=next;
  for(const [key,button] of Object.entries(ownerButtons)){const active=button===ownerButton(next);button.classList.toggle('active',active);button.setAttribute('aria-expanded',String(active));}
 };
 const toggleInfo=(next,open)=>{if(info.hasAttribute('open')&&ownerButton(owner)===ownerButton(next))info.close();else{setInfoOwner(next);open();}};
 info.addEventListener('close',()=>{
  const button=ownerButton(owner);owner=null;delete info.dataset.panelOwner;
  for(const b of Object.values(ownerButtons)){b.classList.remove('active');b.setAttribute('aria-expanded','false');}
  button?.focus({preventScroll:true});
 });
 const closeTop=closeDirect=>{
  const open=[...panels.values()].map(p=>p.el).filter(el=>!el.classList.contains('hidden'));
  if(info.hasAttribute('open'))open.push(info);
  if(!direct.classList.contains('hidden'))open.push(direct);
  const top=open.sort((a,b)=>+b.style.zIndex-+a.style.zIndex)[0];
  if(!top)return false;
  if(top===info)info.close();else if(top===direct)closeDirect?.();else setOpen(top.id,false);
  return true;
 };
 const fitViewport=()=>{const height=Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight);document.documentElement.style.setProperty('--viewport-height',height+'px');document.documentElement.classList.toggle('keyboard-open',window.innerHeight-height>120);queueMicrotask(()=>{for(const p of panels.values())drags.get(p.el).keepVisible();drags.get(info).keepVisible();drags.get(direct).keepVisible();});};
 window.addEventListener('resize',fitViewport);window.visualViewport?.addEventListener('resize',fitViewport);fitViewport();
 return{setOpen,anchor,raise,setInfoOwner,toggleInfo,closeTop};
}
