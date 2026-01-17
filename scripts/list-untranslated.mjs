#!/usr/bin/env node
/**
 * Lista palavras gregas não traduzidas
 * Bíblia Belém An.C 2025
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const BOOK_CODE = process.argv[2] || 'REV';
const BOOK_NAME = process.argv[3] || 'Apocalipse';

console.log('═══════════════════════════════════════════════════════════════════');
console.log('LISTAGEM DE PALAVRAS NÃO TRADUZIDAS');
console.log(`Livro: ${BOOK_NAME} (${BOOK_CODE})`);
console.log('═══════════════════════════════════════════════════════════════════');
console.log('');

// Carregar glossário
const glossaryPath = join(projectRoot, 'glossary', 'greek.json');
const glossary = existsSync(glossaryPath)
  ? JSON.parse(readFileSync(glossaryPath, 'utf-8'))
  : {};

// Carregar palavras que devem ficar no original
const keepOriginalPath = join(projectRoot, 'glossary', 'keep_original.json');
const keepOriginal = existsSync(keepOriginalPath)
  ? new Set(JSON.parse(readFileSync(keepOriginalPath, 'utf-8')).all_words || [])
  : new Set();

console.log(`✓ Glossário: ${Object.keys(glossary).length} entradas`);
console.log(`✓ Manter original: ${keepOriginal.size} palavras`);
console.log('');

// Buscar palavras do livro no D1
console.log('Buscando palavras no D1...');

const query = `SELECT t.text_utf8 as word, COUNT(*) as freq FROM tokens t JOIN verses v ON t.verse_id = v.id JOIN books b ON v.book_id = b.id WHERE b.code = '${BOOK_CODE}' AND t.pt_literal LIKE '%[%' GROUP BY t.text_utf8 ORDER BY freq DESC;`;

try {
  execSync(`npx wrangler d1 execute biblia-belem --remote --command "${query}" --json > temp_words.json`, {
    cwd: projectRoot,
    stdio: 'pipe'
  });
} catch (e) {
  console.error('Erro ao buscar do D1:', e.message);
  process.exit(1);
}

const data = JSON.parse(readFileSync(join(projectRoot, 'temp_words.json'), 'utf8'));
const allWords = data[0].results;

console.log(`✓ ${allWords.length} palavras únicas encontradas`);
console.log('');

// Separar traduzidas e não traduzidas
const untranslated = [];
const translated = [];
const keptOriginal = [];

for (const row of allWords) {
  const word = row.word;
  const freq = row.freq;

  if (keepOriginal.has(word)) {
    keptOriginal.push({ word, freq, reason: 'Manter original (Θεός/Jesus/Cristo)' });
  } else if (glossary[word]) {
    translated.push({ word, freq, translation: glossary[word].translation });
  } else {
    untranslated.push({ word, freq });
  }
}

// Gerar documento
const lines = [];
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push(`PALAVRAS NÃO TRADUZIDAS - ${BOOK_NAME.toUpperCase()}`);
lines.push('Bíblia Belém An.C 2025');
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push('');
lines.push(`Data: ${new Date().toISOString().split('T')[0]}`);
lines.push(`Total de palavras únicas: ${allWords.length}`);
lines.push(`Traduzidas: ${translated.length}`);
lines.push(`Mantidas no original: ${keptOriginal.length}`);
lines.push(`Não traduzidas: ${untranslated.length}`);
lines.push('');
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push('PALAVRAS SEM TRADUÇÃO (ordenadas por frequência)');
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push('');
lines.push('Freq.  Palavra Grega');
lines.push('─────  ─────────────────────────────────────');

for (const item of untranslated) {
  const freqStr = String(item.freq).padStart(4, ' ');
  lines.push(`${freqStr}x  ${item.word}`);
}

lines.push('');
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push('PALAVRAS MANTIDAS NO ORIGINAL');
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push('');

for (const item of keptOriginal) {
  const freqStr = String(item.freq).padStart(4, ' ');
  lines.push(`${freqStr}x  ${item.word}`);
}

lines.push('');
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push('PALAVRAS JÁ TRADUZIDAS');
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push('');
lines.push('Freq.  Grego → Português');
lines.push('─────  ─────────────────────────────────────');

for (const item of translated) {
  const freqStr = String(item.freq).padStart(4, ' ');
  lines.push(`${freqStr}x  ${item.word} → ${item.translation}`);
}

lines.push('');
lines.push('═══════════════════════════════════════════════════════════════════════════════');
lines.push('FIM DO RELATÓRIO');
lines.push('═══════════════════════════════════════════════════════════════════════════════');

// Salvar arquivo
const outputPath = join(projectRoot, 'glossary', `untranslated_${BOOK_CODE}.txt`);
writeFileSync(outputPath, lines.join('\n'), 'utf8');

console.log('═══════════════════════════════════════════════════════════════════');
console.log('RESUMO');
console.log('═══════════════════════════════════════════════════════════════════');
console.log(`  Traduzidas:         ${translated.length}`);
console.log(`  Mantidas original:  ${keptOriginal.length}`);
console.log(`  Não traduzidas:     ${untranslated.length}`);
console.log('');
console.log(`✓ Arquivo salvo: glossary/untranslated_${BOOK_CODE}.txt`);
console.log('═══════════════════════════════════════════════════════════════════');

// Limpar arquivo temporário
try {
  execSync(`del temp_words.json`, { cwd: projectRoot, stdio: 'pipe' });
} catch (e) {}
