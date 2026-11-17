// Guidance is diagnostic: positive finite measurements remain independently editable.
import {MEASURE_FIELDS,defaultSailDesigns,sailDesign,strictMeasuredProfile,strictFlyingCut} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/sail-measures.js';
import {headsailScale,boatProfile} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/boats.js';
export function editableDesign(type,s){const m={...sailDesign(type,s)};if(type==='genoa'&&!m.exploratory){const scale=headsailScale(s);for(const [key] of MEASURE_FIELDS.genoa)if(key!=='HLU')m[key]*=scale;}return m;}
export function positiveMeasurements(type,m){for(const [key] of MEASURE_FIELDS[type])if(!Number.isFinite(m[key])||m[key]<=0)throw Error(`${key}: inserisci una misura positiva in metri.`);return true;}
export function designWarnings(type,m,s){
 const warnings={},add=(keys,text)=>{for(const key of keys)(warnings[key]??=[]).push(text);},boat=boatProfile(s),ref=defaultSailDesigns(boat)[type],keys=MEASURE_FIELDS[type].map(([key])=>key);
 for(const key of keys){if(!Number.isFinite(m[key])||m[key]<=0)add([key],'Inserisci una misura positiva e finita.');else if(m[key]<ref[key]*.25||m[key]>ref[key]*2.5)add([key],'Misura molto distante dalla vela di riferimento.');}
 if(type==='main'||type==='genoa'){
  const main=type==='main',height=main?'P':'HLU',base=main?'E':'HLP',widths=main?['E','MQW','MHW','MTW','MUW','MHB']:['HLP','HQW','HHW','HTW','HUW','HHB'];
  for(let i=1;i<widths.length;i++)if(m[widths[i]]>m[widths[i-1]]*1.15)add([widths[i]],'La corda aumenta eccessivamente rispetto alla sezione inferiore.');
  const bands=main?[[.45,1.15],[.2,.95],[.06,.75],[.02,.60],[.001,.55]]:[[.45,1.05],[.2,.85],[.05,.65],[.015,.45],[.001,.25]];
  bands.forEach(([lo,hi],i)=>{const ratio=m[widths[i+1]]/m[base];if(ratio<lo||ratio>hi)add([widths[i+1]],'Proporzione insolita rispetto alla base della vela.');});
  const rig=boat.rig;if(main){if(m.P>(rig?.P||defaultSailDesigns(boat).main.P)*1.02)add(['P'],'Inferitura superiore allo spazio disponibile nell’armo.');if(m.E>(rig?.E||defaultSailDesigns(boat).main.E)*1.03)add(['E'],'Base superiore alla lunghezza di riferimento del boma.');}else if(m.HLU>Math.hypot(rig?.I||13.55*boat.length/10,rig?.J||4.32*boat.length/10)*1.02)add(['HLU'],'Inferitura superiore alla lunghezza dello strallo.');
  try{strictMeasuredProfile(type,m);}catch{add([height,...widths],'Le corde non ammettono una balumina regolare: forma approssimata.');}
 }else{
  const ratio=m.SHW/m.SFL;if(ratio<.75||ratio>(type==='spinnaker'?1.15:1.08))add(['SHW'],'Rapporto SHW/SFL fuori dalle proporzioni indicative di un portante.');
  if(type==='spinnaker'&&Math.abs(m.SLU-m.SLE)>.01*Math.max(m.SLU,m.SLE))add(['SLU','SLE'],'Uno spinnaker simmetrico richiede ralinghe uguali.');
  if(type==='gennaker'&&(m.SLE/m.SLU<.7||m.SLE/m.SLU>1.02))add(['SLE'],'Rapporto balumina/inferitura insolito per un gennaker A2.');
  if(m.SLU+m.SLE<=m.SFL||Math.abs(m.SLU-m.SLE)>=m.SFL)add(['SLU','SLE','SFL'],'Le lunghezze non formano una vela reale: forma approssimata.');
  try{strictFlyingCut(type,m);}catch{add(keys,'Misure incompatibili con un taglio regolare: forma approssimata.');}
 }
 return warnings;
}
