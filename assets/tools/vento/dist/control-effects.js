import {getLanguage} from './i18n.js';
import {headsailInhaulAllowed} from './orc-sails.js';
const effects={
 'main.halyard':['Sposta il grasso in avanti e distende l’inferitura.','Moves draft forward and tensions the luff.',['draft','camber']],
 'main.cunningham':['Tende la parte bassa dell’inferitura e porta il grasso in avanti.','Tensions the lower luff and moves draft forward.',['draft','camber']],
 'main.outhaul':['Appiattisce soprattutto la parte bassa della randa.','Flattens mainly the lower mainsail.',['camber']],
 'main.traveler':['Cambia l’angolo della randa mantenendo il tiro della scotta.','Changes mainsail angle while retaining sheet pull.',['requestedAngle','twist']],
 'main.sheet':['Chiude la randa e tende la balumina.','Trims the mainsail and tensions the leech.',['requestedAngle','twist']],
 'main.battens':['Sostiene il profilo; la risposta è più fine rispetto alla scotta.','Supports the section; its effect is finer than sheet trim.',['camber','twist']],
 'main.vang':['Cazzando abbassa il boma e chiude la balumina; con scotta lascata l’effetto è più marcato.','Hauling lowers the boom and closes the leech; the effect is stronger with an eased sheet.',['twist']],
 'main.twist':['Ruota le sezioni della randa gradualmente dalla base verso la testa.','Rotates mainsail sections progressively from foot to head.',['twist']],
 'genoa.twist':['Ruota le sezioni del fiocco/genoa gradualmente dalla base verso la testa.','Rotates jib/genoa sections progressively from foot to head.',['twist']],
 'genoa.car':['Avanti chiude la balumina; indietro apre la parte alta.','Forward closes the leech; aft opens the upper sail.',['twist','camber']],
 'genoa.barber':['Devia verso l’albero la scotta dei fiocchi fino al 105% di LP/J.','Moves the sheet inboard on jibs up to 105% LP/J.',['requestedAngle','twist']],
 'genoa.sheet':['Avvicina la bugna al rinvio e regola l’incidenza.','Pulls the clew towards its lead and changes incidence.',['requestedAngle','twist']],
 'genoa.halyard':['Tende l’inferitura e porta il grasso in avanti.','Tensions the luff and moves draft forward.',['draft','camber']],
 'genoa.battens':['Stabilizza la balumina del fiocco steccato.','Stabilises the battened jib leech.',['camber','twist']],
 'spinnaker.halyard':['Alza la testa e modifica la pienezza della vela.','Raises the head and changes sail fullness.',['camber','twist']],
 'spinnaker.sheet':['Regola la bugna sottovento e la pienezza del piede.','Controls the leeward clew and lower-sail fullness.',['camber','requestedAngle']],
 'spinnaker.brace':['Quadra o avanza il tangone, orientando la vela al vento.','Squares or advances the pole, orienting the sail to the wind.',['requestedAngle']],
 'spinnaker.poleLift':['Alza la varea e cambia l’equilibrio fra le ralinghe.','Raises the pole tip and changes the edge balance.',['camber','twist']],
 'spinnaker.barberSheet':['Tira la scotta verso la coperta; mollato non devia la scotta.','Pulls the sheet down toward the deck; fully eased does not deflect it.',['twist','camber']],
 'spinnaker.barberBrace':['Tira il braccio verso la coperta; mollato non devia il braccio.','Pulls the guy down toward the deck; fully eased does not deflect it.',['twist','camber']],
 'gennaker.halyard':['Alza la testa e tende l’inferitura.','Raises the head and tensions the luff.',['camber','draft']],
 'gennaker.tack':['Tesa stabilizza l’inferitura; lasca dà più profondità.','A taut tack steadies the luff; easing adds depth.',['camber','draft']],
 'gennaker.sheet':['Regola l’apertura della vela e la spalla sopravvento.','Controls sail opening and the windward shoulder.',['requestedAngle','camber']],
 'rig.backstay':['Curva l’albero, appiattisce la randa e sostiene lo strallo.','Bends the mast, flattens the main and supports the forestay.',['prebend','forestaySag']],
 'rig.forestay':['Riduce la catenaria e controlla la pienezza del fiocco.','Reduces sag and controls jib fullness.',['forestaySag']],
 'rig.shrouds':['Sostiene lateralmente l’albero sotto il carico delle vele.','Supports the mast laterally under sail load.',['mastDeflection']]
};
export function controlEffectInfo(id,state){const english=getLanguage()==='en',e=effects[id]||['Modifica il profilo sotto carico.','Changes the loaded sail shape.',['camber','twist']];let note='';if(id==='rig.forestay'&&state.foresail!=='genoa')note=english?'Without a hanked/luffed headsail, its effect is indirect.':'Senza fiocco inferito, l’effetto è indiretto.';else if(id==='main.traveler'&&Math.abs(state.windAngle)>110)note=english?'With an eased sheet or the boom at its shroud limit, its effect is small.':'Con scotta lasca o boma alle sartie, l’effetto è ridotto.';else if(id==='genoa.barber'&&!headsailInhaulAllowed(state))note=english?'The inhauler is unavailable above 105% LP/J.':'Il barber in non è disponibile oltre il 105% di LP/J.';return{description:e[english?1:0],fields:e[2],note};}
export const EFFECT_FIELDS={camber:['Profondità','Depth','%'],draft:['Posizione grasso','Draft position','%'],twist:['Svergolamento','Twist','°'],requestedAngle:['Apertura','Opening','°'],prebend:['Curvatura albero','Mast bend','cm'],forestaySag:['Catenaria strallo','Forestay sag','cm'],mastDeflection:['Flessione laterale','Lateral deflection','cm']};
