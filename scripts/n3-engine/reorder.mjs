/**
 * Motor de Reordenação Sintática N3
 *
 * Transforma a ordem original (hebraico VSO / grego flexível)
 * em português SVO usando regras determinísticas.
 *
 * Pipeline:
 *   1. Segmentação por cláusulas (split em conjunções)
 *   2. Splitting de waw-consecutivo (E-disse → E + disse)
 *   3. Reordenação VSO→SVO por cláusula
 *   4. Preservação de marcadores editoriais e keep_original
 *   5. Limpeza e concatenação
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf-8'));

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Check if a pt_literal value is an editorial marker like [OBJ]
 */
function isEditorialMarker(text) {
  if (!text) return false;
  return CONFIG.editorial_markers.some((m) => text.includes(m));
}

/**
 * Check if a pt_literal value is a bracketed untranslated word like [עָמ֔וֹס]
 */
function isBracketed(text) {
  if (!text) return false;
  return text.startsWith('[') && text.endsWith(']');
}

/**
 * Check if token is a preposition (by POS or by pt_literal matching)
 */
function isPreposition(token) {
  if (token.pos === 'P') return true;
  if (!token.pt_literal) return false;
  const lower = token.pt_literal.toLowerCase().replace(/-/g, '');
  return CONFIG.preposition_tokens.includes(lower);
}

/**
 * Check if token has a conjunction prefix (E-disse, e-fez, etc.)
 */
function hasConjunctionPrefix(text) {
  if (!text) return false;
  return CONFIG.conjunction_prefixes.some((p) => text.startsWith(p));
}

/**
 * Split a conjunction prefix from a verb: "E-disse" → { conj: "E", verb: "disse" }
 * Returns null if no prefix found.
 */
function splitConjunctionPrefix(text) {
  if (!text) return null;
  for (const prefix of CONFIG.conjunction_prefixes) {
    if (text.startsWith(prefix)) {
      const rest = text.slice(prefix.length);
      if (rest.length > 0) {
        return { conj: prefix.slice(0, -1), verb: rest }; // remove trailing '-'
      }
    }
  }
  return null;
}

/**
 * Check if token has a construct chain suffix (-de, -do, -da, etc.)
 */
function hasConstructSuffix(text) {
  if (!text) return false;
  return CONFIG.construct_suffixes.some((s) => text.endsWith(s));
}

/**
 * Check if a token is a subject candidate (noun, proper noun, pronoun)
 */
function isSubjectCandidate(token) {
  const subjectPOS = ['N', 'NP', 'R', 'RD', 'RI'];
  if (token.pos && subjectPOS.includes(token.pos)) return true;
  // Heuristic: keep_original words are often subjects
  if (
    token.pt_literal &&
    CONFIG.keep_original.includes(token.pt_literal)
  ) {
    return true;
  }
  return false;
}

/**
 * Check if a token is a verb
 */
function isVerb(token) {
  if (token.pos === 'V') return true;
  return false;
}

// ─── Clause Segmentation ────────────────────────────────────────────────────

/**
 * Segment tokens into clauses.
 * A new clause starts at:
 *   - A standalone conjunction token (pos=C)
 *   - A token with a conjunction prefix (E-disse)
 * The first clause always starts at position 0.
 */
function segmentClauses(tokens) {
  const clauses = [];
  let current = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];

    // Start new clause at standalone conjunction (but not the very first token)
    const isStandaloneConj =
      t.pos === 'C' && !hasConjunctionPrefix(t.pt_literal) && i > 0;
    // Start new clause at conjunction-prefixed verb (E-disse, e-fez)
    const isPrefixedVerb = hasConjunctionPrefix(t.pt_literal) && i > 0;

    if (isStandaloneConj || isPrefixedVerb) {
      if (current.length > 0) {
        clauses.push(current);
      }
      current = [t];
    } else {
      current.push(t);
    }
  }

  if (current.length > 0) {
    clauses.push(current);
  }

  return clauses;
}

// ─── VSO → SVO Reordering ──────────────────────────────────────────────────

/**
 * Reorder a single clause from VSO to SVO.
 *
 * Strategy:
 *   1. Find the first verb in the clause
 *   2. Find the subject (first noun/proper-noun/pronoun after the verb
 *      that is NOT part of a prepositional phrase)
 *   3. Move the subject to before the verb
 *   4. Keep everything else in place
 *
 * Constraints:
 *   - max_reorder_distance: subject must be within N positions of verb
 *   - Prepositional phrases (P + N) are atomic: skip them when looking for subject
 *   - Construct chains (X-de Y) are atomic
 *   - Editorial markers stay adjacent
 *   - Tokens with pos=null keep original position
 */
