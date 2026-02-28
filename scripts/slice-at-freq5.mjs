#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

const words = JSON.parse(readFileSync('scripts/at-freq5-words.json', 'utf-8'));
const sliceSize = 100;
const slices = [];

for (let i = 0; i < words.length; i += sliceSize) {
  const slice = words.slice(i, i + sliceSize);
  const idx = Math.floor(i / sliceSize);
  const label = String.fromCharCode(97 + idx); // a, b, c...
  const filename = `scripts/at-freq5-slice-${label}.json`;
  writeFileSync(filename, JSON.stringify(slice.map(w => w.text_utf8)), 'utf-8');
  slices.push({ label, filename, count: slice.length });
}

console.log(`Total: ${words.length} words → ${slices.length} slices`);
slices.forEach(s => console.log(`  ${s.label}: ${s.count} words → ${s.filename}`));
