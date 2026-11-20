import {BOAT,clamp} from './constants.js';
export const GENERIC_BOAT={id:'laboratorio-10',name:'Sloop laboratorio',model:'Regata · 10 m',sailNo:'LAB-10',certificate:'Riferimento didattico',issued:'2026',length:10,beam:BOAT.beam,draft:BOAT.draft,displacement:BOAT.displacement,areas:{main:BOAT.mainArea,genoa:BOAT.jib105Area,spinnaker:BOAT.spinnakerArea,gennaker:BOAT.gennakerArea},polar:null};
export const boatProfile=s=>s?.boat||GENERIC_BOAT;
export const isCertificateBoat=s=>boatProfile(s).id!==GENERIC_BOAT.id;
export const headsailScale=s=>isCertificateBoat(s)||s?.sailDesigns?.genoa?.exploratory?1:(s?.genoaSize||105)/105;
export const boatScale=s=>boatProfile(s).length/10;
export const beamRatio=s=>boatProfile(s).beam/(boatScale(s)*BOAT.beam);
export const hasSail=(type,s)=>Number(boatProfile(s).areas[type])>0||!!s?.sailDesigns?.[type]?.exploratory;
export function validateBoat(b){return !!b&&typeof b.id==='string'&&typeof b.name==='string'&&[b.length,b.beam,b.draft,b.displacement,b.areas?.main,b.areas?.genoa].every(n=>Number.isFinite(n)&&n>0)&&['main','genoa','spinnaker','gennaker'].every(t=>Number.isFinite(b.areas[t])&&b.areas[t]>=0);}
let catalogPromise;
export async function loadBoatCatalog(){if(!catalogPromise)catalogPromise=fetch(new URL('./data/ita-orc.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('Catalogo ORC non disponibile');return r.json();}).then(d=>{if(!Array.isArray(d.boats)||!d.boats.every(validateBoat))throw Error('Catalogo ORC non valido');return d.boats;}).catch(e=>{catalogPromise=null;throw e;});return catalogPromise;}
export function areaLimits(type,s){const b=boatProfile(s),reference=b.areas[type]||GENERIC_BOAT.areas[type]*boatScale(s)**2;return{min:Math.max(1,reference*.25),max:reference*2.3,step:.01,reference};}
export function findBoats(boats,query){const normalize=v=>String(v).normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase('it').replace(/[^\p{L}\p{N}]/gu,''),tokens=String(query||'').trim().split(/\s+/).map(normalize).filter(Boolean);return boats.filter(b=>{const haystack=normalize(`${b.name} ${b.model} ${b.sailNo} ${b.id}`);return tokens.every(token=>haystack.includes(token));});}
