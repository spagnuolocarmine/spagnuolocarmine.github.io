import {enableDialogDrag} from './dialog-drag.js';
import {headerHeight} from './workspace-layout.js';

// A single docked workspace is shared by all rail actions. Only 3D rope controls
// retain their floating drag behaviour; opening an editor is an explicit modal.
export function createWindowWorkspace(){
 const $=s=>document.querySelector(s),panels=new Map(),info=$('#infoDialog'),direct=$('#directControl');
 const drawer=document.createElement('aside');drawer.id='workspaceDrawer';drawer.className='workspace-drawer';drawer.setAttribute('aria-label','Pannello strumenti');drawer.setAttribute('aria-hidden','true');drawer.inert=true;document.body.append(drawer);
 const owners={boat:$('#boatPicker'),guide:$('#guideButton'),about:$('#aboutButton'),credits:$('#creditsButton')},ownerButton=key=>owners[key==='certificate'?'boat':key];
 let active=null,owner=null,switching=false,z=600;
 const viewport=()=>{const left=window.innerWidth<=760?56:76,top=headerHeight();return{left,top,width:window.innerWidth-left,height:Math.max(0,Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight)-top)};};
 const directDrag=enableDialogDrag(direct,$('#directControlMove'),null,{viewport});
 const raise=el=>{if(el===direct)el.style.zIndex=String(++z);};
 function sync(){for(const [id,p]of panels){const selected=active===id;p.button.classList.toggle('active',selected);p.button.setAttribute('aria-expanded',String(selected));}for(const [key,button]of Object.entries(owners)){const selected=active==='infoDialog'&&button===ownerButton(owner);button.classList.toggle('active',selected);button.setAttribute('aria-expanded',String(selected));}}
 function hideSections(except){for(const [id,p]of panels){const visible=id===except;p.el.classList.toggle('hidden',!visible);p.el.inert=!visible;p.el.setAttribute('aria-hidden',String(!visible));p.el.classList.remove('minimized');}if(except!=='infoDialog'&&info.hasAttribute('open')){switching=true;info.close();switching=false;}info.inert=except!=='infoDialog';}
 function select(id,focus=false){const opening=active===null;active=id;hideSections(id);drawer.classList.add('is-open');drawer.setAttribute('aria-hidden','false');drawer.inert=false;drawer.dataset.activePanel=id;if(opening)drawer.dataset.openCount=String((Number(drawer.dataset.openCount)||0)+1);sync();if(focus)(id==='infoDialog'?$('#dialogMove'):panels.get(id)?.handle)?.focus({preventScroll:true});}
 function close(focus=true){const button=active==='infoDialog'?ownerButton(owner):panels.get(active)?.button;active=null;hideSections(null);drawer.classList.remove('is-open');drawer.setAttribute('aria-hidden','true');drawer.inert=true;delete drawer.dataset.activePanel;sync();if(focus)button?.focus({preventScroll:true});}
 const setOpen=(id,open,focus=true)=>{if(!panels.has(id))return;if(open)select(id,focus);else if(active===id)close(focus);};
 for(const id of ['windPanel','trimPanel','telemetry','viewPanel']){const el=$('#'+id),button=$(`[data-window="${id}"]`),handle=$('#'+id+'Move');el.classList.add('drawer-section');el.classList.remove('minimized');el.setAttribute('role','region');el.removeAttribute('aria-modal');el.style.cssText='';drawer.append(el);panels.set(id,{el,button,handle});el.classList.add('hidden');el.inert=true;button.addEventListener('click',()=>active===id?close():select(id,true));el.querySelector('[data-close-window]').addEventListener('click',()=>close());}
 info.classList.add('drawer-section');info.setAttribute('aria-modal','false');drawer.append(info);
 const anchor=el=>{if(el===info){if(active!=='infoDialog')select('infoDialog');return;}if(el===direct){const v=viewport(),width=direct.getBoundingClientRect().width;directDrag.place(v.left+v.width-width-16,v.top+20);raise(direct);}};
 const setInfoOwner=next=>{owner=next;info.dataset.panelOwner=next;const labels={boat:'Barca',certificate:'Certificato',guide:'Guida',about:'Modello',credits:'About'};$('#dialogMove').querySelector('span').textContent=labels[next]||'Informazioni';select('infoDialog');};
 const toggleInfo=(next,open)=>{if(active==='infoDialog'&&ownerButton(owner)===ownerButton(next))close();else open();};
 info.addEventListener('close',()=>{if(info.hasAttribute('open'))return;if(!switching&&active==='infoDialog'){close(false);ownerButton(owner)?.focus({preventScroll:true});}owner=null;delete info.dataset.panelOwner;sync();});
 function selectedSaved(saved={}){if(saved._drawer)return saved._drawer.open?saved._drawer.active:null;return Object.entries(saved).filter(([id,p])=>(panels.has(id)||id==='infoDialog')&&p?.open).sort((a,b)=>(b[1].z||0)-(a[1].z||0))[0]?.[0]||null;}
 const capture=()=>({...Object.fromEntries([...panels.keys(),'infoDialog'].map(id=>[id,{open:active===id,z:500}])),directControl:{open:!direct.classList.contains('hidden'),left:parseFloat(direct.style.left),top:parseFloat(direct.style.top),z:+direct.style.zIndex||600},_drawer:{open:active!==null,active,owner}});
 const restore=(saved={})=>{const id=selectedSaved(saved);if(panels.has(id))select(id);else if(id==='infoDialog'){if(info.hasAttribute('open'))select(id);}else close(false);if(saved.directControl?.open&&!direct.classList.contains('hidden'))anchor(direct);};
 const wantsInfo=saved=>selectedSaved(saved)==='infoDialog';
 const reset=()=>{close(false);owner=null;direct.style.left='';direct.style.top='';direct.style.right='';};
 const closeTop=closeDirect=>{if(!direct.classList.contains('hidden')){closeDirect?.();return true;}if(active){close();return true;}return false;};
 const fit=()=>{const height=Math.min(window.innerHeight,window.visualViewport?.height||window.innerHeight);document.documentElement.style.setProperty('--viewport-height',height+'px');document.documentElement.style.setProperty('--header-height',headerHeight()+'px');document.documentElement.classList.toggle('keyboard-open',window.innerHeight-height>120);directDrag.keepVisible();};window.addEventListener('resize',fit);window.visualViewport?.addEventListener('resize',fit);fit();
 return{setOpen,anchor,raise,setInfoOwner,toggleInfo,closeTop,capture,restore,reset,wantsInfo};
}
