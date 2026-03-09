/**
 * Unit tests for the N3 syntactic reordering engine.
 * Tests rule-based VSO→SVO transformations.
 */
import { describe, it, expect } from 'vitest';

// Import the engine (ESM)
const { reorder, reorderWithDiff } = await import('../scripts/n3-engine/reorder.mjs');

// ─── Helper to create token arrays ──────────────────────────────────────────

function makeTokens(
  specs: Array<{ pos?: string; pt: string; script?: string; text_utf8?: string }>
) {
  return specs.map((s, i) => ({
    position: i + 1,
    text_utf8: s.text_utf8 || s.pt,
    pt_literal: s.pt,
    script: s.script || 'HE',
    pos: s.pos || null,
    morph_code: null,
    lemma: null,
  }));
}

// ─── VSO → SVO Reordering ──────────────────────────────────────────────────

describe('VSO → SVO Reordering', () => {
  it('reorders basic VSO to SVO (Genesis 1:1 pattern)', () => {
    // "criou Elohim a os-céus" → "Elohim criou a os-céus"
    const tokens = makeTokens([
      { pos: 'V', pt: 'criou' },
      { pos: 'NP', pt: 'Elohim' },
      { pos: 'P', pt: 'a' },
      { pos: 'N', pt: 'os-céus' },
    ]);
    expect(reorder(tokens)).toBe('Elohim criou a os-céus');
  });

  it('does not reorder when already SVO', () => {
    // "Elohim criou a os-céus" — already SVO
    const tokens = makeTokens([
      { pos: 'NP', pt: 'Elohim' },
      { pos: 'V', pt: 'criou' },
      { pos: 'P', pt: 'a' },
      { pos: 'N', pt: 'os-céus' },
    ]);
    expect(reorder(tokens)).toBe('Elohim criou a os-céus');
  });

  it('handles verb at position 0 with subject after', () => {
    // "disse yhwh para-Moisés" → "yhwh disse para-Moisés"
    const tokens = makeTokens([
      { pos: 'V', pt: 'disse' },
      { pos: 'NP', pt: 'yhwh' },
      { pos: 'P', pt: 'para-Moisés' },
    ]);
    expect(reorder(tokens)).toBe('yhwh disse para-Moisés');
  });

  it('skips reorder when subject is beyond max_reorder_distance', () => {
    // Verb at 0, lots of prep phrases, subject too far
    const tokens = makeTokens([
      { pos: 'V', pt: 'viu' },
      { pos: 'P', pt: 'sobre' },
      { pos: 'N', pt: 'a-terra' },
      { pos: 'P', pt: 'em' },
      { pos: 'N', pt: 'o-dia' },
      { pos: 'P', pt: 'de' },
      { pos: 'N', pt: 'as-aguas' },
      { pos: 'NP', pt: 'Elohim' }, // position 7, distance > 5
    ]);
    // Subject too far, should not reorder
    expect(reorder(tokens)).toBe('viu sobre a-terra em o-dia de as-aguas Elohim');
  });
});

// ─── Waw-Consecutive Handling ───────────────────────────────────────────────

describe('Waw-Consecutive Handling', () => {
  it('splits conjunction prefix and reorders', () => {
    // "E-disse Elohim haja luz" → "E Elohim disse haja luz"
    const tokens = makeTokens([
      { pos: 'V', pt: 'E-disse' },
      { pos: 'NP', pt: 'Elohim' },
      { pos: 'V', pt: 'haja' },
      { pos: 'N', pt: 'luz' },
    ]);
    expect(reorder(tokens)).toBe('E Elohim disse haja luz');
  });

  it('splits "e-" lowercase prefix', () => {
    // "e-viu Elohim a a-luz" → "e Elohim viu a a-luz"
    const tokens = makeTokens([
      { pos: 'V', pt: 'e-viu' },
      { pos: 'NP', pt: 'Elohim' },
      { pos: 'P', pt: 'a' },
      { pos: 'N', pt: 'a-luz' },
    ]);
    expect(reorder(tokens)).toBe('e Elohim viu a a-luz');
  });
});

// ─── Construct Chains ───────────────────────────────────────────────────────

describe('Construct Chains', () => {
  it('preserves construct chain with -de suffix', () => {
    // "face-de as-aguas" — already PT order
    const tokens = makeTokens([
      { pos: 'N', pt: 'face-de' },
      { pos: 'N', pt: 'as-aguas' },
    ]);
    expect(reorder(tokens)).toBe('face-de as-aguas');
  });

  it('treats construct chain as atomic subject group', () => {
    // "disse Espírito-de Elohim" → "Espírito-de Elohim disse"
    const tokens = makeTokens([
      { pos: 'V', pt: 'pairava' },
      { pos: 'N', pt: 'Espírito-de' },
      { pos: 'NP', pt: 'Elohim' },
    ]);
    const result = reorder(tokens);
    expect(result).toBe('Espírito-de Elohim pairava');
  });
});

