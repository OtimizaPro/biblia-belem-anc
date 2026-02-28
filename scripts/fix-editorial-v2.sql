-- ============================================================
-- fix-editorial-v2.sql
-- Biblia Belem An.C 2025 - Varredura Editorial (2a rodada)
-- Padrao: ipsis litteris (keep_original.json)
-- Data: 2026-02-08
-- ============================================================

-- ============================================================
-- FASE 1: CORRECOES CRITICAS
-- ============================================================

-- ------------------------------------------------------------
-- 1a. "espírito santo" → "pneuma hagion" (NT, 7 ocorrencias)
-- Grego: πνεῦμα ἅγιον = Pneuma Hagion
-- DEVE rodar ANTES das substituicoes gerais de espírito
-- ------------------------------------------------------------
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'espírito santo', 'pneuma hagion'),
  readable_pt = REPLACE(readable_pt, 'espírito santo', 'pneuma hagion')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND (literal_pt LIKE '%espírito santo%' OR readable_pt LIKE '%espírito santo%');

-- Variante com maiuscula
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Espírito Santo', 'Pneuma Hagion'),
  readable_pt = REPLACE(readable_pt, 'Espírito Santo', 'Pneuma Hagion')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND (literal_pt LIKE '%Espírito Santo%' OR readable_pt LIKE '%Espírito Santo%');

-- ------------------------------------------------------------
-- 1b. Padroes compostos "espírito...santo" com artigos/preposicoes
-- Grego preserva artigos: τοῦ πνεύματος τοῦ ἁγίου, etc.
-- ------------------------------------------------------------

-- "do-espírito do-santo" → "do-pneuma do-hagion"
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'do-espírito do-santo', 'do-pneuma do-hagion'),
  readable_pt = REPLACE(readable_pt, 'do-espírito do-santo', 'do-pneuma do-hagion')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%do-espírito do-santo%';

-- "do-espírito o do-santo" → "do-pneuma o do-hagion"
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'do-espírito o do-santo', 'do-pneuma o do-hagion'),
  readable_pt = REPLACE(readable_pt, 'do-espírito o do-santo', 'do-pneuma o do-hagion')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%do-espírito o do-santo%';

-- "Espírito no-santo" → "Pneuma no-hagion"
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Espírito no-santo', 'Pneuma no-hagion'),
  readable_pt = REPLACE(readable_pt, 'Espírito no-santo', 'Pneuma no-hagion')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%Espírito no-santo%';

-- "Espírito o no-santo" → "Pneuma o no-hagion"
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Espírito o no-santo', 'Pneuma o no-hagion'),
  readable_pt = REPLACE(readable_pt, 'Espírito o no-santo', 'Pneuma o no-hagion')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%Espírito o no-santo%';

-- "espírito o santo" → "pneuma o hagion"
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'espírito o santo', 'pneuma o hagion'),
  readable_pt = REPLACE(readable_pt, 'espírito o santo', 'pneuma o hagion')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%espírito o santo%';

-- "espírito era santo" → "pneuma era hagion" (LUK 2:25)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'espírito era santo', 'pneuma era hagion'),
  readable_pt = REPLACE(readable_pt, 'espírito era santo', 'pneuma era hagion')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%espírito era santo%';

-- ------------------------------------------------------------
-- 1c. "Todo-Poderoso" → "Pantokrator" (NT, 9 ocorrencias)
-- Grego: Παντοκράτωρ = Pantokrator
-- ------------------------------------------------------------
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Todo-Poderoso', 'Pantokrator'),
  readable_pt = REPLACE(readable_pt, 'Todo-Poderoso', 'Pantokrator')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%Todo-Poderoso%';

-- ============================================================
-- FASE 2: SUBSTITUICAO GERAL espírito → pneuma (NT)
-- Pneuma (Πνεῦμα) listado em keep_original.json como designacao
-- Roda APOS as correcoes compostas da Fase 1
-- ============================================================

-- "Espírito" maiusculo → "Pneuma" (NT, ~88 restantes)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Espírito', 'Pneuma'),
  readable_pt = REPLACE(readable_pt, 'Espírito', 'Pneuma')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%Espírito%';

-- "espírito" minusculo → "pneuma" (NT, ~225 restantes)
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'espírito', 'pneuma'),
  readable_pt = REPLACE(readable_pt, 'espírito', 'pneuma')
WHERE verse_id IN (
  SELECT v.id FROM verses v JOIN books b ON v.book_id = b.id WHERE b.testament = 'NT'
) AND literal_pt LIKE '%espírito%';

-- ============================================================
-- FASE 3: CORRECAO PONTUAL AT
-- ============================================================

-- JOS 3:13 - "senhor" → "adon" (hebraico אָדוֹן = adon)
-- Contexto: "yhwh adon kol ha-aretz"
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'yhwh senhor todo a-terra', 'yhwh adon todo a-terra'),
  readable_pt = REPLACE(readable_pt, 'yhwh senhor todo a-terra', 'yhwh adon todo a-terra')
WHERE id = 23331;

-- ============================================================
-- FIM
-- ============================================================
