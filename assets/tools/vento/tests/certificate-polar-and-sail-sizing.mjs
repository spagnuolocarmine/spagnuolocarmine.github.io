import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newState,evaluate,installReference,polarSpeed} from '../dist/physics.js';
import {referenceKey} from '../dist/trim-optimizer.js';
import {measuredArea} from '../dist/sail-measures.js';
import {certificatePolarChart} from '../dist/certificate-polar-chart.js';
const boats=JSON.parse(fs.readFileSync(new URL('../dist/data/ita-orc.json',import.meta.url),'utf8')).boats;
const boat=boats.find(b=>b.polar?.R90&&b.rig?.P&&b.rig?.I);
assert.ok(boat);
const graph=certificatePolarChart(boat.polar,12);
assert.ok(graph.includes('<svg')&&graph.includes('ORC')&&graph.includes('kn'));
assert.ok((graph.match(/<path /g)||[]).length>=3);
assert.ok(!graph.includes('NaN')&&!graph.includes('Infinity'));
const file=fs.readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
for(const absent of ['id="certificateDownload"','id="pressureScale"','id="pressureSigned"','class="speed-history"','id="autoQuality"','header-gauge-caption'])assert.ok(!file.includes(absent),absent);
const app=fs.readFileSync(new URL('../dist/app.js',import.meta.url),'utf8');
assert.ok(app.includes('modelCertificateLink')&&app.includes('certificatePolarChart(record.Allowances'));
assert.ok(!app.includes('download=`ORC-')&&!app.includes('exportCSV()'));

// Control case at fixed boat, course, wind and trim. The pressure solver's real
// physical surface changes must affect drive and target speed; the ORC target
// must remain unmodified, even when edited sail is larger than certified.
const s=newState();s.windSpeed=12;s.windAngle=70;s.foresail='genoa';
const probe=structuredClone(s),reference=evaluate(probe,6,'coarse');
installReference({key:referenceKey(s),score:reference.usefulDrive,cp95:reference.cp95});
function resized(factor){const t=structuredClone(s);const d=t.sailDesigns.genoa;for(const k of ['HLP','HQW','HHW','HTW','HUW','HHB'])d[k]*=factor;d.exploratory=true;return{state:t,area:measuredArea('genoa',d),metric:evaluate(t,6,'coarse')};}
const small=resized(.8),original=resized(1),large=resized(1.2);
assert.ok(small.area<original.area&&original.area<large.area);
assert.ok(small.metric.targetSpeed<original.metric.targetSpeed,'reducing genoa can reduce performance');
assert.ok(large.metric.targetSpeed>original.metric.targetSpeed,'enlarging genoa can improve performance');
assert.equal(small.metric.polarTarget,large.metric.polarTarget,'certificate polar stays unchanged');
assert.ok(Math.abs(small.metric.polarTarget-polarSpeed(s.windSpeed,s.windAngle,s))<1e-9);
console.log('PASS: original ORC chart, removed UI, sail-area effects and immutable certificate polar.');
