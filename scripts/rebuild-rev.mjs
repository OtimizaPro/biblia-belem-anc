/**
 * Reconstrutor da Desvelação - Bíblia Belém An.C 2025
 * Gera o arquivo TXT a partir do JSON do D1
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// Ler dados do D1
if (!existsSync('temp_rev.json')) {
  console.error('✗ Arquivo temp_rev.json não encontrado. Execute a exportação D1 primeiro.');
  process.exit(1);
}

let data;
try {
  data = JSON.parse(readFileSync('temp_rev.json', 'utf8'));
} catch (e) {
  console.error('✗ Erro ao parsear temp_rev.json:', e.message);
  process.exit(1);
}

if (!Array.isArray(data) || !data[0]?.results) {
  console.error('✗ Formato inesperado em temp_rev.json — esperado: [{ results: [...] }]');
  process.exit(1);
}

const verses = data[0].results;

const lines = [];

// Cabeçalho
lines.push('═══════════════════════════════════════════════════════════════════════');
lines.push('DESVELAÇÃO DE JESUS CRISTO');
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
lines.push('Fim de Desvelação de Jesus Cristo');

// Salvar
const filepath = join(process.cwd(), 'Bible belem-pt-br', 'txt', '66_DES_Desvelação de Jesus Cristo (apocalipse).txt');
writeFileSync(filepath, lines.join('\n'), 'utf8');

console.log('✓ Desvelação reconstruída com dados originais do D1');
console.log(`  Versículos: ${verses.length}`);
