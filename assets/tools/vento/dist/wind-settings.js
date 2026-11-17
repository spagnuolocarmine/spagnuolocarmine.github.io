import {clamp} from 'https://spagnuolocarmine.github.io/assets/tools/vento/dist/constants.js';
export function windLayout(value=1){const density=clamp(Number.isFinite(value)?value:1,.5,4),streams=Math.round(12*density),perStream=Math.round(22*Math.sqrt(density));return{density,streams,perStream,particles:streams*perStream};}
