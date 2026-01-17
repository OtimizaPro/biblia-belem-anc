/**
 * Reconstrutor do Apocalipse - Bíblia Belém An.C 2025
 * Gera o arquivo TXT a partir do JSON do D1
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Ler dados do D1
const data = JSON.parse(readFileSync('temp_rev.json', 'utf8'));
const verses = data[0].results;

const lines = [];

// Cabeçalho
lines.push('═══════════════════════════════════════════════════════════════════════');
lines.push('APOCALIPSE');
lines.push('═══════════════════════════════════════════════════════════════════════');
lines.push('');
lines.push('Tradução: Bíblia Belém An.C 2025');
lines.push('Método: Literal Rígido - Fiel ao códice original');
lines.push('Sem suavização. Sem normalização. Sem interferência do tradutor.');
lines.push('');
lines.push('═══════════════════════════════════════════════════════════════════════');
lines.push('');

let currentChapter = 0;

for (const v of verses) {
  if (v.chapter !== currentChapter) {
    currentChapter = v.chapter;
    lines.push('');
    lines.push(`── Capítulo ${currentChapter} ──`);
    lines.push('');
  }
  lines.push(`${v.verse}  ${v.texto}`);
}

// Rodapé
lines.push('');
lines.push('───────────────────────────────────────────────────────────────────────');
lines.push('Fim de Apocalipse');

// Salvar
const filepath = join(process.cwd(), 'Bible pt-br', 'txt', '66_REV_Apocalipse.txt');
writeFileSync(filepath, lines.join('\n'), 'utf8');

console.log('✓ Apocalipse reconstruído com dados originais do D1');
console.log(`  Versículos: ${verses.length}`);
