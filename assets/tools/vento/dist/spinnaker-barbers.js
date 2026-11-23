import {clamp,lerp} from './constants.js';
import {flyingSheetLead} from './flying-leads.js';
// The spinnaker twings (barbers) are independent lines pulling a *ring* on
// the sheet/guy toward an attachment on deck. With zero tension the ring
// lies on the unrestricted, straight sheet/guy and introduces no deflection.
// 100% brings the ring just above the deck attachment; easing interpolates
// continuously back to that unconstrained path. The two sides are symmetric
// in mechanics but have distinct deck attachment locations.
const blend=(a,b,f)=>a.map((x,i)=>lerp(x,b[i],f));
export function spinnakerBarberGeometry(state,{tack,clew}){
 const side=-(Math.sign(Math.sin(state.windAngle*Math.PI/180))||1);
 const sheetLead=flyingSheetLead('spinnaker',state);
 const braceLead=[-side*1.55,.98,-2.2];
 const sheetAnchor=[side*1.58,.95,-.20];
 const braceAnchor=[-side*1.58,.95,1.1];
 const sheetTension=clamp((state.controls.spinnaker.barberSheet||0)/100);
 const braceTension=clamp((state.controls.spinnaker.barberBrace||0)/100);
 const sheetFree=blend(clew,sheetLead,.43);
 const braceFree=blend(tack,braceLead,.43);
 const sheetDown=[sheetAnchor[0]*.99,sheetAnchor[1]+.18,sheetAnchor[2]+.10];
 const braceDown=[braceAnchor[0]*.99,braceAnchor[1]+.18,braceAnchor[2]-.10];
 return {
  sheet:{ring:blend(sheetFree,sheetDown,sheetTension),free:sheetFree,down:sheetDown,anchor:sheetAnchor,lead:sheetLead,tension:sheetTension},
  brace:{ring:blend(braceFree,braceDown,braceTension),free:braceFree,down:braceDown,anchor:braceAnchor,lead:braceLead,tension:braceTension}
 };
}