function reorderClauseVSO(clause) {
  if (clause.length <= 1) return clause;

  // Handle conjunction-prefixed verb at clause start
  let conjPrefix = null;
  let workingClause = [...clause];

  if (workingClause.length > 0 && hasConjunctionPrefix(workingClause[0].pt_literal)) {
    const split = splitConjunctionPrefix(workingClause[0].pt_literal);
    if (split) {
      conjPrefix = { ...workingClause[0], pt_literal: split.conj, pos: 'C', _synthetic: true };
      workingClause[0] = { ...workingClause[0], pt_literal: split.verb, _split: true };
    }
  }

  // Find the first verb
  let verbIdx = -1;
  for (let i = 0; i < workingClause.length; i++) {
    if (isVerb(workingClause[i])) {
      verbIdx = i;
      break;
    }
  }

  // If no verb found or verb is not at/near the start, no reordering needed
  if (verbIdx === -1 || verbIdx > 1) {
    // Reconstruct with conjunction prefix if split
    if (conjPrefix) {
      return [conjPrefix, ...workingClause];
    }
    return clause;
  }

  // Find subject after the verb
  let subjectIdx = -1;
  let inPrepPhrase = false;

  for (let i = verbIdx + 1; i < workingClause.length; i++) {
    const t = workingClause[i];

    // Skip editorial markers
    if (isEditorialMarker(t.pt_literal) || isBracketed(t.pt_literal)) continue;

    // Track prepositional phrases (P + following noun = atomic)
    if (isPreposition(t)) {
      inPrepPhrase = true;
      continue;
    }
    if (inPrepPhrase && (t.pos === 'N' || t.pos === 'NP' || t.pos === 'R')) {
      inPrepPhrase = false;
      // Check if this noun has a construct suffix — if so, skip its complement too
      if (hasConstructSuffix(t.pt_literal)) continue;
      continue; // This noun is part of the prep phrase, not the subject
    }
    inPrepPhrase = false;

    // Check distance constraint
    if (i - verbIdx > CONFIG.max_reorder_distance) break;

    // Found a subject candidate
    if (isSubjectCandidate(t)) {
      subjectIdx = i;
      break;
    }
  }

  // If no subject found, return as-is
  if (subjectIdx === -1) {
    if (conjPrefix) {
      return [conjPrefix, ...workingClause];
    }
    return clause;
  }

  // Collect the subject group (subject + any construct chain complement)
  let subjectEnd = subjectIdx;
  if (hasConstructSuffix(workingClause[subjectIdx].pt_literal)) {
    // Include the next token as part of construct chain
    if (subjectIdx + 1 < workingClause.length) {
      subjectEnd = subjectIdx + 1;
    }
  }

  // Build reordered clause: [before verb] + [subject group] + [verb] + [between verb and subject] + [after subject]
  const beforeVerb = workingClause.slice(0, verbIdx);
  const verb = workingClause[verbIdx];
  const betweenVerbAndSubject = workingClause.slice(verbIdx + 1, subjectIdx);
  const subjectGroup = workingClause.slice(subjectIdx, subjectEnd + 1);
  const afterSubject = workingClause.slice(subjectEnd + 1);

  const reordered = [
    ...beforeVerb,
    ...subjectGroup,
    verb,
    ...betweenVerbAndSubject,
    ...afterSubject,
  ];

  if (conjPrefix) {
    return [conjPrefix, ...reordered];
  }
  return reordered;
}

// ─── Main Reorder Function ──────────────────────────────────────────────────

/**
 * Reorder a verse's tokens from source language order to Portuguese SVO.
 *
 * @param {Array} tokens - Array of {position, text_utf8, pt_literal, script, pos, morph_code, lemma}
 * @returns {string} The reordered Portuguese text
 */
export function reorder(tokens) {
  if (!tokens || tokens.length === 0) return '';

  // Filter out tokens without pt_literal (keep bracketed originals)
  const prepared = tokens.map((t) => ({
    ...t,
    pt_literal: t.pt_literal && t.pt_literal.trim() ? t.pt_literal : `[${t.text_utf8 || '?'}]`,
  }));

  // Segment into clauses
  const clauses = segmentClauses(prepared);

  // Reorder each clause
  const reorderedClauses = clauses.map((clause) => reorderClauseVSO(clause));

  // Flatten and join
  const allTokens = reorderedClauses.flat();
  const text = allTokens
    .map((t) => t.pt_literal)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Compare N0 and N3 text to check if reordering actually changed anything.
 * @returns {{ n3: string, changed: boolean }}
 */
export function reorderWithDiff(tokens) {
  const n0Parts = tokens.map((t) =>
    t.pt_literal && t.pt_literal.trim() ? t.pt_literal : `[${t.text_utf8 || '?'}]`
  );
  const n0 = n0Parts.join(' ').replace(/\s+/g, ' ').trim();
  const n3 = reorder(tokens);
  return { n0, n3, changed: n0 !== n3 };
}
