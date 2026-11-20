import english from './i18n-en.js';

const LANGUAGE_KEY='vento.language';
let language='it';
try{if(globalThis.window?.localStorage?.getItem(LANGUAGE_KEY)==='en')language='en';}catch{}
export const getLanguage=()=>language;
export const getLocale=()=>language==='en'?'en-GB':'it-IT';
const fragments={
 'm di cima fermata · posizione calcolata sotto carico':'m of secured rope · position calculated under load',
 'pressione / separazione ammessa':'pressure mode / separation allowed','scala ':'scale ',
 'modello corrispondente':'matching model','modello compatibile':'compatible model','modello simile, scalato sulla lunghezza':'similar model, scaled to length',
 'Armo parametrico del laboratorio.':'Parametric laboratory rig.','Armo stimato da una barca simile':'Rig estimated from a similar boat','Armo da modello compatibile':'Rig from a compatible model',
 '* Isp, SPL e TPS sono stime dichiarate: altezza e tipo d’armo disponibili, tangone assunto lungo J e bompresso stimato.':'* Isp, SPL and TPS are declared estimates: available rig height and type, pole assumed equal to J and estimated bowsprit.',
 'Superfici e polare esclusivamente ORC.':'Areas and polar exclusively from ORC.','Lande interne per vela sovrapposta':'Inboard chainplates for overlapping sails','Lande in falchetta per vela non sovrapposta':'Rail chainplates for non-overlapping sails',
 'Armo in testa stimato':'Estimated masthead rig','Armo frazionato stimato':'Estimated fractional rig','strallo al':'forestay at','Fonte':'Source','scala':'scale','dal centro':'from center','sovrapposizione':'overlap','LP/J ricostruito':'reconstructed LP/J',
 'Aree del certificato.':'Certificate areas.','stimato':'estimated','stimati':'estimated','Corde modificabili a parità di m².':'Widths can be edited while preserving m².',
 'Inferitura adattata oltre l’intervallo guida per conservare i m² ORC; verifica le corde reali se disponibili.':'Luff adjusted outside the guidance range to preserve ORC m²; check actual measurements if available.',
 'Scotta mollata: vela in bandiera, pressione portante scarica e cima lasca.':'Sheet fully eased: sail streams freely, lift pressure is released and the rope is slack.',
 'Superficie del certificato · corde modificabili a parità di area':'Certificate area · editable widths at fixed area','Non presente':'Not available',
 'della corsa utile · 0 libera · 100 massimo al rinvio':'of useful travel · 0 free · 100 closest to lead','tensione relativa':'relative tension','verso l’albero':'toward the mast','verso l’esterno':'outboard','interno':'inboard','esterno':'outboard','sul carrello':'at the car',
 'dal fine corsa di poppa · carrelli simmetrici':'from aft end stop · symmetric cars','m dal riferimento dell’acqua · caricalto e caricabasso coordinati':'m above water reference · topping lift and downhaul coordinated',
 'Varea a':'Pole end at','Varea':'Pole end','dislivello bugne':'clew height difference','sopravento':'windward','sopravvento':'windward','sottovento':'leeward','scotta':'sheet','corda':'chord',
 'Passo 1 mm · corsa':'1 mm steps · travel','in metri':'in metres','posizione esatta':'exact position','da dritta':'from starboard','da sinistra':'from port','da prua':'from ahead','da poppa':'from astern','gradi':'degrees',
 'Vento app.':'Apparent wind','tiro verso il rinvio':'pull toward the lead','dall’orizzontale':'from horizontal','tiro stimato':'estimated pull','limite sartie/crocette':'shroud/spreader limit',
 'Scorre su':'Travels on','m di binario, dal pozzetto a poppa fino a':'m of track, from the cockpit aft to','m a prua delle sartie; comprende il rinvio arretrato per i genoa grandi.':'m forward of the shrouds; includes an aft lead for large genoas.',
 'Appiattisci la randa':'Flatten the mainsail','Barca sovrainvelata':'Overpowered','Barca sovrainvelata':'Overpowered','Barca sovrainvelata':'Overpowered',
 'disponibile':'available','da regolare':'needs trim','non dichiarata':'not declared','Tipologia non dichiarata nel file ORC':'Type not declared in the ORC file','Modello didattico':'Educational model','Profilo ricostruito':'Reconstructed profile',
 'area del file':'file area','Una vela attiva':'One active sail','2 vele attive':'2 active sails','1 vela attiva':'1 active sail',
 'Apertura limitata dal contatto con le sartie:':'Opening limited by shroud contact:','al boma.':'at the boom.','FORMA DELLA RANDA':'MAINSAIL SHAPE','FORMA DEL GENOA':'GENOA SHAPE','FORMA DEL GENNAKER':'GENNAKER SHAPE','FORMA DELLO SPINNAKER':'SPINNAKER SHAPE',
 'Pausa':'Pause','Chiudi':'Close','Espandi':'Expand','Minimizza':'Minimize','Sposta':'Move','Trascina':'Drag','trascina o usa le frecce':'drag or use arrow keys','dati della forma':'shape data','condizioni del vento':'wind conditions','dati di navigazione':'sailing data','legenda pressione':'pressure legend','piano velico':'sail plan',
 'Cerca per nome, modello o numero velico.':'Search by name, model or sail number.','barche ORC':'ORC boats','campi nella sezione':'fields in this section','campi complessivi nel record':'total fields in the record',' di ':' of ',
 'pannelli · residuo':'panels · residual','flusso potenziale':'potential flow','flusso aderente':'attached flow','Flusso aderente':'Attached flow',
 'Certificato':'Certificate','Emesso':'Issued','Caricamento dati di':'Loading data for','polare e inventario caricati.':'polar and sail inventory loaded.','Miglior equilibrio trovato:':'Best equilibrium found:','della polare con queste vele.':'of the polar with these sails.','Ricerca interrotta:':'Search interrupted:',
 'Angoli tabulati:':'Tabulated angles:','Le tabelle DW/CR/WL sono tempi aggregati di percorso.':'DW/CR/WL tables contain aggregated course times.','Tempo a':'Time at',
 'Questa vela rende meglio a un’andatura più larga. Seleziona':'This sail performs better on a broader heading. Select','per risalire il vento; AUTO ottimizza la vela scelta.':'to sail upwind; AUTO optimizes your selected sail.',
 'LA TUA BARCA':'YOUR BOAT','VELA DI PRUA':'HEADSAIL','RANDA':'MAINSAIL','GENOA':'GENOA','FIOCCO':'JIB','MANOVRE FISSE':'STANDING RIGGING',
 'Regata':'Racing','sartie':'shrouds','strallo':'forestay','grasso':'draft','balumina':'leech','inferitura':'luff',
};
const dictionary={...fragments,...english};
const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const phrases=Object.entries(dictionary).filter(([a,b])=>a!==b&&a.length<=190).sort((a,b)=>b[0].length-a[0].length);
const phrasePattern=new RegExp(phrases.map(([a])=>escapeRE(a)).join('|'),'gu');
const replacement=new Map(phrases);
const letter=c=>!!c&&/[A-Za-zÀ-ÿ]/.test(c);
export function translate(value,lang=language){
 const raw=String(value??'');if(lang!=='en'||!raw.trim())return raw;
 const normalized=raw.trim().replace(/\s+/g,' '),exact=dictionary[normalized];
 if(exact!==undefined)return raw.slice(0,raw.length-raw.trimStart().length)+exact+raw.slice(raw.trimEnd().length);
 return raw.replace(phrasePattern,(match,offset,whole)=>{
  if((letter(match[0])&&letter(whole[offset-1]))||(letter(match.at(-1))&&letter(whole[offset+match.length])))return match;
  return replacement.get(match)||match;
 });
}

