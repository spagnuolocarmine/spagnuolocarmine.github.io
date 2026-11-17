// Damped angular response of the live jib. Offline trim search uses the steady balance.
import {RAD,clamp} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
import {genoaLeadGeometry} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/deck-layout.js';
export function advanceJibDynamics(state,dt){
 if(state.foresail!=='genoa'){delete state.jibAngleRad;delete state.jibAngularVelocity;delete state.jibSide;return;}
 const side=-(Math.sign(Math.sin(state.windAngle*RAD))||1);
 if(!Number.isFinite(state.jibAngleRad)){state.jibAngleRad=genoaLeadGeometry(state).equilibriumAngle*RAD;state.jibAngularVelocity=0;}
 if(state.jibSide&&state.jibSide!==side){state.jibAngleRad=-state.jibAngleRad;state.jibAngularVelocity=-(state.jibAngularVelocity||0);}
 state.jibSide=side;let remaining=Math.max(0,Math.min(dt,.05));
 for(let i=0;remaining>1e-8&&i<120;i++){
  const load=genoaLeadGeometry(state),inertia=Math.max(.01,load.inertia),omega=state.jibAngularVelocity||0,drag=load.rotationalDrag||0,effectiveDamping=load.damping+2*drag*Math.abs(omega),step=Math.min(remaining,1/180,.35*inertia/Math.max(1,effectiveDamping));
  let velocity=omega+(load.balanceResidual-load.damping*omega-drag*omega*Math.abs(omega))/inertia*step,angle=state.jibAngleRad+velocity*step;
  if(Math.abs(angle)>load.upperAngle){angle=clamp(angle,-load.upperAngle,load.upperAngle);velocity=0;}
  const target=load.equilibriumAngle*RAD;if(Math.abs(angle-target)<1e-5&&Math.abs(velocity)<1e-4){angle=target;velocity=0;}state.jibAngleRad=angle;state.jibAngularVelocity=velocity;remaining-=step;
 }
}
