-- ============================================================
-- fix-editorial-v3.sql
-- Biblia Belem An.C 2025 - Varredura Editorial (3a rodada)
-- Correcao: duplicacoes Elohim e senhor divino residual
-- Data: 2026-02-08
-- ============================================================

-- ============================================================
-- FASE 1: Corrigir triplicacoes ANTES das duplicacoes
-- ============================================================

-- "Elohim Elohim Elohim" → "Elohim" (2 ocorrencias, ex: GEN 20:17)
-- Artefato: glossary-rebuild + fix-designations empilharam 3x
UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Elohim Elohim Elohim', 'Elohim'),
  readable_pt = REPLACE(readable_pt, 'Elohim Elohim Elohim', 'Elohim')
WHERE literal_pt LIKE '%Elohim Elohim Elohim%';

-- ============================================================
-- FASE 2: Corrigir duplicacoes "Elohim Elohim" → "Elohim"
-- 150 ocorrencias no AT, artefato do glossary-rebuild
-- O hebraico tem apenas um אלהים por posicao
-- NOTA: NT duplicacoes (Theos Theos, Kyrios Kyrios) sao
-- LEGITIMAS (formas gramaticais distintas no grego)
-- ============================================================

UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'Elohim Elohim', 'Elohim'),
  readable_pt = REPLACE(readable_pt, 'Elohim Elohim', 'Elohim')
WHERE literal_pt LIKE '%Elohim Elohim%';

-- ============================================================
-- FASE 3: JOS 3:11 - "senhor-de todo a-terra" → "adon-de"
-- Hebraico: אָדוֹן כָּל הָאָרֶץ (adon kol ha-aretz)
-- Contexto divino (arca da alianca do Adon de toda a terra)
-- Similar ao JOS 3:13 ja corrigido no v2
-- ============================================================

UPDATE verse_translations SET
  literal_pt = REPLACE(literal_pt, 'senhor-de todo a-terra', 'adon-de todo a-terra'),
  readable_pt = REPLACE(readable_pt, 'senhor-de todo a-terra', 'adon-de todo a-terra')
WHERE id = 23266;

-- ============================================================
-- FIM
-- ============================================================
