import {compareControlStates} from './control-effect-analysis.js';
self.onmessage=e=>{const {id,state,beforeControls,reference,key}=e.data;try{self.postMessage({id,key,result:compareControlStates(state,beforeControls,reference)});}catch(error){self.postMessage({id,key,error:String(error.message||error)});}};
