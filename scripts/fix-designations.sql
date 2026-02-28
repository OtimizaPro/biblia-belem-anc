-- ============================================================
-- fix-designations.sql
-- Biblia Belem An.C 2025 - Correcao de designacoes divinas
-- Padrao: ipsis litteris (keep_original.json)
-- Data: 2026-02-08
-- ============================================================

-- ============================================================
-- PASSO 1a: Corrigir duplicacoes no AT (glossary-rebuild)
-- DEVE rodar ANTES dos replaces gerais
-- ============================================================

-- "E-viu Deus E-viu Elohim" → "E-viu Elohim"
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'E-viu Deus E-viu Elohim', 'E-viu Elohim'),
  readable_pt = REPLACE(readable_pt, 'E-viu Deus E-viu Elohim', 'E-viu Elohim')
WHERE literal_pt LIKE '%E-viu Deus E-viu Elohim%';

-- "E-criou Deus ... E-viu Elohim" patterns (duplicacao com contexto)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'E-viu Deus segundo-especie-sua E-viu Elohim', 'E-viu Elohim segundo-especie-sua'),
  readable_pt = REPLACE(readable_pt, 'E-viu Deus segundo-especie-sua E-viu Elohim', 'E-viu Elohim segundo-especie-sua')
WHERE literal_pt LIKE '%E-viu Deus segundo-especie-sua E-viu Elohim%';

-- "Deus que criou Elohim" → "Elohim que criou"
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Deus que criou Elohim', 'Elohim que criou'),
  readable_pt = REPLACE(readable_pt, 'Deus que criou Elohim', 'Elohim que criou')
WHERE literal_pt LIKE '%Deus que criou Elohim%';

-- "Deus a-ele Elohim" → "Elohim a-ele" (Gn 5:24)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Deus a-ele Elohim', 'Elohim a-ele'),
  readable_pt = REPLACE(readable_pt, 'Deus a-ele Elohim', 'Elohim a-ele')
WHERE literal_pt LIKE '%Deus a-ele Elohim%';

-- ============================================================
-- PASSO 1b: Correcoes AT (Antigo Testamento)
-- ============================================================

-- "YHWH Deus" → "yhwh Elohim" (composicao Gn 2:4+)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'YHWH Deus', 'yhwh Elohim'),
  readable_pt = REPLACE(readable_pt, 'YHWH Deus', 'yhwh Elohim')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'AT'
) AND literal_pt LIKE '%YHWH Deus%';

-- "YHWH" → "yhwh" (restantes maiusculos, AT)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'YHWH', 'yhwh'),
  readable_pt = REPLACE(readable_pt, 'YHWH', 'yhwh')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'AT'
) AND literal_pt LIKE '%YHWH%';

-- "Deus" → "Elohim" (AT geral)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Deus', 'Elohim'),
  readable_pt = REPLACE(readable_pt, 'Deus', 'Elohim')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'AT'
) AND literal_pt LIKE '%Deus%';

-- "Senhor" → "Adonai" (AT)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Senhor', 'Adonai'),
  readable_pt = REPLACE(readable_pt, 'Senhor', 'Adonai')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'AT'
) AND literal_pt LIKE '%Senhor%';

-- ============================================================
-- PASSO 1c: Correcoes NT (Novo Testamento)
-- ============================================================

-- "Jesus" → "Iesous" (nomes proprios no original grego)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Jesus', 'Iesous'),
  readable_pt = REPLACE(readable_pt, 'Jesus', 'Iesous')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%Jesus%';

-- "Cristo" → "Christos" (titulo grego)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Cristo', 'Christos'),
  readable_pt = REPLACE(readable_pt, 'Cristo', 'Christos')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%Cristo%';

-- "Deus" → "Theos" (NT)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Deus', 'Theos'),
  readable_pt = REPLACE(readable_pt, 'Deus', 'Theos')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%Deus%';

-- "Senhor" → "Kyrios" (NT)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Senhor', 'Kyrios'),
  readable_pt = REPLACE(readable_pt, 'Senhor', 'Kyrios')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%Senhor%';

-- ============================================================
-- PASSO 1d: Correcao nome do livro 66
-- ============================================================

UPDATE books SET name_pt = 'Desvelacao' WHERE code = 'REV';

-- ============================================================
-- PASSO 1e: Correcao tokens AT com gloss errado
-- ============================================================

-- Tokens AT onde normalized eh Elohim mas pt_literal diz "Deus"
UPDATE tokens SET pt_literal = 'Elohim'
WHERE normalized LIKE '%אלהים%' AND pt_literal = 'Deus';
