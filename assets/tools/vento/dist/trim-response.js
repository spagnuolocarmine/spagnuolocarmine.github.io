// Assumed cloth and load-support response, calibrated for this educational model.
// TWS drives a monotone C1 curve: useful at 8 kn, near maximum at 20, maximum at 30.
import {clamp} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
const softplus=x=>Math.max(0,x)+Math.log1p(Math.exp(-Math.abs(x)));
export const smoothBound=(x,lo,hi,k=.006)=>lo+k*(softplus((x-lo)/k)-softplus((x-hi)/k));
const knots=[[4,0],[8,.25],[12,.50],[16,.75],[20,.93],[24,.98],[30,1]];
export function windDemand(tws){if(tws<=4)return 0;if(tws>=30)return 1;let i=1;while(tws>knots[i][0])i++;const a=knots[i-1],b=knots[i],h=b[0]-a[0],t=(tws-a[0])/h,slope=j=>{if(j===0||j===knots.length-1)return 0;const l=(knots[j][1]-knots[j-1][1])/(knots[j][0]-knots[j-1][0]),r=(knots[j+1][1]-knots[j][1])/(knots[j+1][0]-knots[j][0]);return 2*l*r/(l+r);};return(2*t**3-3*t*t+1)*a[1]+(t**3-2*t*t+t)*h*slope(i-1)+(-2*t**3+3*t*t)*b[1]+(t**3-t*t)*h*slope(i);}
export function windTrimResponse(tws,twa=52){const demand=windDemand(tws),reach=clamp((Math.abs(twa)-70)/80);return{demand,battens:35+60*demand,halyard:100*demand,draft:.40+.04*reach,mainCamber:.17-.08*demand+.035*reach,genoaCamber:.16-.06*demand+.025*reach,mainTwist:4+12*demand+5*reach,genoaTwist:5+10*demand+7*reach};}
export function autoTensionRange(cat,key,tws){const essential=cat==='rig'||(['main','genoa','spinnaker','gennaker'].includes(cat)&&key==='halyard'),d=windDemand(tws);return essential?[Math.max(0,108*d-8),100]:[0,100];}
export function rigPressureSupport(type,s){const d=windDemand(s.windSpeed),r=s.controls.rig,deficit=u=>Math.max(0,d-u/100),shroud=1/(1+2.5*deficit(r.shrouds)**2),back=1/(1+(type==='main'?2.8:.65)*deficit(r.backstay)**2),fore=type==='genoa'?1/(1+3.0*deficit((r.forestay+.2*r.backstay)/1.2)**2):1;return shroud*back*fore;}
export function profileQuality(type,shape,s,h=.4){if(type!=='main'&&type!=='genoa')return 1;const r=windTrimResponse(s.windSpeed,s.windAngle),camber=type==='main'?r.mainCamber+.012*(1-h)**2:r.genoaCamber,twist=type==='main'?r.mainTwist:r.genoaTwist;return 1/(1+.70*((shape.draft-r.draft)/.075)**2+(type==='main'?.70:.30)*((shape.camber-camber)/(type==='main'?.055:.07))**2+.35*((shape.twist-twist)/12)**2);}

export function battenPressureSupport(type,shape,s,h){if(!shape.battened)return 1;const r=windTrimResponse(s.windSpeed,s.windAngle),value=s.controls[type].battens,error=(value-r.battens)/50,weight=error<0?1.3+1.2*r.demand:.5;return 1/(1+weight*error*error*(.2+.8*h*h));}
// Shared by the drawn headsail and its sheet/rig clearance calculation.
export const headsailCamber=(c,sag,footClosing,battened)=>smoothBound(.09+sag*.22-footClosing*.025-c.halyard*.00025+(battened?(c.battens-50)*.0004:0),.04,.23);
export const headsailDraft=(c,weather)=>smoothBound(weather.draft+.14*weather.demand-c.halyard*.0014,.24,.61,.008);