// Keep the Italian source per node so repeated dynamic updates and switching back
// never translate a previous translation. No certificate values or identifiers change.
export function initI18n(){
 const root=document.body,select=document.getElementById('languageSelect'),texts=new WeakMap(),attributes=new WeakMap();
 const attrNames=['title','aria-label','aria-valuetext','placeholder','data-label'];
 let observer;
 const sourceValue=(cache,current)=>!cache||current!==cache.last?current:cache.source;
 const skipText=node=>node.parentElement?.closest('[data-i18n-skip],#languageSelect,#boatResults,code,script,style')||
  (node.parentElement?.closest('#certificateContent td')&&!['Non indicato','Sì','No'].includes(node.textContent.trim()));
 const localize=node=>{
  if(node.nodeType===3){
   if(skipText(node))return;const current=node.nodeValue,source=sourceValue(texts.get(node),current),last=translate(source);
   if(current!==last)node.nodeValue=last;texts.set(node,{source,last});return;
  }
  if(node.nodeType!==1||/^(SCRIPT|STYLE|CODE)$/.test(node.tagName))return;
  if(!node.hasAttribute('data-i18n-skip')){
   const cache=attributes.get(node)||{};
   for(const name of attrNames){const current=node.getAttribute(name);if(current===null)continue;const source=sourceValue(cache[name],current),last=translate(source);if(current!==last)node.setAttribute(name,last);cache[name]={source,last};}
   attributes.set(node,cache);
  }
  for(const child of node.childNodes)localize(child);
 };
 const observe=()=>observer?.observe(root,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attrNames});
 const refresh=()=>{observer?.disconnect();localize(root);observe();};
 if(window.MutationObserver){
  observer=new window.MutationObserver(records=>{
   observer.disconnect();const nodes=new Set();for(const r of records){if(r.type==='childList')for(const n of r.addedNodes)nodes.add(n);else nodes.add(r.target);}
   for(const n of nodes)if(n.isConnected)localize(n);observe();
  });
 }
 const apply=next=>{
  if(!['it','en'].includes(next))return;
  observer?.disconnect();language=next;document.documentElement.lang=language;select.value=language;
  try{window.localStorage?.setItem(LANGUAGE_KEY,language);}catch{}
  document.dispatchEvent(new CustomEvent('vento-languagechange',{detail:{language}}));
  localize(root);observe();
 };
 select.addEventListener('change',()=>apply(select.value));
 document.documentElement.lang=language;select.value=language;refresh();
 return{refresh,setLanguage:apply};
}
