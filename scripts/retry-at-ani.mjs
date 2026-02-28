#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const DB = 'biblia-belem';
const word = '\u05D0\u05B2\u05BC\u05AD\u05E0\u05B4\u05D9';
const translation = 'eu';
const tmpFile = join(tmpdir(), `retry-ani-${Date.now()}.sql`);

const ew = word.replace(/'/g, "''");
writeFileSync(tmpFile, `UPDATE tokens SET pt_literal = '${translation}' WHERE text_utf8 = '${ew}' AND pt_literal LIKE '[%]';`, 'utf-8');

try {
  const r = execSync(
    `npx wrangler d1 execute ${DB} --remote --file "${tmpFile}" --json`,
    { encoding: 'utf-8', timeout: 30000 }
  );
  const j = r.indexOf('[');
  if (j !== -1) {
    const parsed = JSON.parse(r.substring(j));
    console.log('Changes:', parsed[0]?.meta?.changes || 0);
  }
  unlinkSync(tmpFile);
} catch (err) {
  console.error('Erro:', err.message?.substring(0, 200));
  try { unlinkSync(tmpFile); } catch {}
}
