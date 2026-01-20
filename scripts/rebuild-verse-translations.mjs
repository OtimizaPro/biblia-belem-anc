#!/usr/bin/env node
/**
 * Reconstrutor de Traduções de Versículos
 *
 * Este script reconstrói a tabela verse_translations concatenando
 * as traduções individuais dos tokens.
 */

import { execSync } from 'child_process';

const BOOK_CODE = process.argv[2] || 'REV';

console.log(`
╔══════════════════════════════════════════════════════════════════╗
║     RECONSTRUTOR DE VERSE_TRANSLATIONS - Bíblia Belém An.C       ║
╚══════════════════════════════════════════════════════════════════╝
`);

function runD1(sql) {
  const escaped = sql.replace(/"/g, '\\"');
  const cmd = `npx wrangler d1 execute biblia-belem --remote --command "${escaped}" --json`;
  try {
    const result = execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
    // Find the JSON array in the output (starts with [ and ends with ])
    const match = result.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return parsed[0]?.results || [];
    }
    return [];
  } catch (e) {
    console.error('Erro D1:', e.message);
    return [];
  }
}

async function main() {
  // 1. Buscar book_id
  const books = runD1(`SELECT id FROM books WHERE code = '${BOOK_CODE}'`);
  if (books.length === 0) {
    console.error(`Livro ${BOOK_CODE} não encontrado!`);
    process.exit(1);
  }
  const bookId = books[0].id;
  console.log(`📖 Livro: ${BOOK_CODE} (ID: ${bookId})`);

  // 2. Buscar todos os versículos do livro
  const verses = runD1(`SELECT id, chapter, verse FROM verses WHERE book_id = ${bookId} ORDER BY chapter, verse`);
  console.log(`📊 Total de versículos: ${verses.length}`);

  // 3. Para cada versículo, concatenar traduções dos tokens
  let updated = 0;
  let errors = 0;

  for (let i = 0; i < verses.length; i++) {
    const v = verses[i];

    // Buscar tokens do versículo
    const tokens = runD1(`SELECT text_utf8, pt_literal FROM tokens WHERE verse_id = ${v.id} ORDER BY position`);

    // Concatenar traduções
    const literalParts = tokens.map(t => {
      if (t.pt_literal && t.pt_literal.trim()) {
        return t.pt_literal;
      }
      // Fallback: manter original entre colchetes
      return `[${t.text_utf8}]`;
    });

    const literalPt = literalParts.join(' ').replace(/\s+/g, ' ').trim();

    // Verificar se já existe tradução
    const existing = runD1(`SELECT id FROM verse_translations WHERE verse_id = ${v.id}`);

    try {
      if (existing.length > 0) {
        // Atualizar existente
        const escapedLiteral = literalPt.replace(/'/g, "''");
        runD1(`UPDATE verse_translations SET literal_pt = '${escapedLiteral}', readable_pt = '${escapedLiteral}', updated_at = datetime('now') WHERE verse_id = ${v.id}`);
      } else {
        // Inserir novo
        const escapedLiteral = literalPt.replace(/'/g, "''");
        runD1(`INSERT INTO verse_translations (verse_id, layer, literal_pt, readable_pt, source) VALUES (${v.id}, 'N0', '${escapedLiteral}', '${escapedLiteral}', 'glossary-rebuild')`);
      }
      updated++;
    } catch (e) {
      errors++;
    }

    // Progresso
    if ((i + 1) % 10 === 0 || i === verses.length - 1) {
      process.stdout.write(`\r  Processando: ${i + 1}/${verses.length} (${Math.round((i + 1) / verses.length * 100)}%)`);
    }
  }

  console.log(`\n\n✅ Concluído!`);
  console.log(`   Versículos atualizados: ${updated}`);
  console.log(`   Erros: ${errors}`);
}

main().catch(console.error);