// ─── Editorial Markers ──────────────────────────────────────────────────────

describe('Editorial Markers', () => {
  it('preserves [OBJ] marker in output', () => {
    const tokens = makeTokens([
      { pos: 'V', pt: 'formou' },
      { pos: 'NP', pt: 'yhwh' },
      { pos: 'X', pt: '[OBJ]' },
      { pos: 'N', pt: 'homem' },
    ]);
    const result = reorder(tokens);
    expect(result).toContain('[OBJ]');
    expect(result).toContain('yhwh');
  });

  it('preserves bracketed untranslated words', () => {
    const tokens = makeTokens([
      { pos: 'N', pt: 'palavras-de' },
      { pos: null, pt: '[עָמ֔וֹס]', text_utf8: 'עָמ֔וֹס' },
    ]);
    const result = reorder(tokens);
    expect(result).toContain('[עָמ֔וֹס]');
  });
});

// ─── Keep Original Words ────────────────────────────────────────────────────

describe('Keep Original Words', () => {
  it('keep_original words participate in reordering but form stays unchanged', () => {
    // "disse yhwh" → "yhwh disse"
    const tokens = makeTokens([
      { pos: 'V', pt: 'disse' },
      { pos: 'NP', pt: 'yhwh' },
    ]);
    expect(reorder(tokens)).toBe('yhwh disse');
  });

  it('Theos and Iesous are preserved as-is', () => {
    const tokens = makeTokens([
      { pos: 'V', pt: 'amou', script: 'GRC' },
      { pos: 'NP', pt: 'Theos', script: 'GRC' },
      { pos: 'N', pt: 'o-mundo', script: 'GRC' },
    ]);
    const result = reorder(tokens);
    expect(result).toBe('Theos amou o-mundo');
  });
});

// ─── Multi-Clause Handling ──────────────────────────────────────────────────

describe('Multi-Clause Handling', () => {
  it('handles multiple clauses separated by conjunction', () => {
    // "criou Elohim a luz e separou Elohim a luz"
    const tokens = makeTokens([
      { pos: 'V', pt: 'criou' },
      { pos: 'NP', pt: 'Elohim' },
      { pos: 'P', pt: 'a' },
      { pos: 'N', pt: 'luz' },
      { pos: 'C', pt: 'e' },
      { pos: 'V', pt: 'separou' },
      { pos: 'NP', pt: 'Elohim' },
      { pos: 'P', pt: 'a' },
      { pos: 'N', pt: 'luz' },
    ]);
    const result = reorder(tokens);
    expect(result).toBe('Elohim criou a luz e Elohim separou a luz');
  });
});

// ─── Tokens Without POS ────────────────────────────────────────────────────

describe('Tokens Without POS', () => {
  it('tokens with null POS keep original position', () => {
    const tokens = makeTokens([
      { pos: null, pt: 'No-princípio' },
      { pos: 'V', pt: 'criou' },
      { pos: 'NP', pt: 'Elohim' },
    ]);
    // Verb is at position 1 (not 0), so no reorder needed
    const result = reorder(tokens);
    expect(result).toContain('Elohim');
    expect(result).toContain('criou');
    expect(result).toContain('No-princípio');
  });

  it('all null POS tokens return original order', () => {
    const tokens = makeTokens([
      { pos: null, pt: 'a' },
      { pos: null, pt: 'b' },
      { pos: null, pt: 'c' },
    ]);
    expect(reorder(tokens)).toBe('a b c');
  });
});

// ─── Edge Cases ─────────────────────────────────────────────────────────────

describe('Edge Cases', () => {
  it('empty tokens return empty string', () => {
    expect(reorder([])).toBe('');
    expect(reorder(null)).toBe('');
  });

  it('single token returns that token', () => {
    const tokens = makeTokens([{ pos: 'V', pt: 'disse' }]);
    expect(reorder(tokens)).toBe('disse');
  });

  it('tokens with missing pt_literal get bracketed original', () => {
    const tokens = [
      { position: 1, text_utf8: 'שְׁנָתַ֖יִם', pt_literal: null, script: 'HE', pos: null },
    ];
    expect(reorder(tokens)).toBe('[שְׁנָתַ֖יִם]');
  });
});

// ─── reorderWithDiff ────────────────────────────────────────────────────────

describe('reorderWithDiff', () => {
  it('reports changed=true when reordering occurs', () => {
    const tokens = makeTokens([
      { pos: 'V', pt: 'disse' },
      { pos: 'NP', pt: 'yhwh' },
    ]);
    const result = reorderWithDiff(tokens);
    expect(result.n0).toBe('disse yhwh');
    expect(result.n3).toBe('yhwh disse');
    expect(result.changed).toBe(true);
  });

  it('reports changed=false when no reordering needed', () => {
    const tokens = makeTokens([
      { pos: 'NP', pt: 'Elohim' },
      { pos: 'V', pt: 'criou' },
    ]);
    const result = reorderWithDiff(tokens);
    expect(result.changed).toBe(false);
  });
});
