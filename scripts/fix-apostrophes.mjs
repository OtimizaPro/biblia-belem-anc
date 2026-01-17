#!/usr/bin/env node
/**
 * Corrige apóstrofos no glossário
 * Substitui ' (U+0027) por ' (U+2019)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const glossaryPath = join(projectRoot, 'glossary', 'greek.json');

// Ler glossário
const glossary = JSON.parse(readFileSync(glossaryPath, 'utf-8'));

// Criar novo glossário com apóstrofos corretos
const newGlossary = {};

// Apóstrofo curvo (RIGHT SINGLE QUOTATION MARK U+2019)
const curlyApostrophe = '\u2019';

for (const [word, data] of Object.entries(glossary)) {
  // Substituir apóstrofo reto por curvo
  const newWord = word.replace(/'/g, curlyApostrophe);
  newGlossary[newWord] = data;
}

// Salvar
writeFileSync(glossaryPath, JSON.stringify(newGlossary, null, 2), 'utf-8');

console.log('Glossário atualizado!');
console.log('Total de entradas:', Object.keys(newGlossary).length);

// Verificar se as palavras com apóstrofo estão corretas
const wordsToCheck = ['μετ' + curlyApostrophe, 'ἐπ' + curlyApostrophe, 'ἀλλ' + curlyApostrophe];
for (const w of wordsToCheck) {
  console.log(w + ':', newGlossary[w] ? newGlossary[w].translation : 'NÃO ENCONTRADO');
}
