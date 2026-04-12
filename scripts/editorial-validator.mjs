#!/usr/bin/env node
/**
 * editorial-validator.mjs
 * Validacao editorial automatizada — Biblia Belem AnC 2025
 *
 * Verifica:
 *  1. "Deus" (latim proibido)
 *  2. "Senhor" (traducao proibida)
 *  3. "YHWH" maiusculo (deve ser yhwh)
 *  4. Caracteres hebraicos soltos no texto PT-BR
 *  5. Hifens triplos+ (ex: "e-ao-ajuntamento-de")
 *  6. Marcadores editoriais remanescentes
 *
 * Uso:
 *   node scripts/editorial-validator.mjs              # Relatorio completo
 *   node scripts/editorial-validator.mjs --book GEN   # Apenas 1 livro
 *   node scripts/editorial-validator.mjs --fix-deus   # Preview de correcoes "Deus"
 */

import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';

const BIBLE_DIR = join(import.meta.dirname, '..', 'Bible belem-pt-br', 'txt');

// ── Regras ──────────────────────────────────────────────────────────

const RULES = [
  {
    id: 'LATIN_DEUS',
    label: '"Deus" (latim proibido)',
    severity: 'CRITICA',
    pattern: /\bDeus\b/g,
    suggestion: 'Elohim (AT-HE), Eloah (AT-HE singular), Theos (NT-GR)',
  },
  {
    id: 'LATIN_SENHOR',
    label: '"Senhor" (traducao proibida)',
    severity: 'CRITICA',
    pattern: /\bSenhor\b/g,
    suggestion: 'yhwh (AT), Adonai (AT), Kyrios (NT-GR)',
  },
  {
    id: 'YHWH_UPPER',
    label: '"YHWH" maiusculo',
    severity: 'ALTA',
    pattern: /\bYHWH\b/g,
    suggestion: 'yhwh (sempre minusculo)',
  },
  {
    id: 'HEBREW_CHARS',
    label: 'Caracteres hebraicos soltos no texto PT-BR',
    severity: 'MEDIA',
    pattern: /[\u0590-\u05FF]+/g,
    suggestion: 'Transliterar ou remover',
  },
  {
    id: 'TRIPLE_HYPHEN',
    label: 'Hifens triplos+ (ex: "e-ao-ajuntamento-de")',
    severity: 'BAIXA',
    pattern: /\b\w+-\w+-\w+-\w+\b/g,
    suggestion: 'Revisar se o hifen e intencional',
  },
  {
    id: 'MARKER_OBJ',
    label: 'Marcador [OBJ] remanescente',
    severity: 'INFO',
    pattern: /\[OBJ\]/g,
    suggestion: 'Verificar se deve permanecer',
  },
  {
    id: 'MARKER_ELLIPSIS',
    label: 'Marcador [grammatical_ellipsis]',
    severity: 'INFO',
    pattern: /\[grammatical_ellipsis\]/g,
    suggestion: 'Verificar se deve permanecer',
  },
  {
    id: 'MARKER_INTERP',
    label: 'Marcador [interpretation_needed]',
    severity: 'INFO',
    pattern: /\[interpretation_needed\]/g,
    suggestion: 'Verificar se deve permanecer',
  },
];

// ── Funcoes ─────────────────────────────────────────────────────────

function getBookFiles(filterCode) {
  const files = readdirSync(BIBLE_DIR)
    .filter((f) => f.endsWith('.txt'))
    .sort();
  if (filterCode) {
    const upper = filterCode.toUpperCase();
    return files.filter((f) => f.includes(`_${upper}_`));
  }
  return files;
}

function validateFile(filename) {
  const filepath = join(BIBLE_DIR, filename);
  const content = readFileSync(filepath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  for (const rule of RULES) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      let match;
      rule.pattern.lastIndex = 0;
      while ((match = rule.pattern.exec(line)) !== null) {
        issues.push({
          rule: rule.id,
          severity: rule.severity,
          label: rule.label,
          file: filename,
          line: i + 1,
          col: match.index + 1,
          match: match[0],
          context: line.substring(Math.max(0, match.index - 30), match.index + match[0].length + 30).trim(),
          suggestion: rule.suggestion,
        });
      }
    }
  }
  return issues;
}

function printSummary(allIssues) {
  const bySeverity = {};
  const byRule = {};
  const byFile = {};

  for (const issue of allIssues) {
    bySeverity[issue.severity] = (bySeverity[issue.severity] || 0) + 1;
    byRule[issue.rule] = (byRule[issue.rule] || 0) + 1;
    byFile[issue.file] = (byFile[issue.file] || 0) + 1;
  }

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  RELATORIO DE VALIDACAO EDITORIAL — Biblia Belem AnC');
  console.log('══════════════════════════════════════════════════════════\n');

  console.log('▸ POR SEVERIDADE:');
  for (const [sev, count] of Object.entries(bySeverity).sort()) {
    const bar = '█'.repeat(Math.min(50, Math.ceil(count / 50)));
    console.log(`  ${sev.padEnd(10)} ${String(count).padStart(6)}  ${bar}`);
  }

  console.log('\n▸ POR REGRA:');
  for (const [rule, count] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) {
    const r = RULES.find((r) => r.id === rule);
    console.log(`  ${rule.padEnd(20)} ${String(count).padStart(6)}  ${r?.label || ''}`);
  }

  console.log('\n▸ TOP 10 LIVROS COM MAIS PROBLEMAS:');
  const sorted = Object.entries(byFile).sort((a, b) => b[1] - a[1]);
  for (const [file, count] of sorted.slice(0, 10)) {
    const bar = '█'.repeat(Math.min(50, Math.ceil(count / 20)));
    console.log(`  ${file.substring(0, 40).padEnd(42)} ${String(count).padStart(6)}  ${bar}`);
  }

  console.log(`\n▸ TOTAL: ${allIssues.length} problemas em ${Object.keys(byFile).length} livros`);
  console.log('══════════════════════════════════════════════════════════\n');
}

function printDetails(allIssues, maxPerRule = 5) {
  const grouped = {};
  for (const issue of allIssues) {
    if (!grouped[issue.rule]) grouped[issue.rule] = [];
    grouped[issue.rule].push(issue);
  }

  console.log('▸ EXEMPLOS POR REGRA (max 5 cada):\n');
  for (const [rule, issues] of Object.entries(grouped)) {
    const r = RULES.find((r) => r.id === rule);
    console.log(`── ${rule} (${r?.severity}) ── ${issues.length} ocorrencias`);
    console.log(`   Sugestao: ${r?.suggestion}\n`);
    for (const issue of issues.slice(0, maxPerRule)) {
      console.log(`   ${issue.file}:${issue.line}:${issue.col}`);
      console.log(`   > ...${issue.context}...`);
      console.log();
    }
  }
}

// ── Main ────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const bookFilter = args.includes('--book') ? args[args.indexOf('--book') + 1] : null;
const showDetails = args.includes('--details');

const files = getBookFiles(bookFilter);
console.log(`Validando ${files.length} livro(s)...\n`);

const allIssues = [];
for (const file of files) {
  const issues = validateFile(file);
  allIssues.push(...issues);
}

printSummary(allIssues);

if (showDetails || bookFilter) {
  printDetails(allIssues);
}

// Saida com codigo de erro se ha problemas criticos
const criticos = allIssues.filter((i) => i.severity === 'CRITICA');
if (criticos.length > 0) {
  console.log(`⚠  ${criticos.length} problemas CRITICOS encontrados. Correcao necessaria.\n`);
  process.exit(1);
}
