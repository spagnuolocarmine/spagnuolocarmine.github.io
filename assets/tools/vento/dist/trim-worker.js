import {computeReference,optimizeForReference,optimalControlSettings} from './trim-optimizer.js';
self.onmessage=e=>{const {id,state,applyAuto,controlId}=e.data;try{
 let lastTime=0,lastPercent=0,lastPhase='';const existing=e.data.reference,hasTrim=applyAuto||controlId,referenceShare=existing?0:hasTrim?.35:1;
 const emit=p=>{const progress=Math.max(lastPercent,Math.min(1,p.progress||0)),now=performance.now();if(now-lastTime<60&&p.phase===lastPhase&&progress<1)return;lastTime=now;lastPercent=progress;lastPhase=p.phase;self.postMessage({id,type:'progress',...p,progress});};
 const reference=existing||computeReference(state,p=>emit({...p,phase:'reference',progress:referenceShare*p.progress}));
 const progress=p=>emit({...p,progress:referenceShare+(1-referenceShare)*p.progress});
 if(controlId){const target=optimalControlSettings(state,reference,progress);self.postMessage({id,type:'result',reference,controlId,target});return;}
 const solution=applyAuto?optimizeForReference(state,reference,progress):null;
 self.postMessage({id,type:'result',reference,solution});
}catch(error){self.postMessage({id,type:'error',message:String(error.message||error)});}};
