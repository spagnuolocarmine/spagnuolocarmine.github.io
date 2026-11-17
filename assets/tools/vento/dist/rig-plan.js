import {lerp} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
import {sailPoint,mastPoint,forestayPoint,windSide,mainBoomPoint} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/sail-geometry.js';
import {flyingSheetLead} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/sheet-travel.js';
import {shroudPath} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/standing-rig.js';
import {DECK,deckLayout,mainTravelerPosition,mainSheetLead,genoaLeadGeometry} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/deck-layout.js';
import {spinPoleRig} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/orc-sails.js';
// Physical polylines in boat coordinates; each visible adjustable line identifies one control.
export function rigPlan(s){const out=[],d=deckLayout(s),side=windSide(s),top=mastPoint(1,s),main=s.main,genoa=s.foresail==='genoa',spin=s.foresail==='spinnaker',genn=s.foresail==='gennaker';
 const boomPoint=t=>mainBoomPoint(t,s);
 const add=(id,part,points,active=true)=>{const [cat,key]=id.split('.'),value=s.controls[cat]?.[key],slack=(key==='sheet'||(cat==='spinnaker'&&key==='brace'))?Math.max(0,1-value/18):0;if(slack&&points.length>1){const curved=[];for(let j=0;j<points.length-1;j++)for(let i=0;i<6;i++){const t=i/6,p=points[j].map((x,k)=>lerp(x,points[j+1][k],t));p[1]-=Math.sin(Math.PI*t)*slack*.45;curved.push(p);}curved.push(points.at(-1));points=curved;}out.push({id,part,points,active});};const P=(t,v,u)=>sailPoint(t,v,u,s);
 add('rig.forestay','forestay',Array.from({length:33},(_,i)=>forestayPoint(i/32,s)));
 add('rig.backstay','backstay',Array.from({length:25},(_,i)=>{const v=i/24;return[lerp(0,top[0],v)+.18*(1-s.controls.rig.backstay/100)*Math.sin(Math.PI*v),lerp(.93,top[1],v),lerp(-4.9,top[2],v)];}));
 for(const sign of [-1,1])add('rig.shrouds',sign<0?'port':'starboard',shroudPath(s,sign,32));
 const traveler=mainTravelerPosition(s),tackle=mainSheetLead(s),mainHead=P('main',1,0),mastBase=mastPoint(0,s);
 add('main.sheet','main-sheet',[boomPoint(DECK.mainSheetAttachment),tackle,[side*1.25,1.0,-3.12]],main);
 add('main.traveler','traveler-port',[tackle,[-d.cockpitHalfWidth,DECK.mainTrackY+.06,DECK.mainTrackZ],[-1.30,.98,-3.15]],true);
 add('main.traveler','traveler-starboard',[tackle,[d.cockpitHalfWidth,DECK.mainTrackY+.06,DECK.mainTrackZ],[1.30,.98,-3.15]],true);
 add('main.vang','vang',[[mastBase[0],1.22,mastBase[2]],boomPoint(.34)],main);
 add('main.outhaul','outhaul',[boomPoint(.92),boomPoint(1),P('main',0,1)].map(p=>[p[0],p[1]+.075,p[2]]),main);
 add('main.halyard','main-halyard',[[mainHead[0]+.10,mainHead[1],mainHead[2]],[top[0]+.11,top[1],top[2]],...[.8,.5,.2,0].map(v=>{const p=mastPoint(v,s);return[p[0]+.12,p[1],p[2]];}),[.35,.97,-1.43]],main);
 const cun=P('main',.045,0);add('main.cunningham','cunningham',[[cun[0]-.12,cun[1],cun[2]],[mastBase[0]-.17,1.26,mastBase[2]],[-.30,.97,-1.43]],main);
 const lead=genoaLeadGeometry(s),car=lead.car,ring=lead.ring,head=P('genoa',1,0);
 add('genoa.sheet','genoa-sheet',[P('genoa',0,1),...(Math.abs(lead.barber)>.0001?[ring]:[]),lead.lead,lead.winch],genoa);
 add('genoa.halyard','genoa-halyard',[[head[0]-.11,head[1],head[2]],[top[0]-.12,top[1],top[2]],...[.8,.5,.2,0].map(v=>{const p=mastPoint(v,s);return[p[0]-.13,p[1],p[2]];}),[-.39,.97,-1.43]],genoa);
 add('genoa.barber','genoa-barber',[[side*.35,.96,car[2]],ring,[side*1.62,.96,car[2]]],genoa);
 const sc=P('spinnaker',0,0),ss=P('spinnaker',0,1),braceDrop=.30+.60*s.controls.spinnaker.barberBrace/100,sheetDrop=.30+.60*s.controls.spinnaker.barberSheet/100,braceRing=[lerp(sc[0],-side*1.55,braceDrop),lerp(sc[1],.98,braceDrop),lerp(sc[2],-2.2,braceDrop)],sheetRing=[lerp(ss[0],side*1.60,sheetDrop),lerp(ss[1],.98,sheetDrop),lerp(ss[2],-2.15,sheetDrop)];
 add('spinnaker.brace','spinnaker-brace',[sc,braceRing,[-side*1.55,.98,-2.2]],spin);add('spinnaker.sheet','spinnaker-sheet',[ss,sheetRing,flyingSheetLead('spinnaker',s)],spin);
 add('spinnaker.barberBrace','spinnaker-barber-brace',[braceRing,[-side*1.58,.95,1.1]],spin);add('spinnaker.barberSheet','spinnaker-barber-sheet',[sheetRing,[side*1.58,.95,-.2]],spin);
 const pole=spinPoleRig(s);add('spinnaker.poleLift','pole-topping-lift',[mastPoint(.65,s),pole.tip],spin);add('spinnaker.poleLift','pole-downhaul',[pole.tip,[0,.96,pole.root[2]+.7],[.15,.96,-1.40]],spin);
 for(const [type,active] of [['spinnaker',spin],['gennaker',genn]]){const head=P(type,1,0);add(type+'.halyard',type+'-halyard',[head,[top[0],top[1],top[2]+.12],...[.8,.5,.2,0].map(v=>{const p=mastPoint(v,s);return[p[0]+.16,p[1],p[2]];}),[.45,.97,-1.4]],active);}
 add('gennaker.tack','gennaker-tack',[P('gennaker',0,0),[0,.95,P('gennaker',0,0)[2]],[.18,.94,3.7]],genn);add('gennaker.sheet','gennaker-sheet',[P('gennaker',0,1),flyingSheetLead('gennaker',s),[side*1.3,1.1,-2.15]],genn);
 return out;
}
