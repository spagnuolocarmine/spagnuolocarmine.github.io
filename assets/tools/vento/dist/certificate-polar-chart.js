// Visual representation of the *unmodified* ORC certificate allowances.
// Never interpolates an experimental sail design into the certified polar.
import {catalogPolarSpeed} from './polar.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=n=>Number(n).toFixed(1);
export function certificatePolarChart(polar,wind=12){
 if(!polar?.WindSpeeds?.length||!polar?.WindAngles?.length)return '<p class="certificate-empty">Polare del certificato non disponibile.</p>';
 const speeds=polar.WindSpeeds.filter(Number.isFinite),actual=Number.isFinite(wind)?Math.max(0,wind):12;
 // Compare the selected true wind with two clearly identified certificate wind speeds.
 const nearest=speeds.reduce((a,b)=>Math.abs(a-actual)<Math.abs(b-actual)?a:b,speeds[0]);
 const comparison=[speeds[Math.max(0,Math.floor((speeds.length-1)*.30))],speeds[Math.floor((speeds.length-1)*.78)]].filter((w,i,a)=>w!==nearest&&a.indexOf(w)===i);
 const curves=[...comparison.map((w,i)=>({wind:w,color:i===0?'#74b2cc':'#e0a46a',accent:false})),{wind:nearest,color:'#1a72b5',accent:true}];
 const maxSpeed=Math.max(2,Math.ceil(Math.max(...speeds.flatMap(w=>[40,52,60,75,90,110,120,135,150,170,180].map(a=>catalogPolarSpeed(polar,w,a))))/2)*2);
 const cx=176,cy=166,radius=135,coord=(angle,v)=>{const theta=angle*Math.PI/180,r=radius*Math.max(0,v)/maxSpeed;return [cx+r*Math.sin(theta),cy-r*Math.cos(theta)];};
 const pt=(angle,v)=>coord(angle,v).map(f).join(',');
 const grid=[.25,.5,.75,1].map(t=>`<circle cx="${cx}" cy="${cy}" r="${f(radius*t)}" fill="none" stroke="#d1dfeb" stroke-width="${t===1?1.3:.8}"/><text x="${cx+5}" y="${f(cy-radius*t-4)}" fill="#6a8395" font-size="10">${f(maxSpeed*t)} kn</text>`).join('');
 const lines=[0,30,60,90,120,150,180].flatMap(a=>a===0||a===180?[a]:[-a,a]).map(a=>`<line x1="${cx}" y1="${cy}" x2="${f(coord(a,maxSpeed)[0])}" y2="${f(coord(a,maxSpeed)[1])}" stroke="#dce6ef" stroke-width=".9"/>`).join('');
 const labels=[0,30,60,90,120,150,180].flatMap(a=>a===0||a===180?[a]:[-a,a]).map(a=>{const [x,y]=coord(a,maxSpeed*1.11);return`<text x="${f(x)}" y="${f(y+3)}" text-anchor="middle" font-size="10" fill="#516c7e">${Math.abs(a)}°</text>`;}).join('');
 const paths=curves.map(({wind,color,accent})=>{const samples=Array.from({length:145},(_,i)=>-180+i*2.5),d=samples.map((a,i)=>`${i?'L':'M'}${pt(a,catalogPolarSpeed(polar,wind,Math.abs(a)))}`).join(' ');return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${accent?3:1.8}" stroke-linejoin="round" stroke-linecap="round"${accent?'':' opacity=".85"'}><title>Polare ORC ${esc(wind)} kn</title></path>`;}).join('');
 const legend=curves.map(c=>`<span class="cert-polar-legend-item${c.accent?' selected':''}"><i style="background:${c.color}"></i>${esc(c.wind)} kn${c.accent?' · riferimento':''}</span>`).join('');
 return `<div class="cert-polar-graphic"><svg viewBox="0 0 352 344" role="img" aria-label="Grafico polare del certificato ORC: velocità della barca in nodi in funzione dell'angolo al vento su entrambe le mure, per diverse intensità del vento"><title>Polare originale ORC</title><g>${grid}${lines}${paths}<circle cx="${cx}" cy="${cy}" r="2.5" fill="#4f748a"/>${labels}</g><text x="${cx}" y="13" fill="#516c7e" text-anchor="middle" font-size="10">PRUA · 0°</text><text x="${cx}" y="338" fill="#516c7e" text-anchor="middle" font-size="10">POPPA · 180°</text></svg><div class="cert-polar-legend">${legend}</div><p class="cert-polar-note">Polare originale del certificato · velocità in kn. Linea blu: TWS del certificato più vicino ai ${esc(f(actual))} kn impostati. Le misure delle vele modificate non alterano questa polare.</p></div>`;
}
