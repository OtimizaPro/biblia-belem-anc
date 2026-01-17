#!/usr/bin/env node
/**
 * Script para importar glossary/greek.json para o banco D1
 * Bíblia Belém An.C 2025
 */

import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Carregar glossário
const glossaryPath = join(projectRoot, 'glossary', 'greek.json');
const glossary = JSON.parse(readFileSync(glossaryPath, 'utf-8'));

console.log('='.repeat(60));
console.log('IMPORTAÇÃO DE GLOSSÁRIO PARA D1');
console.log('Bíblia Belém An.C 2025');
console.log('='.repeat(60));

const entries = Object.entries(glossary);
console.log(`\nTotal de entradas no glossário: ${entries.length}`);

// Preparar SQL para inserção
let insertCount = 0;
let skipCount = 0;

for (const [word, data] of entries) {
  const translation = data.translation;
  const strongs = data.strongs || null;

  // Escapar aspas simples para SQL
  const escapedWord = word.replace(/'/g, "''");
  const escapedTranslation = translation.replace(/'/g, "''");
  const strongsValue = strongs ? `'${strongs}'` : 'NULL';

  const sql = `INSERT OR IGNORE INTO glossary (word, translation, strongs, contributor, status) VALUES ('${escapedWord}', '${escapedTranslation}', ${strongsValue}, 'system', 'approved');`;

  try {
    execSync(`wrangler d1 execute biblia-belem --remote --command="${sql}"`, {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: 'pipe'
    });
    insertCount++;
    process.stdout.write(`\r  Inserindo: ${insertCount}/${entries.length}`);
  } catch (error) {
    skipCount++;
  }
}

console.log('\n');
console.log('='.repeat(60));
console.log('RESULTADO DA IMPORTAÇÃO');
console.log('='.repeat(60));
console.log(`  Entradas inseridas: ${insertCount}`);
console.log(`  Entradas ignoradas (já existem): ${skipCount}`);
console.log(`  Total processado: ${entries.length}`);

// Verificar contagem final
try {
  const result = execSync(`wrangler d1 execute biblia-belem --remote --command="SELECT COUNT(*) as total FROM glossary;"`, {
    cwd: projectRoot,
    encoding: 'utf-8'
  });
  console.log('\nContagem no banco D1:');
  console.log(result);
} catch (error) {
  console.error('Erro ao verificar contagem:', error.message);
}
