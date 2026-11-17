import fs from 'node:fs';
import {rigIndex,matchRig} from '../dist/rig-match.js';
const goldPath=process.argv[2]||new URL('../dist/data/gold-boat.json',import.meta.url),sailingPath=process.argv[3]||new URL('../dist/data/sailing_database.json',import.meta.url),catalogPath=new URL('../dist/data/ita-orc.json',import.meta.url),gold=JSON.parse(fs.readFileSync(goldPath,'utf8').replace(/^\uFEFF/,'')),sailing=JSON.parse(fs.readFileSync(sailingPath,'utf8').replace(/^\uFEFF/,'')),index=rigIndex(gold,sailing),data=JSON.parse(fs.readFileSync(catalogPath)),before=structuredClone(data),counts={},sources={};
for(const boat of data.boats){boat.rig=matchRig(boat,index);counts[boat.rig.match]=(counts[boat.rig.match]||0)+1;sources[boat.rig.source]=(sources[boat.rig.source]||0)+1;}
// The join is allowed to change rig metadata only, never certificate areas or polars.
for(let i=0;i<data.boats.length;i++){const a={...data.boats[i]},b={...before.boats[i]};delete a.rig;delete b.rig;if(JSON.stringify(a)!==JSON.stringify(b))throw Error('Dati ORC alterati durante il collegamento.');}
fs.writeFileSync(catalogPath,JSON.stringify(data));console.log(JSON.stringify({newModels:sailing.length,usable:index.entries.length,boats:data.boats.length,matches:counts,sources,orcDataUnchanged:true}));
