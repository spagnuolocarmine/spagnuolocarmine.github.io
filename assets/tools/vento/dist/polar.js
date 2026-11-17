import {BOAT,clamp,lerp,RAD} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
import {boatProfile} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/boats.js';
const scale=BOAT.scale;
const winds=[4,6,8,10,12,14,16,20,24];
// ORC NEXT GEN IY 9.98 F, Asimmetrico.pdf, page 1. Angles include interpolated beat / run endpoints.
const angles=[40,52,60,75,90,110,120,135,150,180];
const nextPolars=[
[3.45,4.90,5.73,6.21,6.40,6.57,6.63,6.70,6.62],
[3.96,5.43,6.37,6.89,7.14,7.24,7.31,7.36,7.31],
[4.27,5.74,6.61,7.08,7.33,7.46,7.54,7.63,7.60],
[4.50,5.93,6.78,7.23,7.54,7.76,7.90,8.09,8.16],
[4.38,5.97,6.93,7.34,7.59,7.89,8.15,8.53,8.76],
[4.45,6.16,7.16,7.70,8.11,8.39,8.65,9.12,9.55],
[4.32,6.05,7.09,7.67,8.17,8.64,9.04,9.71,10.44],
[3.84,5.41,6.64,7.35,7.87,8.42,9.00,10.55,12.46],
[3.18,4.57,5.71,6.68,7.33,7.77,8.21,9.24,11.63],
[2.25,3.25,4.10,4.80,5.35,5.70,6.00,6.75,8.30]
];
function bracket(arr,x){let i=arr.findIndex(v=>v>=x);if(i<0)return[arr.length-2,arr.length-1,1];if(i===0)return[0,1,0];return[i-1,i,(x-arr[i-1])/(arr[i]-arr[i-1])];}
export function polarSpeed(tws,twa,state){
 const record=typeof state==='object'?boatProfile(state):null;if(record?.polar)return catalogPolarSpeed(record.polar,tws,twa);
 const a=Math.abs(twa);if(tws<=0||a<26)return 0;
 const [wi,wj,wt]=bracket(winds,clamp(tws,4,24));const [ai,aj,at]=bracket(angles,clamp(a,40,180));
 let v=lerp(lerp(nextPolars[ai][wi],nextPolars[ai][wj],wt),lerp(nextPolars[aj][wi],nextPolars[aj][wj],wt),at)*Math.sqrt(scale);

 if(tws<4)v*=tws/4;
 if(a<40)v*=clamp((a-26)/14)**1.4;
 if(tws>24)v*=1-.009*(tws-24);
 return Math.max(0,v);
}

// Rxx are time allowances in seconds per nautical mile. Beat/Run are VMG allowances, not boat speeds.
export function catalogPolarSpeed(p,tws,twa){const a=Math.abs(twa);if(tws<=0||a<26)return 0;const [i,j,t]=bracket(p.WindSpeeds,clamp(tws,p.WindSpeeds[0],p.WindSpeeds.at(-1)));const atWind=index=>{const points=p.WindAngles.map(angle=>[angle,3600/p['R'+angle][index]]),beat=p.BeatAngle[index],run=p.GybeAngle[index];if(beat<points[0][0]&&beat>26)points.unshift([beat,3600/p.Beat[index]/Math.cos(beat*RAD)]);if(run>points.at(-1)[0]&&run<180)points.push([run,3600/p.Run[index]/Math.abs(Math.cos(run*RAD))]);const last=points.at(-1);points.push([180,last[1]*(1-.4*(180-last[0])/30)]);if(a<points[0][0])return points[0][1]*clamp((a-26)/(points[0][0]-26))**1.4;const [ai,aj,f]=bracket(points.map(x=>x[0]),clamp(a,points[0][0],180));return lerp(points[ai][1],points[aj][1],f);};let v=lerp(atWind(i),atWind(j),t);if(tws<p.WindSpeeds[0])v*=tws/p.WindSpeeds[0];if(tws>p.WindSpeeds.at(-1))v*=Math.max(.7,1-.009*(tws-p.WindSpeeds.at(-1)));return Math.max(0,v);}
