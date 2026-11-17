import {computeReference,optimizeForReference,optimalControlSettings} from './trim-optimizer.js';
self.onmessage=e=>{const {id,state,applyAuto,controlId}=e.data;try{
 const progress=p=>self.postMessage({id,type:'progress',...p}),reference=e.data.reference||computeReference(state,progress);
 if(controlId){const target=optimalControlSettings(state,reference,progress);self.postMessage({id,type:'result',reference,controlId,target});return;}
 const solution=applyAuto?optimizeForReference(state,reference,progress):null;self.postMessage({id,type:'result',reference,solution});
}catch(error){self.postMessage({id,type:'error',message:String(error.message||error)});}};
